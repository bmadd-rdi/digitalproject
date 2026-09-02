"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAnalystAssignedProjectsAction,
  requestAnalystReassignmentAction,
  reviewAnalystProjectAction,
  type AnalystAssignedProjectQuery,
  type AnalystReassignmentPayload,
  type AnalystReviewPayload,
} from "../actions/analyst.actions";

const invalidateAnalystQueries = async (
  queryClient: ReturnType<typeof useQueryClient>,
  projectId?: string,
) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["projects", "analyst-assigned"] }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
    ...(projectId
      ? [
          queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
          queryClient.invalidateQueries({ queryKey: ["proposals", "draft", projectId] }),
          queryClient.invalidateQueries({ queryKey: ["proposals", "submitted", projectId] }),
          queryClient.invalidateQueries({ queryKey: ["meetings"] }),
        ]
      : []),
  ]);
};

export function useAnalystAssignedProjects(query: AnalystAssignedProjectQuery) {
  return useQuery({
    queryKey: [
      "projects",
      "analyst-assigned",
      query.page ?? 1,
      query.limit ?? 20,
      query.search ?? "",
    ],
    queryFn: () => getAnalystAssignedProjectsAction(query),
    placeholderData: keepPreviousData,
  });
}

export function useRequestAnalystReassignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: AnalystReassignmentPayload }) =>
      requestAnalystReassignmentAction(projectId, payload),
    onSuccess: (_data, variables) => invalidateAnalystQueries(queryClient, variables.projectId),
  });
}

export function useAnalystDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: AnalystReviewPayload }) =>
      reviewAnalystProjectAction(projectId, payload),
    onSuccess: (_data, variables) => invalidateAnalystQueries(queryClient, variables.projectId),
  });
}
