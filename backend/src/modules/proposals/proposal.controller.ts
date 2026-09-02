import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { proposalService } from "./proposal.service";
import type {
  DraftProposalDTO,
  SubmitProposalDTO,
  SubmittedProposalPatchDTO,
} from "./proposal.schema";
import { getUserContext, getUserId } from "../../shared/http/controller-helper";

export const getProposal = async (c: Context, projectId: string) => {
  const user = getUserContext(c);
  const proposal = await proposalService.getProposalByProjectId(projectId, user);
  if (!proposal)
    return c.json({ data: null, message: "No proposal found" }, 200);
  return c.json({ data: proposal }, 200);
};

export const patchSubmittedProposal = async (
  c: Context,
  projectId: string,
  body: SubmittedProposalPatchDTO,
) => {
  const user = getUserContext(c);
  const proposal = await proposalService.patchSubmittedProposal(projectId, user, body);

  return c.json(
    {
      success: true,
      message: "Submitted proposal updated successfully",
      data: proposal,
    },
    200,
  );
};

export const getDraftByProjectId = async (c: Context, projectId: string) => {
  const user = getUserContext(c);
  const draft = await proposalService.getDraftByProjectId(projectId, user);
  if (!draft) return c.json({ data: null, message: "ไม่พบข้อมูลแบบร่าง" }, 200);
  return c.json({ data: draft }, 200);
};

export const initializeDraft = async (c: Context, projectId: string) => {
  const user = getUserContext(c);
  const draft = await proposalService.initializeDraft(projectId, user);
  return c.json({ success: true, data: draft }, 201);
};

export const autoSaveDraft = async (
  c: Context,
  projectId: string,
  body: DraftProposalDTO,
) => {
  const user = getUserContext(c);
  const savedDraft = await proposalService.upsertDraft(projectId, user, body);

  return c.json(
    {
      success: true,
      message: "บันทึกแบบร่างอัตโนมัติสำเร็จ",
      data: savedDraft,
    },
    200,
  );
};

export const getMyDrafts = async (c: Context) => {
  const userId = getUserId(c);
  const drafts = await proposalService.getMyDrafts(userId);
  return c.json({ data: drafts }, 200);
};

// recieve projectId from path param and body from request body
export const submitProposal = async (
  c: Context,
  projectId: string,
  body: SubmitProposalDTO,
) => {
  const user = getUserContext(c);
  const proposalData = { ...body, projectId };
  const proposal = await proposalService.submitProposal(user, proposalData);

  return c.json(
    {
      success: true,
      message: "ยื่นเสนอโครงการสำเร็จ",
      data: { proposalId: proposal.id },
    },
    200,
  );
};
