import { expect, test } from "bun:test";
import { and, desc, eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { getIntegrationContext } from "../setup/integration";
import { createTestUser } from "../fixtures/users.fixture";
import { createTestProject } from "../fixtures/projects.fixture";
import { createCompleteProposalPayload } from "../fixtures/proposals.fixture";
import { cleanupTestRecords } from "../helpers/cleanup.helper";
import { submitProposalSchema } from "../../src/modules/proposals/proposal.schema";

test("submit -> cancel submit -> restore -> edit -> resubmit preserves the complete proposal graph", async () => {
  const context = await getIntegrationContext();
  const { cancelProjectSubmit } = await import("../../src/modules/projects/project-cancel.service");
  const { PROJECT_STATUS } = await import("../../src/modules/projects/project-workflow");

  const records = { userIds: [] as string[], projectIds: [] as string[] };
  const owner = await createTestUser(context.db, { usernamePrefix: "proposal-owner" });
  records.userIds.push(owner.user.userId);
  const project = await createTestProject(context.db, owner.user.userId, {
    projectName: "Original integration project",
    initialBudget: 100000,
    statusId: PROJECT_STATUS.DRAFT,
  });
  records.projectIds.push(project.id);

  try {
    const originalPayload = createCompleteProposalPayload();
    await context.proposalService.submitProposal(owner.context, {
      ...originalPayload,
      projectId: project.id,
    });

    const [submittedBeforeCancel] = await context.db
      .select()
      .from(context.proposals)
      .where(eq(context.proposals.projectId, project.id));
    expect(submittedBeforeCancel).toBeDefined();
    const oldProposalId = submittedBeforeCancel!.id;

    const [attachmentType] = await context.db
      .select()
      .from(context.projectAttachmentTypes)
      .limit(1);
    if (!attachmentType) throw new Error("Required project attachment lookup data is missing");
    await context.db.insert(context.projectAttachments).values({
      id: uuidv7(),
      projectId: project.id,
      docTypeId: attachmentType.id,
      uploadedBy: owner.user.userId,
      fileName: "proposal.pdf",
      fileUrl: "http://test.local/files/proposal.pdf",
      fileType: "application/pdf",
      fileSize: 10,
    });

    await cancelProjectSubmit(project.id, owner.context);

    const [cancelledProject] = await context.db
      .select()
      .from(context.projects)
      .where(eq(context.projects.id, project.id));
    const [draft] = await context.db
      .select()
      .from(context.proposalDrafts)
      .where(eq(context.proposalDrafts.projectId, project.id));
    const remainingSubmitted = await context.db
      .select()
      .from(context.proposals)
      .where(eq(context.proposals.projectId, project.id));
    const attachments = await context.db
      .select()
      .from(context.projectAttachments)
      .where(eq(context.projectAttachments.projectId, project.id));
    const cancelLogs = await context.db
      .select()
      .from(context.projectStatusLogs)
      .where(and(
        eq(context.projectStatusLogs.projectId, project.id),
        eq(context.projectStatusLogs.oldStatusId, PROJECT_STATUS.PENDING_SECRETARY),
        eq(context.projectStatusLogs.newStatusId, PROJECT_STATUS.DRAFT),
      ));

    expect(cancelledProject?.projectStatusId).toBe(PROJECT_STATUS.DRAFT);
    expect(remainingSubmitted).toHaveLength(1);
    expect(draft).toBeDefined();
    expect(attachments).toHaveLength(1);
    expect(cancelLogs).toHaveLength(1);
    expect(draft?.draftPayload).not.toHaveProperty("proposalId");
    expect(draft?.draftPayload).not.toHaveProperty("trainingId");
    expect(draft?.draftPayload).not.toHaveProperty("cloudRequestId");

    const restoredPayload = draft!.draftPayload as Record<string, any>;
    const restoredValidation = submitProposalSchema.safeParse(restoredPayload);
    expect(restoredValidation.success).toBe(true);
    expect(restoredPayload.relatedProjects).toHaveLength(1);
    expect(restoredPayload.manpower).toHaveLength(1);
    expect(restoredPayload.existingEquipment).toHaveLength(1);
    expect(restoredPayload.hardwareCosts).toHaveLength(1);
    expect(restoredPayload.softwareCosts).toHaveLength(1);
    expect(restoredPayload.personnelCoreCosts).toHaveLength(1);
    expect(restoredPayload.personnelAsstCosts).toHaveLength(1);
    expect(restoredPayload.personnelSuppCosts).toHaveLength(1);
    expect(restoredPayload.personnelResponsibilities).toHaveLength(1);
    expect(restoredPayload.trainingCourses[0].speakerCosts).toHaveLength(1);
    expect(restoredPayload.trainingCourses[0].foodCosts).toEqual(expect.any(Array));
    expect(restoredPayload.otherCosts).toHaveLength(1);
    expect(restoredPayload.ictPersonnel).toHaveLength(1);
    expect(restoredPayload.cloudRequests[0].vms).toHaveLength(1);
    expect(restoredPayload.cloudRequests[0].requestedServiceDate).toBe("2027-01-02");
    expect(restoredPayload.hardwareCosts[0].unitPrice).toBe(50000);
    expect(restoredPayload.softwareCosts[0].unitPrice).toBe(0);

    const editedPayload = {
      ...restoredPayload,
      projectName: "Edited integration project after cancellation",
      requestedBudgetTotal: 150000,
      budgetsByYear: [{ ...restoredPayload.budgetsByYear[0], amount: 150000 }],
    };
    await context.proposalService.upsertDraft(project.id, owner.user.userId, {
      currentStep: 5,
      draftPayload: editedPayload,
      projectName: editedPayload.projectName,
      requestedBudgetTotal: editedPayload.requestedBudgetTotal,
    });
    await context.proposalService.submitProposal(owner.context, {
      ...editedPayload,
      projectId: project.id,
    });

    const [resubmittedProject] = await context.db
      .select()
      .from(context.projects)
      .where(eq(context.projects.id, project.id));
    const [resubmittedProposal] = await context.db
      .select()
      .from(context.proposals)
      .where(eq(context.proposals.projectId, project.id))
      .orderBy(desc(context.proposals.submittedAt), desc(context.proposals.id));
    const resubmittedBudgets = await context.db
      .select()
      .from(context.proposalBudgets)
      .where(eq(context.proposalBudgets.proposalId, resubmittedProposal!.id));
    const resubmittedTrainings = await context.db
      .select()
      .from(context.proposalTrainings)
      .where(eq(context.proposalTrainings.proposalId, resubmittedProposal!.id));
    const resubmittedCloudRequests = await context.db
      .select()
      .from(context.proposalCloudRequests)
      .where(eq(context.proposalCloudRequests.proposalId, resubmittedProposal!.id));
    const remainingDrafts = await context.db
      .select()
      .from(context.proposalDrafts)
      .where(eq(context.proposalDrafts.projectId, project.id));

    expect(resubmittedProject?.projectStatusId).toBe(PROJECT_STATUS.PENDING_SECRETARY);
    expect(resubmittedProject?.projectName).toBe(editedPayload.projectName);
    expect(resubmittedProject?.projectNameOriginal).toBe("Original integration project");
    expect(String(resubmittedProject?.initialRequestedBudget)).toBe("100000.00");
    expect(String(resubmittedProject?.latestRequestedBudget)).toBe("150000.00");
    expect(resubmittedProposal?.id).not.toBe(oldProposalId);
    expect(resubmittedProposal?.projectName).toBe(editedPayload.projectName);
    expect(String(resubmittedProposal?.requestedBudgetTotal)).toBe("150000.00");
    expect(resubmittedBudgets).toHaveLength(1);
    expect(String(resubmittedBudgets[0].amount)).toBe("150000.00");
    expect(resubmittedTrainings).toHaveLength(1);
    expect(resubmittedCloudRequests).toHaveLength(1);
    expect(remainingDrafts).toHaveLength(0);
    expect(attachments).toHaveLength(1);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});

test("restoration failure preserves the submitted proposal graph and project state", async () => {
  const context = await getIntegrationContext();
  const { cancelProjectSubmit } = await import("../../src/modules/projects/project-cancel.service");
  const { PROJECT_STATUS } = await import("../../src/modules/projects/project-workflow");
  const records = { userIds: [] as string[], projectIds: [] as string[] };
  const owner = await createTestUser(context.db, { usernamePrefix: "restore-failure-owner" });
  records.userIds.push(owner.user.userId);
  const project = await createTestProject(context.db, owner.user.userId, { statusId: PROJECT_STATUS.DRAFT });
  records.projectIds.push(project.id);

  try {
    await context.proposalService.submitProposal(owner.context, {
      ...createCompleteProposalPayload(),
      projectId: project.id,
    });
    const [submitted] = await context.db
      .select()
      .from(context.proposals)
      .where(eq(context.proposals.projectId, project.id));
    expect(submitted).toBeDefined();

    // A legacy submitted row with a missing required scalar must not be
    // converted into a partially editable draft.
    await context.db.update(context.proposals)
      .set({ background: null })
      .where(eq(context.proposals.id, submitted!.id));

    let error: any;
    try {
      await cancelProjectSubmit(project.id, owner.context);
    } catch (caught) {
      error = caught;
    }
    expect(error?.status).toBe(409);

    const [projectAfterFailure] = await context.db
      .select()
      .from(context.projects)
      .where(eq(context.projects.id, project.id));
    const [proposalAfterFailure] = await context.db
      .select()
      .from(context.proposals)
      .where(eq(context.proposals.id, submitted!.id));
    const budgetsAfterFailure = await context.db
      .select()
      .from(context.proposalBudgets)
      .where(eq(context.proposalBudgets.proposalId, submitted!.id));
    const draftsAfterFailure = await context.db
      .select()
      .from(context.proposalDrafts)
      .where(eq(context.proposalDrafts.projectId, project.id));

    expect(projectAfterFailure?.projectStatusId).toBe(PROJECT_STATUS.PENDING_SECRETARY);
    expect(proposalAfterFailure?.id).toBe(submitted!.id);
    expect(proposalAfterFailure?.background).toBeNull();
    expect(budgetsAfterFailure).toHaveLength(1);
    expect(draftsAfterFailure).toHaveLength(0);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});
