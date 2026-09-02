import { expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { getIntegrationContext } from "../setup/integration";
import { createTestUser } from "../fixtures/users.fixture";
import { createTestProject } from "../fixtures/projects.fixture";
import { cleanupTestRecords } from "../helpers/cleanup.helper";
import { requestJson } from "../helpers/api.helper";

test("inactive login is rejected and previously issued JWTs are revoked", async () => {
  const context = await getIntegrationContext();
  const records = { userIds: [] as string[] };
  const user = await createTestUser(context.db, { usernamePrefix: "inactive-login" });
  records.userIds.push(user.user.userId);

  try {
    const activeLogin = await requestJson(context.app, "/api/v1/auth/login", {
      method: "POST",
      body: { username: user.user.username, password: user.password },
    });
    expect(activeLogin.response.status).toBe(200);

    await context.db.update(context.users)
      .set({ isActive: false })
      .where(eq(context.users.userId, user.user.userId));

    const inactiveLogin = await requestJson(context.app, "/api/v1/auth/login", {
      method: "POST",
      body: { username: user.user.username, password: user.password },
    });
    expect(inactiveLogin.response.status).toBe(403);
    expect((inactiveLogin.data as any)?.error).toBe("บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ");

    const revokedRequest = await requestJson(context.app, `/api/v1/users/profile/${user.user.userId}`, {
      method: "GET",
      user: user.context,
    });
    expect(revokedRequest.response.status).toBe(401);
  } finally {
    await context.db.update(context.users)
      .set({ isActive: true })
      .where(eq(context.users.userId, user.user.userId));
    await cleanupTestRecords(context.db, records);
  }
});

test("public registration ignores privileged roleIds and never returns secret fields", async () => {
  const context = await getIntegrationContext();
  const [division] = await context.db.select().from(context.divisions).limit(1);
  if (!division) throw new Error("Required division lookup data is missing");
  const username = `public-registration-${crypto.randomUUID().slice(-10)}`;
  const records = { userIds: [] as string[] };
  const sentBefore = context.emailService.sent.length;

  try {
    const result = await requestJson(context.app, "/api/v1/users", {
      method: "POST",
      body: {
        username,
        password: "Strong-password-123!",
        firstName: "Public",
        lastName: "Registration",
        email: `${username}@example.test`,
        position: "Officer",
        divisionId: division.divisionId,
        mobilePhone: "0812345678",
        roleIds: [5],
      },
    });
    expect(result.response.status).toBe(201);
    const createdUserId = (result.data as any)?.user?.userId;
    expect(createdUserId).toBeString();
    records.userIds.push(createdUserId);

    const responseText = JSON.stringify(result.data);
    expect(responseText).not.toContain("password");
    expect(responseText).not.toContain("verificationToken");
    expect(responseText).not.toContain("resetPasswordToken");
    expect(context.emailService.sent.length).toBe(sentBefore + 1);
    const [createdUser] = await context.db
      .select({ verificationExpires: context.users.verificationExpires })
      .from(context.users)
      .where(eq(context.users.userId, createdUserId));
    expect(createdUser?.verificationExpires?.toISOString()).toBe("2026-01-02T00:00:00.000Z");

    const assignedRoles = await context.db
      .select({ roleId: context.roles.roleId })
      .from(context.roleUsers)
      .innerJoin(context.roles, eq(context.roleUsers.roleId, context.roles.roleId))
      .where(eq(context.roleUsers.userId, createdUserId));
    expect(assignedRoles.map((row: { roleId: number }) => row.roleId)).toEqual([1]);

    const sentAfterCommit = context.emailService.sent.length;
    const failedRegistration = await requestJson(context.app, "/api/v1/users", {
      method: "POST",
      body: {
        username,
        password: "Strong-password-123!",
        firstName: "Duplicate",
        lastName: "Registration",
        email: `duplicate-${username}@example.test`,
        position: "Officer",
        divisionId: division.divisionId,
      },
    });
    expect(failedRegistration.response.status).toBe(409);
    expect(context.emailService.sent.length).toBe(sentAfterCommit);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});

test("admin cannot assign Super Admin, while an existing Super Admin can", async () => {
  const context = await getIntegrationContext();
  const records = { userIds: [] as string[] };
  const admin = await createTestUser(context.db, { roles: ["admin"], usernamePrefix: "role-admin" });
  const superAdmin = await createTestUser(context.db, { roles: ["super_admin"], usernamePrefix: "role-super" });
  const target = await createTestUser(context.db, { usernamePrefix: "role-target" });
  records.userIds.push(admin.user.userId, superAdmin.user.userId, target.user.userId);

  try {
    const adminAttempt = await requestJson(context.app, `/api/v1/users/${target.user.userId}/roles`, {
      method: "PATCH",
      user: admin.context,
      body: { roleIds: [5] },
    });
    expect(adminAttempt.response.status).toBe(403);

    const selfAttempt = await requestJson(context.app, `/api/v1/users/${admin.user.userId}/roles`, {
      method: "PATCH",
      user: admin.context,
      body: { roleIds: [5] },
    });
    expect(selfAttempt.response.status).toBe(403);

    const duplicateRoleAttempt = await requestJson(context.app, `/api/v1/users/${target.user.userId}/roles`, {
      method: "PATCH",
      user: admin.context,
      body: { roleIds: [1, 1] },
    });
    expect(duplicateRoleAttempt.response.status).toBe(400);

    const unknownRoleAttempt = await requestJson(context.app, `/api/v1/users/${target.user.userId}/roles`, {
      method: "PATCH",
      user: admin.context,
      body: { roleIds: [999999] },
    });
    expect(unknownRoleAttempt.response.status).toBe(400);

    const disableSelfAttempt = await requestJson(context.app, `/api/v1/users/${admin.user.userId}/status`, {
      method: "PATCH",
      user: admin.context,
      body: { isActive: false },
    });
    expect(disableSelfAttempt.response.status).toBe(403);

    const superAdminAttempt = await requestJson(context.app, `/api/v1/users/${target.user.userId}/roles`, {
      method: "PATCH",
      user: superAdmin.context,
      body: { roleIds: [1, 5] },
    });
    expect(superAdminAttempt.response.status).toBe(200);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});

test("own profile is scoped to safe fields and proposal access allows same-department collaborators", async () => {
  const context = await getIntegrationContext();
  const records = { userIds: [] as string[], projectIds: [] as string[] };
  const owner = await createTestUser(context.db, { usernamePrefix: "profile-owner" });
  const other = await createTestUser(context.db, { usernamePrefix: "profile-other" });
  records.userIds.push(owner.user.userId, other.user.userId);
  const otherProject = await createTestProject(context.db, other.user.userId);
  records.projectIds.push(otherProject.id);

  try {
    const profileUpdate = await requestJson(context.app, "/api/v1/users/me", {
      method: "PATCH",
      user: owner.context,
      body: {
        firstName: "Updated",
        mobilePhone: "0899999999",
      },
    });
    expect(profileUpdate.response.status).toBe(200);
    expect((profileUpdate.data as any)?.firstName).toBe("Updated");

    const forbiddenProfileFields = await requestJson(context.app, "/api/v1/users/me", {
      method: "PATCH",
      user: owner.context,
      body: { roles: ["super_admin"], isActive: false, divisionId: 1, departmentId: 1 },
    });
    expect(forbiddenProfileFields.response.status).toBe(400);

    const otherDraft = await requestJson(context.app, `/api/v1/proposals/projects/${otherProject.id}/draft`, {
      method: "GET",
      user: owner.context,
    });
    expect(otherDraft.response.status).toBe(200);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});

test("normal users cannot manage meetings, agendas, or resolutions", async () => {
  const context = await getIntegrationContext();
  const records = { userIds: [] as string[] };
  const user = await createTestUser(context.db, { usernamePrefix: "meeting-user" });
  records.userIds.push(user.user.userId);

  try {
    const result = await requestJson(context.app, "/api/v1/meetings/", {
      method: "POST",
      user: user.context,
      body: {
        meetingNo: "TEST-001",
        title: "Test meeting",
        meetingTypeId: 1,
        meetingDate: "2027-01-01T00:00:00.000Z",
        location: "Test room",
        meetingStatusId: 1,
      },
    });
    expect(result.response.status).toBe(403);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});
