import { useCallback, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { ProposalDraftValues } from "../types";
import { useProposalFormStore } from "../stores/useProposalFormStore";
import { useAutoSaveDraft, useUpdateSubmittedProposal } from "./useProposalMutations";
import { CLIENT_API_BASE } from "@/lib/client-api";

const API_BASE = CLIENT_API_BASE;
// Wait until the user has been idle for two seconds before writing. Keeping
// this value in one place makes the request-rate guarantee explicit.
const DEBOUNCE_MS = 2000;

function serializeFormValue(value: unknown): unknown {
  if (typeof File !== "undefined" && value instanceof File) return undefined;
  if (typeof Blob !== "undefined" && value instanceof Blob) return undefined;
  if (Array.isArray(value)) return value.map(serializeFormValue);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [key, serializeFormValue(child)]),
  );
}

function toDraftRequest(formPayload: Record<string, unknown>) {
  const sanitizedPayload = { ...formPayload };
  delete sanitizedPayload.totalBudget;
  delete sanitizedPayload.latestApprovedBudget;
  const request: Record<string, unknown> = { draftPayload: sanitizedPayload };
  for (const key of ["projectName", "objective"]) {
    if (sanitizedPayload[key] !== undefined) request[key] = sanitizedPayload[key];
  }
  return request;
}

function getChangedPayload(
  current: Record<string, unknown>,
  previous: Record<string, unknown> | null,
): Record<string, unknown> {
  // The first successful save establishes the baseline. Until then, the
  // complete partial form is required to create a useful server snapshot.
  if (!previous) return current;

  const changed: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of keys) {
    const currentValue = current[key];
    const previousValue = previous[key];

    // Stringifying each field gives us a deep comparison for nested step
    // values without introducing another dependency into the form bundle.
    if (JSON.stringify(currentValue) !== JSON.stringify(previousValue)) {
      // JSON omits undefined values. Sending null for a cleared field makes
      // the change explicit to the PATCH endpoint instead of silently
      // preserving the old server value.
      changed[key] = currentValue === undefined ? null : currentValue;
    }
  }

  return changed;
}

export type AutoSaveHandle = {
  flush: () => Promise<boolean>;
};

export const useAutoSaveForm = (
  projectId: string | undefined,
  disabled = false,
  mode: "draft" | "submitted" = "draft",
): AutoSaveHandle => {
  const { watch } = useFormContext<ProposalDraftValues>();
  const { setLastSavedAt } = useProposalFormStore();
  const { mutateAsync: saveDraftAsync } = useAutoSaveDraft(projectId);
  const { mutateAsync: saveSubmittedAsync } = useUpdateSubmittedProposal(projectId);
  const saveAsync = mode === "submitted" ? saveSubmittedAsync : saveDraftAsync;
  const latestSaveRef = useRef(saveAsync);
  const latestPayloadRef = useRef<Record<string, unknown> | null>(null);
  const latestSerializedRef = useRef("");
  const lastSavedSerializedRef = useRef("");
  const lastSavedPayloadRef = useRef<Record<string, unknown> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef<Promise<boolean> | null>(null);
  const flushRef = useRef<() => Promise<boolean>>(async () => true);

  const flush = useCallback(() => flushRef.current(), []);

  useEffect(() => {
    latestSaveRef.current = saveAsync;
  }, [saveAsync]);

  useEffect(() => {
    if (disabled || !projectId) {
      flushRef.current = async () => true;
      return;
    }

    let mounted = true;

    const saveLatest = async (): Promise<boolean> => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const payload = latestPayloadRef.current;
      const serialized = latestSerializedRef.current;
      if (!payload || !serialized || serialized === lastSavedSerializedRef.current) return true;

      // If a request is already running, wait for it and then save the latest
      // snapshot. This prevents older requests from racing newer form values.
      if (inFlightRef.current) {
        const running = inFlightRef.current;
        return running.then(async (result) => {
          if (latestSerializedRef.current !== lastSavedSerializedRef.current) {
            return saveLatest();
          }
          return result;
        });
      }

      const changedPayload = getChangedPayload(payload, lastSavedPayloadRef.current);
      if (Object.keys(changedPayload).length === 0) {
        // Keep both guards synchronized even when a field-level comparison
        // determines that there is nothing to send.
        lastSavedSerializedRef.current = serialized;
        lastSavedPayloadRef.current = payload;
        return true;
      }

      const request = (async () => {
        try {
          // The backend merges draftPayload, so only changed top-level fields
          // need to cross the network on subsequent autosave requests.
          await latestSaveRef.current(
            mode === "submitted" ? changedPayload : toDraftRequest(changedPayload),
          );
          // Mark the payload only after the server confirms success. Failed
          // payloads remain eligible for retry instead of being lost.
          lastSavedSerializedRef.current = serialized;
          lastSavedPayloadRef.current = payload;
          setLastSavedAt(new Date().toISOString());
          return true;
        } catch (error) {
          if (mounted) {
            toast.error("Draft save failed", {
              description: error instanceof Error
                ? error.message
                : "Your changes could not be saved. Please try again.",
            });
          }
          return false;
        } finally {
          inFlightRef.current = null;
        }
      })();

      inFlightRef.current = request;
      return request;
    };

    const scheduleSave = (delay = DEBOUNCE_MS) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        void saveLatest();
      }, delay);
    };

    const saveLatestForUnload = () => {
      const payload = latestPayloadRef.current;
      const serialized = latestSerializedRef.current;
      if (!payload || !serialized || serialized === lastSavedSerializedRef.current) return;

      const changedPayload = getChangedPayload(payload, lastSavedPayloadRef.current);
      if (Object.keys(changedPayload).length === 0) return;

      const endpoint = mode === "submitted"
        ? `${API_BASE}/proposals/projects/${projectId}`
        : `${API_BASE}/proposals/projects/${projectId}/draft`;
      const body = mode === "submitted" ? changedPayload : toDraftRequest(changedPayload);

      void fetch(endpoint, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => undefined);
    };

    const subscription = watch((value) => {
      const payload = serializeFormValue(value) as Record<string, unknown>;
      latestPayloadRef.current = payload;
      latestSerializedRef.current = JSON.stringify(payload);
      scheduleSave();
    });

    flushRef.current = saveLatest;
    window.addEventListener("pagehide", saveLatestForUnload);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("pagehide", saveLatestForUnload);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Flush on route changes/unmount so Save Draft does not depend solely on
      // pagehide firing. The mutation is allowed to finish after unmount.
      void saveLatest();

      if (flushRef.current === saveLatest) flushRef.current = async () => true;
      mounted = false;
    };
  }, [disabled, mode, projectId, setLastSavedAt, watch]);

  return { flush };
};
