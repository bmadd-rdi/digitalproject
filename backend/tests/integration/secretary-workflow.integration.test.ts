import { expect, test } from "bun:test";
import { and, eq } from "drizzle-orm";
import { getIntegrationContext } from "../setup/integration";
import { createTestUser } from "../fixtures/users.fixture";
import { createTestProject } from "../fixtures/projects.fixture";
import { createCompleteProposalPayload } from "../fixtures/proposals.fixture";
import { cleanupTestRecords } from "../helpers/cleanup.helper";
import { requestJson } from "../helpers/api.helper";

test("Secretary sees every pending project and approval requires a category", async () => {
  const context = await getIntegrationContext();
  const { PROJECT_STATUS } = await import("../../src/modules/projects/project-workflow");
  const records = { userIds: [] as string[], projectIds: [] as string[] };
  const [firstDivision, secondDivision] = await context.db.select().from(context.divisions).limit(2);
  if (!firstDivision || !secondDivision) throw new Error("At least two divisions are required for this test");

  const firstOwner = await createTestUser(context.db, {
    divisionId: firstDivision.divisionId,
    usernamePrefix: "secretary-owner-one",
  });
  const secondOwner = await createTestUser(context.db, {
    divisionId: secondDivision.divisionId,
    usernamePrefix: "secretary-owner-two",
  });
  const secretary = await createTestUser(context.db, {
    roles: ["secretary"],
    usernamePrefix: "secretary-reviewer",
  });
  records.userIds.push(firstOwner.user.userId, secondOwner.user.userId, secretary.user.userId);
  const firstProject = await createTestProject(context.db, firstOwner.user.userId, {
    statusId: PROJECT_STATUS.PENDING_SECRETARY,
    projectName: "Pending project from first department",
  });
  const secondProject = await createTestProject(context.db, secondOwner.user.userId, {
    statusId: PROJECT_STATUS.PENDING_SECRETARY,
    projectName: "Pending project from second department",
  });
  records.projectIds.push(firstProject.id, secondProject.id);

  try {
    const queue = await requestJson(context.app, "/api/v1/projects/secretary/pending?page=1&limit=100", {
      method: "GET",
      user: secretary.context,
    });
    expect(queue.response.status).toBe(200);
    const queuedIds = ((queue.data as any)?.data ?? []).map((project: any) => project.id);
    expect(queuedIds).toContain(firstProject.id);
    expect(queuedIds).toContain(secondProject.id);

    const missingCategory = await requestJson(context.app, `/api/v1/projects/${firstProject.id}/secretary-review`, {
      method: "POST",
      user: secretary.context,
      body: { decision: "approve" },
    });
    expect(missingCategory.response.status).toBe(400);

    const category = (await context.db.select().from(context.projectTypes))
      .find((type: { typeName: string }) => ["hardware", "software"].includes(type.typeName.trim().toLowerCase()));
    if (!category) throw new Error("Hardware/software project type lookup data is missing");

    const approved = await requestJson(context.app, `/api/v1/projects/${firstProject.id}/secretary-review`, {
      method: "POST",
      user: secretary.context,
      body: { decision: "approve", projectTypeId: category.id },
    });
    expect(approved.response.status).toBe(200);

    const [approvedProject] = await context.db.select()
      .from(context.projects)
      .where(eq(context.projects.id, firstProject.id));
    const approvalLogs = await context.db.select()
      .from(context.projectStatusLogs)
      .where(and(
        eq(context.projectStatusLogs.projectId, firstProject.id),
        eq(context.projectStatusLogs.oldStatusId, PROJECT_STATUS.PENDING_SECRETARY),
        eq(context.projectStatusLogs.newStatusId, PROJECT_STATUS.PENDING_ASSIGNMENT),
      ));
    expect(approvedProject?.projectStatusId).toBe(PROJECT_STATUS.PENDING_ASSIGNMENT);
    expect(approvedProject?.projectTypeId).toBe(category.id);
    expect(approvalLogs).toHaveLength(1);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});

test("Secretary return restores an editable draft and exposes edit/submit capabilities", async () => {
  const context = await getIntegrationContext();
  const { PROJECT_STATUS } = await import("../../src/modules/projects/project-workflow");
  const records = { userIds: [] as string[], projectIds: [] as string[] };
  const owner = await createTestUser(context.db, { usernamePrefix: "secretary-return-owner" });
  const secretary = await createTestUser(context.db, { roles: ["secretary"], usernamePrefix: "secretary-return-reviewer" });
  records.userIds.push(owner.user.userId, secretary.user.userId);
  const project = await createTestProject(context.db, owner.user.userId, {
    statusId: PROJECT_STATUS.DRAFT,
    projectName: "โครงการทดสอบส่งกลับจากเลขานุการ",
  });
  records.projectIds.push(project.id);

  try {
    await context.proposalService.submitProposal(owner.context, {
      ...createCompleteProposalPayload(),
      projectId: project.id,
    });

    const result = await context.projectService.reviewSecretaryProject(
      project.id,
      { decision: "return", remark: "กรุณาแก้ไขรายละเอียดโครงการ" },
      secretary.context,
    );
    expect(result.project.projectStatusId).toBe(PROJECT_STATUS.RETURNED_SECRETARY);

    const [draft] = await context.db
      .select()
      .from(context.proposalDrafts)
      .where(eq(context.proposalDrafts.projectId, project.id));
    expect(draft).toBeDefined();
    expect((draft?.draftPayload as any).budgetsByYear).toHaveLength(1);
    expect((draft?.draftPayload as any).trainingCourses).toHaveLength(1);
    expect(result.project.permissions.canEditProposal).toBe(true);
    expect(result.project.permissions.canSubmitProposal).toBe(false);

    const pendingOwner = await context.projectService.findProjectById(project.id, owner.context);
    expect(pendingOwner.permissions.canEditProject).toBe(true);
    expect(pendingOwner.permissions.canEditProposal).toBe(true);
    expect(pendingOwner.permissions.canSubmitProposal).toBe(true);

    await context.proposalService.submitProposal(owner.context, {
      ...(draft?.draftPayload as any),
      projectId: project.id,
    });
    const afterResubmit = await context.projectService.findProjectById(project.id, owner.context);
    expect(afterResubmit.projectStatusId).toBe(PROJECT_STATUS.PENDING_SECRETARY);
    expect(afterResubmit.permissions.canEditProject).toBe(false);
    expect(afterResubmit.permissions.canEditProposal).toBe(false);
    expect(afterResubmit.permissions.canSubmitProposal).toBe(false);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});
