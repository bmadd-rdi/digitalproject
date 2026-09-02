// src/features/projects/hooks/useProjectWorkspace.ts
import { useQuery } from "@tanstack/react-query";
import { getProjectByIdAction } from "../actions/project.actions";
import type { ProjectDetail } from "../types/workspace";

export function useProjectWorkspace(projectId: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectByIdAction(projectId),
    enabled: !!projectId,
    refetchOnMount: "always",
  });

  // นำข้อมูลจาก Backend มาประกอบร่างกับ hasProposal ให้ตรงกับ Type ProjectDetail
  const projectDetail: ProjectDetail | null = data ? {
    ...data,
    // เช็คว่าเคยมี Proposal หรือยัง (เช่น ถ้า Status > 1 แปลว่าเคยยื่นร่างแล้ว)
    hasProposal: data.projectStatusId !== null && data.projectStatusId > 1,
  } : null;

  return {
    projectDetail,
    isLoading,
    isError,
    error,
  };
}
