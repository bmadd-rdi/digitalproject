"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Agenda,
  AgendaType,
  AGENDA_TYPE_LABELS,
  AGENDA_TYPE_ORDER,
  GroupedAgendas,
  Project,
} from "../types";
import { CLIENT_API_BASE } from "@/lib/client-api";

const API_BASE = CLIENT_API_BASE;

type ApiAgenda = {
  id: string;
  meetingId: string;
  projectId: string | null;
  agendaNumber: string;
  sortOrder: number;
  agendaTypeId: number;
  title: string;
  description: string | null;
  project?: {
    id: string;
    projectCode: string | null;
    projectName: string | null;
    latestRequestedBudget: string | null;
    projectStatusId: number;
  } | null;
  resolution?: {
    id: string;
    resolutionType: import("../types").ResolutionStatus | null;
    remark: string | null;
    version: number;
  } | null;
};

export type CreateAgendaPayload = {
  meetingId: string;
  projectId?: string | null;
  agendaNumber: string;
  sortOrder?: number;
  agendaTypeId: AgendaType;
  title: string;
  description?: string | null;
};

export type UpdateAgendaPayload = Partial<Omit<CreateAgendaPayload, "meetingId">>;
export type EligibleProjectQuery = {
  search?: string;
  sortBy?: "projectCode" | "projectName" | "latestRequestedBudget";
  sortOrder?: "asc" | "desc";
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(payload.message ?? payload.error ?? "ไม่สามารถจัดการวาระการประชุมได้"), {
      status: response.status,
      data: payload,
    });
  }
  return payload as T;
}

function normalizeProject(project: ApiAgenda["project"]): Project | null {
  if (!project?.id) return null;
  return {
    project_id: project.id,
    project_code: project.projectCode ?? "-",
    name: project.projectName ?? "ไม่ระบุชื่อโครงการ",
    agency: "-",
    budget: Number(project.latestRequestedBudget ?? 0),
    description: "",
    objective: "",
    start_date: "",
    end_date: "",
    status: "",
  };
}

function normalizeAgenda(agenda: ApiAgenda): Agenda {
  return {
    agenda_id: agenda.id,
    meeting_id: agenda.meetingId,
    project_id: agenda.projectId,
    agenda_number: agenda.agendaNumber,
    sort_order: agenda.sortOrder,
    agenda_type: agenda.agendaTypeId as AgendaType,
    title: agenda.title,
    description: agenda.description ?? "",
    project: normalizeProject(agenda.project),
    resolution: agenda.resolution ? {
      resolution_id: agenda.resolution.id,
      agenda_id: agenda.id,
      resolution_status: agenda.resolution.resolutionType,
      comment: agenda.resolution.remark ?? "",
      version: agenda.resolution.version,
    } : null,
  };
}

async function fetchAgendas(meetingId: string) {
  const response = await request<{ data: ApiAgenda[] }>(`/meetings/${meetingId}/agendas`);
  return response.data.map(normalizeAgenda);
}

async function fetchProjects(meetingId: string, query: EligibleProjectQuery) {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortOrder) params.set("sortOrder", query.sortOrder);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const response = await request<{ data: Array<{
    id: string;
    projectCode?: string | null;
    projectName?: string | null;
    latestRequestedBudget?: string | null;
    projectStatusId: number;
  }> }>(`/meetings/${meetingId}/eligible-projects${suffix}`);

  return response.data.map((project) => ({
    project_id: project.id,
    project_code: project.projectCode ?? "-",
    name: project.projectName ?? "ไม่ระบุชื่อโครงการ",
    agency: "-",
    budget: Number(project.latestRequestedBudget ?? 0),
    description: "",
    objective: "",
    start_date: "",
    end_date: "",
    status: String(project.projectStatusId),
  }));
}

export function useAgendaTypeOptions() {
  return AGENDA_TYPE_ORDER.map((id) => ({ id, label: AGENDA_TYPE_LABELS[id] }));
}

export function useAgendas(meetingId: string, eligibleQuery: EligibleProjectQuery = {}): {
  agendas: Agenda[];
  groupedAgendas: GroupedAgendas[];
  availableProjects: Project[];
  moveAgendaUp: (agendaId: string) => void;
  moveAgendaDown: (agendaId: string) => void;
  linkProject: (agendaId: string, projectId: string) => void;
  unlinkProject: (agendaId: string) => void;
  isFirstInGroup: (agendaId: string) => boolean;
  isLastInGroup: (agendaId: string) => boolean;
  meetingId: string;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  isMutating: boolean;
  refetch: () => Promise<unknown>;
} {
  const queryClient = useQueryClient();
  const agendaQuery = useQuery({
    queryKey: ["meetings", meetingId, "agendas"],
    queryFn: () => fetchAgendas(meetingId),
    enabled: !!meetingId,
    refetchOnMount: "always",
  });
  const projectQuery = useQuery({
    queryKey: ["meetings", meetingId, "eligible-projects", eligibleQuery],
    queryFn: () => fetchProjects(meetingId, eligibleQuery),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const invalidate = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "agendas"] }),
      queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "eligible-projects"] }),
    ]);
  }, [meetingId, queryClient]);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAgendaPayload }) =>
      request<{ data: ApiAgenda }>(`/meetings/${meetingId}/agendas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: invalidate,
  });

  const reorderMutation = useMutation({
    mutationFn: async (changes: Array<{ id: string; sortOrder: number }>) => {
      await request(`/meetings/${meetingId}/agendas/reorder`, {
        method: "POST",
        body: JSON.stringify({ items: changes.map(({ id, sortOrder }) => ({ agendaId: id, sortOrder })) }),
      });
    },
    onSuccess: invalidate,
  });

  const agendas = useMemo(() => agendaQuery.data ?? [], [agendaQuery.data]);
  const groupedAgendas = useMemo(() => AGENDA_TYPE_ORDER.map((type) => ({
    type,
    label: AGENDA_TYPE_LABELS[type],
    agendas: agendas.filter((agenda) => agenda.agenda_type === type),
  })).filter((group) => group.agendas.length > 0), [agendas]);

  const availableProjects = useMemo(() => {
    const linkedProjectIds = new Set(agendas.map((agenda) => agenda.project_id).filter(Boolean));
    return (projectQuery.data ?? []).filter((project) => !linkedProjectIds.has(project.project_id));
  }, [agendas, projectQuery.data]);

  const getGroupAgendas = useCallback((agendaId: string) => {
    const agenda = agendas.find((item) => item.agenda_id === agendaId);
    return agenda ? agendas.filter((item) => item.agenda_type === agenda.agenda_type) : [];
  }, [agendas]);

  const isFirstInGroup = useCallback((agendaId: string) => {
    const group = getGroupAgendas(agendaId);
    return group.length === 0 || group[0].agenda_id === agendaId;
  }, [getGroupAgendas]);

  const isLastInGroup = useCallback((agendaId: string) => {
    const group = getGroupAgendas(agendaId);
    return group.length === 0 || group[group.length - 1].agenda_id === agendaId;
  }, [getGroupAgendas]);

  const reorder = useCallback((agendaId: string, direction: -1 | 1) => {
    const agenda = agendas.find((item) => item.agenda_id === agendaId);
    if (!agenda) return;
    const group = getGroupAgendas(agendaId);
    const index = group.findIndex((item) => item.agenda_id === agendaId);
    const neighbor = group[index + direction];
    if (!neighbor) return;
    const currentSortOrder = agenda.sort_order ?? index + 1;
    const neighborSortOrder = neighbor.sort_order ?? index + direction + 1;
    reorderMutation.mutate([
      { id: agenda.agenda_id, sortOrder: neighborSortOrder },
      { id: neighbor.agenda_id, sortOrder: currentSortOrder },
    ]);
  }, [agendas, getGroupAgendas, reorderMutation]);

  const linkProject = useCallback((agendaId: string, projectId: string) => {
    updateMutation.mutate({ id: agendaId, payload: { projectId } });
  }, [updateMutation]);

  const unlinkProject = useCallback((agendaId: string) => {
    updateMutation.mutate({ id: agendaId, payload: { projectId: null } });
  }, [updateMutation]);

  return {
    agendas,
    groupedAgendas,
    availableProjects,
    moveAgendaUp: (agendaId) => reorder(agendaId, -1),
    moveAgendaDown: (agendaId) => reorder(agendaId, 1),
    linkProject,
    unlinkProject,
    isFirstInGroup,
    isLastInGroup,
    meetingId,
    isLoading: agendaQuery.isLoading || projectQuery.isLoading,
    isFetching: agendaQuery.isFetching || projectQuery.isFetching,
    isError: agendaQuery.isError || projectQuery.isError,
    error: (agendaQuery.error ?? projectQuery.error) as Error | null,
    isMutating: updateMutation.isPending || reorderMutation.isPending,
    refetch: async () => { await agendaQuery.refetch(); },
  };
}

export function useCreateAgenda(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CreateAgendaPayload, "meetingId">) => request<{ data: ApiAgenda }>(`/meetings/${meetingId}/agendas`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "agendas"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "eligible-projects"] }),
      ]);
    },
  });
}

export function useDeleteAgenda(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (agendaId: string) => request(`/meetings/${meetingId}/agendas/${agendaId}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "agendas"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "eligible-projects"] }),
      ]);
    },
  });
}

export function useBulkCreateAgendas(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { projectIds: string[]; agendaTypeId: AgendaType }) =>
      request<{ data: ApiAgenda[] }>(`/meetings/${meetingId}/agendas/bulk`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "agendas"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "eligible-projects"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId] }),
      ]);
    },
  });
}

export function useReorderAgendas(meetingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { expectedUpdatedAt: string; items: Array<{ agendaId: string; sortOrder: number }> }) =>
      request<{ data: ApiAgenda[] }>(`/meetings/${meetingId}/agendas/reorder`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "agendas"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId] }),
      ]);
    },
  });
}
