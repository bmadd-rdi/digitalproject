"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getPublicProjectAction,
  getPublicProjectsAction,
} from "../actions/public-project.actions";

export function usePublicProjects({ page, search }: { page: number; search: string }) {
  return useQuery({
    queryKey: ["public-projects", page, search],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (search.trim()) params.set("search", search.trim());
      return getPublicProjectsAction(params.toString());
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function usePublicProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ["public-project", projectId],
    queryFn: () => getPublicProjectAction(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60_000,
  });
}
