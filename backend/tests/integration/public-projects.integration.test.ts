import { expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { getIntegrationContext } from "../setup/integration";
import { createTestUser } from "../fixtures/users.fixture";
import { createTestProject } from "../fixtures/projects.fixture";
import { cleanupTestRecords } from "../helpers/cleanup.helper";
import { requestJson } from "../helpers/api.helper";

test("public project DTOs contain approved public data only", async () => {
  const context = await getIntegrationContext();
  const { PROJECT_STATUS } = await import("../../src/modules/projects/project-workflow");
  const records = { userIds: [] as string[], projectIds: [] as string[] };
  const owner = await createTestUser(context.db, { usernamePrefix: "public-owner" });
  records.userIds.push(owner.user.userId);
  const approved = await createTestProject(context.db, owner.user.userId, {
    statusId: PROJECT_STATUS.APPROVED,
    projectName: "Approved public project",
  });
  const draft = await createTestProject(context.db, owner.user.userId, {
    statusId: PROJECT_STATUS.DRAFT,
    projectName: "Draft must stay private",
  });
  records.projectIds.push(approved.id, draft.id);
  await context.db.update(context.projects).set({ isPublic: true }).where(eq(context.projects.id, approved.id));
  await context.db.update(context.projects).set({ isPublic: true }).where(eq(context.projects.id, draft.id));

  try {
    const list = await requestJson(context.app, "/api/v1/public/projects?page=1&limit=100", { method: "GET" });
    expect(list.response.status).toBe(200);
    const publicProjects = (list.data as any)?.data ?? [];
    const publicProject = publicProjects.find((row: any) => row.id === approved.id);
    expect(publicProject).toBeDefined();
    expect(publicProjects.some((row: any) => row.id === draft.id)).toBe(false);
    expect(publicProject).not.toHaveProperty("ownerId");
    expect(publicProject).not.toHaveProperty("attachments");
    expect(publicProject).not.toHaveProperty("createdAt");
    expect(publicProject).not.toHaveProperty("updatedAt");

    const detail = await requestJson(context.app, `/api/v1/public/projects/${approved.id}`, { method: "GET" });
    expect(detail.response.status).toBe(200);
    expect(detail.data).not.toHaveProperty("ownerId");
    expect(detail.data).not.toHaveProperty("createdAt");
    expect(detail.data).not.toHaveProperty("updatedAt");
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});
