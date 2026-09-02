"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  assignProjectAction,
  bulkAssignProjectsAction,
  getAnalystWorkloadsAction,
  getAssignmentProjectsAction,
  type AssignmentProjectQuery,
  type AssignProjectPayload,
  type BulkAssignProjectPayload,
} from "../actions/assignment.actions";

const invalidateAssignmentQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  projectIds: string[] = [],
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["projects", "assignment-pending"] }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
    queryClient.invalidateQueries({ queryKey: ["users", "analysts", "workload"] }),
    ...projectIds.map((projectId) =>
      queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
    ),
  ]);
};

export function useAssignmentPendingProjects(query: AssignmentProjectQuery) {
  return useQuery({
    queryKey: [
      "projects",
      "assignment-pending",
      query.page ?? 1,
      query.limit ?? 20,
      query.search ?? "",
    ],
    queryFn: () => getAssignmentProjectsAction(query),
    placeholderData: keepPreviousData,
  });
}

export function useAnalystWorkloads() {
  return useQuery({
    queryKey: ["users", "analysts", "workload"],
    queryFn: getAnalystWorkloadsAction,
    staleTime: 30_000,
  });
}

export function useAssignProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: {
      projectId: string;
      payload: AssignProjectPayload;
    }) => assignProjectAction(projectId, payload),
    onSuccess: (_data, variables) =>
      invalidateAssignmentQueries(queryClient, [variables.projectId]),
  });
}

export function useBulkAssignProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkAssignProjectPayload) =>
      bulkAssignProjectsAction(payload),
    onSuccess: (_data, variables) =>
      invalidateAssignmentQueries(queryClient, variables.projectIds),
  });
}
