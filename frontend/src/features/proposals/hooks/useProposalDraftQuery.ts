// src/features/proposals/hooks/useProposalDraftQuery.ts
import { useQuery } from "@tanstack/react-query";
import { schemas } from "@/types/api-schemas";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { normalizeProposalForForm } from "../utils/proposal-payload";

const API_BASE = CLIENT_API_BASE;

async function fetchDraft(projectId: string) {
  const res = await fetch(`${API_BASE}/proposals/projects/${projectId}/draft`, {
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error(json.message ?? `Failed to fetch draft: ${res.status}`),
      { status: res.status, data: json },
    );
  }
  return json as { data: Record<string, unknown> | null; message?: string };
}

async function fetchSubmittedProposal(projectId: string) {
  const res = await fetch(`${API_BASE}/proposals/projects/${projectId}`, {
    credentials: "include",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error(json.message ?? `Failed to fetch proposal: ${res.status}`),
      { status: res.status, data: json },
    );
  }
  return schemas.ProposalDataResponse.parse(json);
}

/**
 * useGetDraft — fetches the current draft for a given project.
 *
 * Returns { draft, isLoading, isError }.
 * `draft` will be null if no draft exists yet.
 */
export function useGetDraft(projectId: string | undefined) {
  return useQuery({
    queryKey: ["proposals", "draft", projectId],
    queryFn: () => fetchDraft(projectId!),
    enabled: !!projectId,
    refetchOnMount: "always",
    select: (res) => {
      if (!res.data) return null;
      const draft = res.data as Record<string, unknown> & {
        draftPayload?: Record<string, unknown>;
      };
      // The API returns the draft metadata and the actual form values in
      // draftPayload. Keep the hook contract focused on form values.
      return normalizeProposalForForm(draft.draftPayload ?? draft);
    },
  });
}

export function useGetProposal(projectId: string | undefined) {
  return useQuery({
    queryKey: ["proposals", "submitted", projectId],
    queryFn: () => fetchSubmittedProposal(projectId!),
    enabled: !!projectId,
    refetchOnMount: "always",
    select: (res) => {
      if (!res.data) return null;
      return normalizeProposalForForm(res.data);
    },
  });
}
