import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ProposalFormState {
  currentStep: number;
  lastSavedAt: string | null;
  stepErrors: number[];
  saveStatus: SaveStatus;
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
  currentStep: 1,
  lastSavedAt: null,
  stepErrors: [],
  saveStatus: "idle" as const,
};

export const useProposalFormStore = create<ProposalFormState>()(
  persist(
    (set) => ({
      ...initialState,
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
      resetForm: () => set(initialState),
    }),
    {
      name: "bma-project-form-draft",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepErrors: state.stepErrors,
      }),
    },
  ),
);
