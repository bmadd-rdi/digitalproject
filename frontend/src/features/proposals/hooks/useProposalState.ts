import { useGetDraft, useGetProposal } from "./useProposalDraftQuery";
import { chooseProposalState, type ProposalState as ProposalDataState } from "./proposal-state";

export type ProposalState =
  | { status: "loading" }
  | { status: "error"; error: unknown }
  | ProposalDataState;

export { chooseProposalState } from "./proposal-state";

export function useProposalState(
  projectId: string | undefined,
  options: { preferEditableDraft?: boolean } = {},
): ProposalState {
  const draftQuery = useGetDraft(projectId);
  const proposalQuery = useGetProposal(projectId);

  if (draftQuery.isLoading || proposalQuery.isLoading) return { status: "loading" };
  if (draftQuery.isError) return { status: "error", error: draftQuery.error };
  if (proposalQuery.isError) return { status: "error", error: proposalQuery.error };
  return chooseProposalState({
    draft: draftQuery.data,
    submitted: proposalQuery.data,
    preferEditableDraft: options.preferEditableDraft,
  });
}
