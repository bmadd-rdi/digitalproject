"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getProjectTypesAction,
  getSecretaryPendingProjectsAction,
  reviewSecretaryProjectAction,
  type SecretaryReviewPayload,
} from "../actions/project.actions";

const SECRETARY_PAGE_SIZE = 10;

export function useSecretaryPendingProjects({
  page,
  search,
}: {
  page: number;
  search: string;
}) {
  return useQuery({
    queryKey: ["projects", "secretary-pending", page, SECRETARY_PAGE_SIZE, search],
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(SECRETARY_PAGE_SIZE),
      });
      if (search.trim()) params.set("search", search.trim());
      return getSecretaryPendingProjectsAction(params.toString());
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useSecretaryProjectTypes() {
  return useQuery({
    queryKey: ["lookups", "project-types"],
    queryFn: getProjectTypesAction,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useReviewSecretaryProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, payload }: {
      projectId: string;
      payload: SecretaryReviewPayload;
    }) => reviewSecretaryProjectAction(projectId, payload),
    onSuccess: async (response) => {
      queryClient.setQueryData(["project", response.project.id], response.project);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects", "secretary-pending"] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["project", response.project.id] }),
        queryClient.invalidateQueries({ queryKey: ["proposals", "draft", response.project.id] }),
        queryClient.invalidateQueries({ queryKey: ["proposals", "submitted", response.project.id] }),
        queryClient.invalidateQueries({ queryKey: ["timeline", response.project.id] }),
      ]);
      toast.success("บันทึกผลการตรวจสอบโครงการเรียบร้อยแล้ว");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกผลการตรวจสอบได้");
    },
  });
}

export { SECRETARY_PAGE_SIZE };
