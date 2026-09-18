// src/features/proposals/hooks/useProposalMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useProposalFormStore } from "../stores/useProposalFormStore";
import { CLIENT_API_BASE } from "@/lib/client-api";
import {
  // normalizeProposalPatchPayload, /************************************ JOJO ********************************************/
  proposalSubmitPayloadSchema,
  toProposalSubmitPayload,
} from "../utils/proposal-payload";

const API_BASE = CLIENT_API_BASE;

// Field -> wizard step map (mirrors the top-level keys of each
// proposalStepNSchema in ../types.ts). Only top-level keys matter here:
// a zod issue's path for a nested array field (e.g. ["budgetsByYear", 0,
// "amount"]) still starts with the step-owning field name.
// ---------------------------------------------------------------------------
const STEP_LABELS: Record<number, string> = {
  1: "ข้อมูลเบื้องต้นและภาพรวม",
  2: "สาระสำคัญและขอบเขตโครงการ",
  3: "สถาปัตยกรรมองค์กร",
  4: "แผนงานและรายละเอียดงบประมาณ",
  5: "ความพร้อม",
};

const FIELD_STEP_MAP: Record<string, number> = {
  // Step 1 — ข้อมูลเบื้องต้นและภาพรวม
  projectName: 1,
  agencyName: 1,
  headOfAgency: 1,
  dcioName: 1,
  projectManager: 1,
  totalBudget: 1,
  budgetsByYear: 1,
  // Step 2 — สาระสำคัญและขอบเขตโครงการ
  background: 2,
  objective: 2,
  target: 2,
  scope: 2,
  projectType: 2,
  currentSystemStatus: 2,
  currentProblems: 2,
 relatedProjects: 2,
  manpower: 2,
  existingEquipment: 2,
  // Step 3 — สถาปัตยกรรมองค์กร
  isBmaPlan: 3,
  isAgencyPlan: 3,
  agencyStrategy: 3,
  agencyIssue: 3,
  agencyKpi: 3,
  isGovernorPolicy: 3,
  governorPolicyCode: 3,
  governorPolicyName: 3,
  obstacleLaws: 3,
  appArchitecture: 3,
  dataOwner: 3,
  dataExchangePlan: 3,
  systemDiagramFile: 3,
  networkDiagramFile: 3,
  useCaseDiagramFile: 3,
  securityDiagramFile: 3,
  systemDiagramUrl: 3,
  networkDiagramUrl: 3,
  useCaseDiagramUrl: 3,
  securityDiagramUrl: 3,
  // Step 4 — แผนงานและรายละเอียดงบประมาณ
  hardwareCosts: 4,
  softwareCosts: 4,
  personnelCoreCosts: 4,
  personnelAsstCosts: 4,
  personnelSuppCosts: 4,
  personnelResponsibilities: 4,
  trainingCourses: 4,
  otherCosts: 4,
  // Step 5 — ความพร้อม
  durationDays: 5,
  ictPersonnel: 5,
  cloudRequests: 5,
  isReady: 5,
  readinessDetails: 5,
  otherReadiness: 5,
  expectedBenefits: 5,
  isInRoadmap: 5,
};

// ---------------------------------------------------------------------------

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



/************************************ JOJO ********************************************/
// ---------------------------------------------------------------------------
// 3. Secretary submitted-proposal update (PATCH)
// ---------------------------------------------------------------------------
// export function useUpdateSubmittedProposal(projectId: string | undefined) {
//   const qc = useQueryClient();

//   return useMutation({
//     mutationFn: (payload: Record<string, unknown>) =>
//       apiFetch(`${API_BASE}/proposals/projects/${requireProjectId(projectId)}`, {
//         method: "PATCH",
//         body: JSON.stringify(normalizeProposalPatchPayload(payload)),
//       }),
//     onSuccess: async (response) => {
//       if (!projectId) return;

//       if (response?.data) {
//         qc.setQueryData(["proposals", "submitted", projectId], response);
//       }

//       await Promise.all([
//         qc.invalidateQueries({ queryKey: ["proposals", "submitted", projectId] }),
//         qc.invalidateQueries({ queryKey: ["project", projectId] }),
//       ]);
//     },
//   });
// }
/************************************ JOJO ********************************************/



// ---------------------------------------------------------------------------
// 3. Submit Proposal (POST)
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
        // const details = parsed.error.issues
        //   .map((issue) => `${issue.path.join(".") || "form"}: ${issue.message}`)
        //   .join("; ");
        // throw new Error(`Submission validation failed: ${details}`);
        // const fieldErrors = parsed.error.issues.map((issue) => ({
        //   path: issue.path.join(".") || "form",
        //   message: issue.message,
        // }));
        const fieldErrors = parsed.error.issues.map((issue) => {
          const topKey = String(issue.path[0] ?? "");
          return {
            path: issue.path.join(".") || "form",
            message: issue.message,
            step: FIELD_STEP_MAP[topKey],
          };
        });
        const minStep = fieldErrors.reduce<number | undefined>(
          (min, e) => (e.step != null && (min == null || e.step < min) ? e.step : min),
          undefined,
        );


        const details = fieldErrors.map((e) => `${e.path}: ${e.message}`).join("; ");
        throw Object.assign(
          new Error(`Submission validation failed: ${details}`),
          // { isValidationError: true, fieldErrors },
          { isValidationError: true, fieldErrors, minStep },
        );
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
      // console.error("[useSubmitProposal] Backend response:", (error as Error & { data?: unknown }).data);
      const err = error as Error & {
        isValidationError?: boolean;
        // fieldErrors?: { path: string; message: string }[];
        fieldErrors?: { path: string; message: string; step?: number }[];
        minStep?: number;
        data?: { message?: string };
      };
      console.error("[useSubmitProposal] Backend response:", err.data);

      if (err.isValidationError && err.fieldErrors?.length) {
         const lines = err.fieldErrors.map((e) =>
          e.step ? `[ขั้นตอนที่ ${e.step} - ${STEP_LABELS[e.step]}] ${e.message}` : `• ${e.message}`,
        );
        toast.error("กรอกข้อมูลไม่ครบถ้วน", {
          // description: err.fieldErrors.map((e) => `• ${e.path}: ${e.message}`).join("\n"),
          description: lines.join("\n"),
        });
        return;
      }

      toast.error("ส่งโครงการไม่สำเร็จ", {
        description: err.data?.message ?? "ระบบไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง",
      });
    },
  });
}
