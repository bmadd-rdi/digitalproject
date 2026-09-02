"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { useAgendas } from "./useAgendas";
import { Agenda, AgendaType, Resolution, ResolutionStatus } from "../types";
import { useHasRole } from "@/features/auth/RoleContext";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${CLIENT_API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(payload.message ?? payload.error ?? "ไม่สามารถบันทึกมติได้"), {
      status: response.status,
      data: payload,
    });
  }
  return payload as T;
}

export function useResolutions(meetingId: string) {
  const queryClient = useQueryClient();
  const isSuperAdmin = useHasRole("super_admin");
  const { agendas, isLoading, isError } = useAgendas(meetingId);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string | null>(null);
  const [draftEdit, setDraftEdit] = useState<{ agendaId: string; value: Resolution } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const effectiveSelectedAgendaId = useMemo(
    () => selectedAgendaId && agendas.some((item) => item.agenda_id === selectedAgendaId)
      ? selectedAgendaId
      : agendas[0]?.agenda_id ?? null,
    [agendas, selectedAgendaId],
  );
  const selectedAgenda = agendas.find((item) => item.agenda_id === effectiveSelectedAgendaId) ?? null;

  const draft = useMemo(() => draftEdit && draftEdit.agendaId === selectedAgenda?.agenda_id
    ? draftEdit.value
    : selectedAgenda?.resolution ?? (selectedAgenda ? {
        resolution_id: "",
        agenda_id: selectedAgenda.agenda_id,
        resolution_status: null,
        comment: "",
        version: 1,
      } : null), [draftEdit, selectedAgenda]);

  const saveMutation = useMutation({
    mutationFn: async (resolution: Resolution) => {
      if (!selectedAgenda) throw new Error("กรุณาเลือกวาระการประชุม");
      const existing = selectedAgenda.resolution;
      const correctionReason = existing && isSuperAdmin
        ? window.prompt("กรุณาระบุเหตุผลในการแก้ไขมติ")
        : null;
      if (existing && isSuperAdmin && !correctionReason?.trim()) {
        throw new Error("กรุณาระบุเหตุผลในการแก้ไขมติ");
      }
      const path = existing && isSuperAdmin
        ? `/admin/resolutions/${existing.resolution_id}/correct`
        : `/meetings/${meetingId}/agendas/${selectedAgenda.agenda_id}/resolution`;
      return request(path, {
        method: existing && !isSuperAdmin ? "PATCH" : "POST",
        body: JSON.stringify({
          resolutionType: resolution.resolution_status,
          remark: resolution.comment.trim() || null,
          ...(existing ? { version: existing.version ?? 1 } : {}),
          ...(correctionReason ? { reason: correctionReason.trim() } : {}),
        }),
      });
    },
    onSuccess: async () => {
      setHasUnsavedChanges(false);
      setDraftEdit(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "agendas"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", meetingId] }),
        queryClient.invalidateQueries({ queryKey: ["meetings"] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]);
    },
    onError: async (error: Error & { status?: number }) => {
      if (error.status === 409) {
        await queryClient.invalidateQueries({ queryKey: ["meetings", meetingId, "agendas"] });
      }
    },
  });

  const updateResolutionStatus = useCallback((status: ResolutionStatus | null) => {
    if (!selectedAgenda || !draft) return;
    setDraftEdit({ agendaId: selectedAgenda.agenda_id, value: { ...draft, resolution_status: status } });
    setHasUnsavedChanges(true);
  }, [draft, selectedAgenda]);
  const updateResolutionComment = useCallback((comment: string) => {
    if (!selectedAgenda || !draft) return;
    setDraftEdit({ agendaId: selectedAgenda.agenda_id, value: { ...draft, comment } });
    setHasUnsavedChanges(true);
  }, [draft, selectedAgenda]);

  return {
    agendas,
    selectedAgendaId: effectiveSelectedAgendaId,
    selectedAgenda,
    selectAgenda: (agendaId: string) => {
      setSelectedAgendaId(agendaId);
      setDraftEdit(null);
      setHasUnsavedChanges(false);
    },
    resolution: draft,
    updateResolutionStatus,
    updateResolutionComment,
    saveResolution: () => draft?.resolution_status && saveMutation.mutate(draft),
    isSaving: saveMutation.isPending,
    saveError: saveMutation.error,
    hasUnsavedChanges,
    getResolutionForAgenda: (agendaId: string) =>
      agendas.find((item) => item.agenda_id === agendaId)?.resolution ?? null,
    isConsiderationAgenda: (agenda: Agenda) =>
      agenda.agenda_type === AgendaType.FOLLOW_UP || agenda.agenda_type === AgendaType.FOR_CONSIDERATION,
    meetingId,
    isLoading,
    isError,
  };
}
