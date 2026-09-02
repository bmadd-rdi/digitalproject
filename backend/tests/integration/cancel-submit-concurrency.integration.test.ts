import { expect, test } from "bun:test";
import { and, eq } from "drizzle-orm";
import { getIntegrationContext } from "../setup/integration";
import { createTestUser } from "../fixtures/users.fixture";
import { createTestProject } from "../fixtures/projects.fixture";
import { createCompleteProposalPayload } from "../fixtures/proposals.fixture";
import { cleanupTestRecords } from "../helpers/cleanup.helper";

test("Cancel Submit and Secretary Return commit exactly one transition", async () => {
  const context = await getIntegrationContext();
  const { cancelProjectSubmit } = await import("../../src/modules/projects/project-cancel.service");
  const { PROJECT_STATUS } = await import("../../src/modules/projects/project-workflow");

  const records = { userIds: [] as string[], projectIds: [] as string[] };
  const owner = await createTestUser(context.db, { usernamePrefix: "concurrent-owner" });
  const secretary = await createTestUser(context.db, { roles: ["secretary"], usernamePrefix: "concurrent-secretary" });
  records.userIds.push(owner.user.userId, secretary.user.userId);
  const project = await createTestProject(context.db, owner.user.userId, { statusId: PROJECT_STATUS.DRAFT });
  records.projectIds.push(project.id);

  try {
    await context.proposalService.submitProposal(owner.context, {
      ...createCompleteProposalPayload(),
      projectId: project.id,
    });

    const results = await Promise.allSettled([
      cancelProjectSubmit(project.id, owner.context),
      context.projectService.reviewSecretaryProject(
        project.id,
        { decision: "return", remark: "Please revise the submitted proposal" },
        secretary.context,
      ),
    ]);
    const fulfilled = results.filter((result) => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    const losingError = rejected[0].status === "rejected" ? rejected[0].reason : undefined;
    expect(losingError?.status).toBe(409);

    const [finalProject] = await context.db
      .select()
      .from(context.projects)
      .where(eq(context.projects.id, project.id));
    const finalProposals = await context.db
      .select()
      .from(context.proposals)
      .where(eq(context.proposals.projectId, project.id));
    const finalDrafts = await context.db
      .select()
      .from(context.proposalDrafts)
      .where(eq(context.proposalDrafts.projectId, project.id));
    const transitionLogs = await context.db
      .select()
      .from(context.projectStatusLogs)
      .where(and(
        eq(context.projectStatusLogs.projectId, project.id),
        eq(context.projectStatusLogs.oldStatusId, PROJECT_STATUS.PENDING_SECRETARY),
      ));

    expect([PROJECT_STATUS.DRAFT, PROJECT_STATUS.RETURNED_SECRETARY]).toContain(finalProject?.projectStatusId);
    expect(transitionLogs).toHaveLength(1);
    expect(finalProject?.projectStatusId === PROJECT_STATUS.DRAFT).toBe(finalDrafts.length === 1);
    expect(finalProject?.projectStatusId === PROJECT_STATUS.RETURNED_SECRETARY).toBe(finalDrafts.length === 0);
    expect(finalProposals.length).toBe(1);
    expect(finalDrafts.length).toBeLessThanOrEqual(1);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});
