import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ProposalFormState {
  projectId: string | null;
  currentStep: number;
  lastSavedAt: string | null;
  stepErrors: number[];
  saveStatus: SaveStatus;
  setProjectId: (projectId: string | null) => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setLastSavedAt: (timestamp: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  resetForm: () => void;
  setStepErrors: (errors: number[]) => void;
  addStepError: (step: number) => void;
  removeStepError: (step: number) => void;
}

const initialState = {
  projectId: null as string | null,
  currentStep: 1,
  lastSavedAt: null,
  stepErrors: [],
  saveStatus: "idle" as const,
};

// currentStep/stepErrors used to persist under one shared localStorage key
// for every project, so switching projects could leak one project's step/
// error state into another. zustand's persist storage callbacks only ever
// receive the fixed `name` string below (they have no access to the store's
// own state), so we track the active project here and fold it into the real
// storage key ourselves. With no active project, reads/writes are no-ops —
// we never want to fall back to the old unscoped shared key again.
let activeProjectId: string | null = null;

function scopedKey(name: string): string | null {
  return activeProjectId ? `${name}-${activeProjectId}` : null;
}

const projectScopedStorage: StateStorage = {
  getItem: (name) => {
    const key = scopedKey(name);
    return key ? localStorage.getItem(key) : null;
  },
  setItem: (name, value) => {
    const key = scopedKey(name);
    if (key) localStorage.setItem(key, value);
  },
  removeItem: (name) => {
    const key = scopedKey(name);
    if (key) localStorage.removeItem(key);
  },
};


export const useProposalFormStore = create<ProposalFormState>()(
  persist(
    (set) => ({
      ...initialState,
      setProjectId: (projectId) => {
        if (projectId === activeProjectId) return;
        activeProjectId = projectId;
        // Clear in-memory step/error state immediately so the previous
        // project's values never flash for the new one. The caller (the
        // wizard, right after setProjectId) is expected to follow up with
        // useProposalFormStore.persist.rehydrate() to load this project's
        // own saved step/errors, if any exist in localStorage.
        set({ ...initialState, projectId });
      },
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () =>
        set((state) => ({
          currentStep: state.currentStep > 1 ? state.currentStep - 1 : 1,
        })),
      setLastSavedAt: (timestamp) => set({ lastSavedAt: timestamp }),
      setSaveStatus: (status) => set({ saveStatus: status }),
      setStepErrors: (errors) => set({ stepErrors: errors }),
      addStepError: (step) =>
        set((state) => ({
          stepErrors: state.stepErrors.includes(step)
            ? state.stepErrors
            : [...state.stepErrors, step],
        })),
      removeStepError: (step) =>
        set((state) => ({
          stepErrors: state.stepErrors.filter((current) => current !== step),
        })),
      // resetForm: () => set(initialState),
      resetForm: () => set({ ...initialState, projectId: activeProjectId }),
    }),
    {
      name: "bma-project-form-draft",
      // storage: createJSONStorage(() => localStorage),
      storage: createJSONStorage(() => projectScopedStorage),
      skipHydration: true,
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepErrors: state.stepErrors,
      }),
    },
  ),
);
