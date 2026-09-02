import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { HTTPException } from "hono/http-exception";
import { db } from "../../db";
import { projects } from "../../db/schema/projects";
import { proposalDrafts } from "../../db/schema/proposal_drafts";
import {
  proposals,
  proposalBudgets,
  proposalRelatedProjects,
  proposalManpower,
  proposalExistingEquipments,
  proposalHardwareCosts,
  proposalSoftwareCosts,
  proposalPersonnelCosts,
  proposalPersonnelResponsibilities,
  proposalTrainings,
  proposalTrainingSpeakerCosts,
  proposalTrainingFoodCosts,
  proposalOtherCosts,
  proposalIctPersonnel,
  proposalCloudRequests,
  proposalCloudVms,
} from "../../db/schema/proposals";
import { projectStatusLogs } from "../../db/schema/project_status_logs";
import { PROJECT_STATUS } from "./project-workflow";
import type { UserContext } from "../../shared/auth/permission.helper";
import { mapSubmittedProposalToDraftPayload } from "../proposals/proposal-restore";
import { submitProposalSchema } from "../proposals/proposal.schema";
import { sumProposalBudgets } from "../proposals/proposal-budget.util";
import { calculateEstimatedCostTotal } from "../proposals/proposal-estimated-cost.util";

type Executor = any;

/**
 * Converts the normalized submitted-proposal rows back into the payload shape
 * understood by the existing proposal wizard. The operation runs with the
 * transaction executor so the draft can never be created from a partial read.
 */
export async function buildDraftPayload(tx: Executor, proposalId: string) {
  const [proposal] = await tx
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .for("update")
    .limit(1);

  if (!proposal) {
    throw new HTTPException(409, { message: "Submitted proposal not found" });
  }

  const [
    budgets,
    relatedProjects,
    manpower,
    existingEquipments,
    hardwareCosts,
    softwareCosts,
    personnelCosts,
    personnelResponsibilities,
    trainings,
    otherCosts,
    ictPersonnel,
    cloudRequests,
  ] = await Promise.all([
    tx.select().from(proposalBudgets).where(eq(proposalBudgets.proposalId, proposalId)).for("update"),
    tx.select().from(proposalRelatedProjects).where(eq(proposalRelatedProjects.proposalId, proposalId)).for("update"),
    tx.select().from(proposalManpower).where(eq(proposalManpower.proposalId, proposalId)).for("update"),
    tx.select().from(proposalExistingEquipments).where(eq(proposalExistingEquipments.proposalId, proposalId)).for("update"),
    tx.select().from(proposalHardwareCosts).where(eq(proposalHardwareCosts.proposalId, proposalId)).for("update"),
    tx.select().from(proposalSoftwareCosts).where(eq(proposalSoftwareCosts.proposalId, proposalId)).for("update"),
    tx.select().from(proposalPersonnelCosts).where(eq(proposalPersonnelCosts.proposalId, proposalId)).for("update"),
    tx.select().from(proposalPersonnelResponsibilities).where(eq(proposalPersonnelResponsibilities.proposalId, proposalId)).for("update"),
    tx.select().from(proposalTrainings).where(eq(proposalTrainings.proposalId, proposalId)).for("update"),
    tx.select().from(proposalOtherCosts).where(eq(proposalOtherCosts.proposalId, proposalId)).for("update"),
    tx.select().from(proposalIctPersonnel).where(eq(proposalIctPersonnel.proposalId, proposalId)).for("update"),
    tx.select().from(proposalCloudRequests).where(eq(proposalCloudRequests.proposalId, proposalId)).for("update"),
  ]);

  const trainingIds = trainings.map((training: any) => training.id);
  const cloudRequestIds = cloudRequests.map((request: any) => request.id);
  const [nestedSpeakerCosts, nestedFoodCosts, nestedCloudVms] = await Promise.all([
    trainingIds.length
      ? tx.select().from(proposalTrainingSpeakerCosts).where(inArray(proposalTrainingSpeakerCosts.trainingId, trainingIds))
          .for("update")
      : Promise.resolve([]),
    trainingIds.length
      ? tx.select().from(proposalTrainingFoodCosts).where(inArray(proposalTrainingFoodCosts.trainingId, trainingIds)).for("update")
      : Promise.resolve([]),
    cloudRequestIds.length
      ? tx.select().from(proposalCloudVms).where(inArray(proposalCloudVms.cloudRequestId, cloudRequestIds)).for("update")
      : Promise.resolve([]),
  ]);

  return mapSubmittedProposalToDraftPayload({
    proposal,
    budgets,
    relatedProjects,
    manpower,
    existingEquipments,
    hardwareCosts,
    softwareCosts,
    personnelCosts,
    personnelResponsibilities,
    trainings,
    trainingSpeakerCosts: nestedSpeakerCosts,
    trainingFoodCosts: nestedFoodCosts,
    otherCosts,
    ictPersonnel,
    cloudRequests,
    cloudVms: nestedCloudVms,
  });
}

/**
 * Restore a submitted proposal as the project's single editable draft.
 *
 * This helper is intentionally transaction-scoped. Callers must invoke it
 * before changing the project workflow state so a failed restoration rolls
 * back the draft and leaves the submitted proposal untouched.
 */
export async function restoreEditableProposalDraft(
  tx: Executor,
  input: {
    proposalId: string;
    projectId: string;
    draftUserId: string;
    updatedBy: string;
    projectName?: string | null;
  },
) {
  const submittedPayload = await buildDraftPayload(tx, input.proposalId);
  const draftPayload = {
    ...submittedPayload,
    ...(input.projectName !== undefined
      ? { projectName: input.projectName ?? submittedPayload.projectName }
      : {}),
  };
  const validatedDraft = submitProposalSchema.safeParse(draftPayload);
  if (!validatedDraft.success) {
    throw new HTTPException(409, {
      message: "Submitted proposal cannot be restored as an editable draft",
    });
  }

  const requestedBudgetTotal = sumProposalBudgets(validatedDraft.data.budgetsByYear);
  const estimatedCostTotal = calculateEstimatedCostTotal(validatedDraft.data);
  const now = new Date();
  const [persistedDraft] = await tx
    .insert(proposalDrafts)
    .values({
      id: uuidv7(),
      projectId: input.projectId,
      userId: input.draftUserId,
      projectName: draftPayload.projectName,
      objective: draftPayload.objective,
      requestedBudgetTotal,
      estimatedCostTotal,
      currentStep: 1,
      draftPayload: validatedDraft.data,
      updatedBy: input.updatedBy,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: proposalDrafts.projectId,
      set: {
        userId: input.draftUserId,
        projectName: draftPayload.projectName,
        objective: draftPayload.objective,
        requestedBudgetTotal,
        estimatedCostTotal,
        currentStep: 1,
        draftPayload: validatedDraft.data,
        updatedBy: input.updatedBy,
        updatedAt: now,
      },
    })
    .returning({ id: proposalDrafts.id, draftPayload: proposalDrafts.draftPayload });

  if (!persistedDraft?.draftPayload || !submitProposalSchema.safeParse(persistedDraft.draftPayload).success) {
    throw new HTTPException(409, { message: "Restored proposal draft failed verification" });
  }

  return {
    draftId: persistedDraft.id,
    payload: validatedDraft.data,
    requestedBudgetTotal,
    estimatedCostTotal,
  };
}

export async function cancelProjectSubmit(projectId: string, user: UserContext) {
  await db.transaction(async (tx) => {
    const [current] = await tx
      .select({ id: projects.id, statusId: projects.projectStatusId, projectName: projects.projectName })
      .from(projects)
      .where(and(
        eq(projects.id, projectId),
        eq(projects.userId, user.userId),
        eq(projects.projectStatusId, PROJECT_STATUS.PENDING_SECRETARY),
        isNull(projects.deletedAt),
      ))
      .for("update")
      .limit(1);

    if (!current) {
      const [existing] = await tx
        .select({ ownerId: projects.userId, statusId: projects.projectStatusId })
        .from(projects)
        .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
        .limit(1);
      if (!existing) throw new HTTPException(404, { message: "Project not found" });
      if (existing.ownerId !== user.userId) {
        throw new HTTPException(403, { message: "Only the project owner can cancel submission" });
      }
      throw new HTTPException(409, {
        message: "Project status changed before cancellation completed",
      });
    }

    const [submitted] = await tx
      .select({ id: proposals.id })
      .from(proposals)
      .where(eq(proposals.projectId, projectId))
      .orderBy(desc(proposals.submittedAt), desc(proposals.updatedAt), desc(proposals.id))
      .for("update")
      .limit(1);

    if (!submitted) {
      throw new HTTPException(409, { message: "Submitted proposal not found" });
    }

    const restored = await restoreEditableProposalDraft(tx, {
      proposalId: submitted.id,
      projectId,
      draftUserId: user.userId,
      updatedBy: user.userId,
      projectName: current.projectName,
    });
    const now = new Date();

    const updated = await tx
      .update(projects)
      .set({
        projectStatusId: PROJECT_STATUS.DRAFT,
        latestRequestedBudget: restored.requestedBudgetTotal,
        latestEstimatedCost: restored.estimatedCostTotal,
        updatedBy: user.userId,
        updatedAt: now,
      })
      .where(and(
        eq(projects.id, projectId),
        eq(projects.userId, user.userId),
        eq(projects.projectStatusId, PROJECT_STATUS.PENDING_SECRETARY),
        isNull(projects.deletedAt),
      ))
      .returning({ id: projects.id });

    if (updated.length === 0) {
      throw new HTTPException(409, {
        message: "Project status changed before cancellation completed",
      });
    }

    await tx.insert(projectStatusLogs).values({
      projectId,
      userId: user.userId,
      oldStatusId: PROJECT_STATUS.PENDING_SECRETARY,
      newStatusId: PROJECT_STATUS.DRAFT,
      remark: "Owner cancelled project submission",
      createdAt: now,
    });
  });
}
