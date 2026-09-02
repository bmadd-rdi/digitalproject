"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  cancelSubmitProjectAction,
  updateProjectAction,
  updateProjectVisibilityAction,
  type UpdateProjectPayload,
} from "../actions/project.actions";
import { CLIENT_API_BASE } from "@/lib/client-api";

const API_BASE = CLIENT_API_BASE;

async function deleteProject(projectId: string) {
  const response = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: "DELETE",
    credentials: "include",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? payload.error ?? "Unable to delete project");
  }
  return payload;
}

export function useDeleteProject(projectId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      await queryClient.removeQueries({ queryKey: ["project", projectId] });
      router.push("/projects");
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) => updateProjectAction(projectId, payload),
    onSuccess: async (result) => {
      if (result?.project) {
        queryClient.setQueryData(["project", projectId], result.project);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]);
    },
  });
}

export function useCancelSubmitProject(projectId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => cancelSubmitProjectAction(projectId),
    onSuccess: async (result) => {
      if (result?.project) {
        queryClient.setQueryData(["project", projectId], result.project);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["proposals", "draft", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["proposals", "submitted", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["timeline", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["meetings"] }),
      ]);
      router.push(`/projects/${projectId}/proposal/create`);
      router.refresh();
    },
  });
}

export function useUpdateProjectVisibility(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isPublic: boolean) => updateProjectVisibilityAction(projectId, isPublic),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["public-projects"] }),
      ]);
    },
  });
}

export function useReopenRejectedProject(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => {
      const response = await fetch(`${API_BASE}/admin/projects/${projectId}/reopen-rejected`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw Object.assign(new Error(payload.message ?? "ไม่สามารถเปิดโครงการเพื่อแก้ไขได้"), {
          status: response.status,
          dependencies: payload.dependencies,
        });
      }
      return payload;
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["proposals", "draft", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["timeline", projectId] }),
      ]);
    },
  });
}
