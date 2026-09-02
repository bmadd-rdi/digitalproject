// src/features/proposals/hooks/useProposalMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useProposalFormStore } from "../stores/useProposalFormStore";
import { CLIENT_API_BASE } from "@/lib/client-api";
import {
  normalizeProposalPatchPayload,
  proposalSubmitPayloadSchema,
  toProposalSubmitPayload,
} from "../utils/proposal-payload";

const API_BASE = CLIENT_API_BASE;

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
async function apiFetch(url: string, options: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(
      new Error(formatApiError(json)),
      { status: res.status, data: json },
    );
  }
  return json;
}

function formatApiError(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "API error";

  const body = payload as Record<string, unknown>;
  const nestedError = body.error && typeof body.error === "object"
    ? body.error as Record<string, unknown>
    : undefined;
  const rawMessage = body.message ?? nestedError?.message ?? body.error;

  if (typeof rawMessage !== "string") return "API error";

  try {
    const issues = JSON.parse(rawMessage) as Array<{
      path?: unknown;
      message?: unknown;
    }>;

    if (Array.isArray(issues)) {
      const details = issues
        .map((issue) => {
          const path = Array.isArray(issue.path) ? issue.path.join(".") : "form";
          return `${path}: ${String(issue.message ?? "Invalid value")}`;
        })
        .join("; ");

      if (details) return `Submission validation failed: ${details}`;
    }
  } catch {
    // The API may return a normal, non-JSON error message.
  }

  return rawMessage;
}

function requireProjectId(projectId: string | undefined) {
  if (!projectId) throw new Error("projectId is required");
  return projectId;
}

export function normalizeProposalSubmissionPayload(payload: Record<string, unknown>) {
  return toProposalSubmitPayload(payload);
}

// ---------------------------------------------------------------------------
// 1. Initialize Draft (POST)
//    Creates empty draft if not already present — idempotent.
// ---------------------------------------------------------------------------
export function useInitializeDraft(projectId: string | undefined) {
  return useMutation({
    mutationFn: () =>
      apiFetch(`${API_BASE}/proposals/projects/${requireProjectId(projectId)}/draft`, {
        method: "POST",
        body: "{}",
      }),
    onError: (error) => {
      console.error("[useInitializeDraft] Failed to initialize draft:", error);
    },
  });
}

// ---------------------------------------------------------------------------
// 2. Auto-Save Draft (PATCH)
//    Called by useAutoSaveForm after debounce.
// ---------------------------------------------------------------------------
export function useAutoSaveDraft(projectId: string | undefined) {
  const { setSaveStatus } = useProposalFormStore();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch(`${API_BASE}/proposals/projects/${requireProjectId(projectId)}/draft`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onMutate: () => {
      setSaveStatus("saving");
    },
    onSuccess: async (response) => {
      setSaveStatus("saved");

      if (!projectId) return;

      // Keep the selected draft query in sync immediately so returning to the
      // wizard never renders the previous cached payload while a refetch runs.
      if (response?.data) {
        qc.setQueryData(["proposals", "draft", projectId], { data: response.data });
      }

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["proposals", "draft", projectId] }),
        qc.invalidateQueries({ queryKey: ["proposals", "submitted", projectId] }),
        qc.invalidateQueries({ queryKey: ["project", projectId] }),
        qc.invalidateQueries({ queryKey: ["proposals"] }),
      ]);
    },
    onError: (error) => {
      console.warn("[useAutoSaveDraft] Auto-save failed:", error);
      setSaveStatus("error");
    },
  });
}

// ---------------------------------------------------------------------------
// 3. Secretary submitted-proposal update (PATCH)
// ---------------------------------------------------------------------------
export function useUpdateSubmittedProposal(projectId: string | undefined) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch(`${API_BASE}/proposals/projects/${requireProjectId(projectId)}`, {
        method: "PATCH",
        body: JSON.stringify(normalizeProposalPatchPayload(payload)),
      }),
    onSuccess: async (response) => {
      if (!projectId) return;

      if (response?.data) {
        qc.setQueryData(["proposals", "submitted", projectId], response);
      }

      await Promise.all([
        qc.invalidateQueries({ queryKey: ["proposals", "submitted", projectId] }),
        qc.invalidateQueries({ queryKey: ["project", projectId] }),
      ]);
    },
  });
}

// ---------------------------------------------------------------------------
// 4. Submit Proposal (POST)
//    Final submission with strict validation on the backend.
// ---------------------------------------------------------------------------
export function useSubmitProposal(projectId: string | undefined) {
  const { resetForm } = useProposalFormStore();
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      const normalized = normalizeProposalSubmissionPayload(payload);
      const parsed = proposalSubmitPayloadSchema.safeParse(normalized);
      if (!parsed.success) {
        const details = parsed.error.issues
          .map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`)
          .join("; ");
        throw new Error(`Submission validation failed: ${details}`);
      }

      return apiFetch(`${API_BASE}/proposals/projects/${requireProjectId(projectId)}/submit`, {
        method: "POST",
        body: JSON.stringify(parsed.data),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proposals", "draft", projectId] });
      qc.invalidateQueries({ queryKey: ["proposals", "submitted", projectId] });
      qc.invalidateQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["proposals"] });

      resetForm();
      if (projectId) router.push(`/projects/${projectId}`);
    },
    onError: (error) => {
      console.error("[useSubmitProposal] Submission failed:", error);
      console.error("[useSubmitProposal] Backend response:", (error as Error & { data?: unknown }).data);
    },
  });
}
