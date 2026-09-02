export type ProposalState =
  | { status: "empty" }
  | { status: "draft"; data: Record<string, unknown> }
  | { status: "submitted"; data: Record<string, unknown> };

export function chooseProposalState(input: {
  draft?: Record<string, unknown> | null;
  submitted?: Record<string, unknown> | null;
  preferEditableDraft?: boolean;
}): ProposalState {
  if (input.preferEditableDraft && input.draft) return { status: "draft", data: input.draft };
  if (input.submitted) return { status: "submitted", data: input.submitted };
  if (input.draft) return { status: "draft", data: input.draft };
  return { status: "empty" };
}
