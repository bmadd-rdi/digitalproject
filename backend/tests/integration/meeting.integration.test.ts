import { expect, test } from "bun:test";
import { getIntegrationContext } from "../setup/integration";
import { createTestUser } from "../fixtures/users.fixture";
import { createTestMeeting } from "../fixtures/meetings.fixture";
import { createTestProject } from "../fixtures/projects.fixture";
import { cleanupTestRecords } from "../helpers/cleanup.helper";
import { requestJson } from "../helpers/api.helper";
import { authHeaders } from "../helpers/auth.helper";
import { PROJECT_STATUS } from "../../src/modules/projects/project-workflow";

test("a Secretary can manage meetings while a normal user cannot", async () => {
  const context = await getIntegrationContext();
  const records: { userIds: string[]; meetingIds: string[] } = { userIds: [], meetingIds: [] };
  const secretary = await createTestUser(context.db, { roles: ["secretary"], usernamePrefix: "meeting-secretary" });
  const user = await createTestUser(context.db, { usernamePrefix: "meeting-normal" });
  records.userIds.push(secretary.user.userId, user.user.userId);

  try {
    const created = await requestJson(context.app, "/api/v1/meetings", {
      method: "POST",
      user: secretary.context,
      body: {
        meetingNo: `API-${Date.now()}`,
        title: "Secretary meeting",
        meetingTypeId: 1,
        meetingDate: "2027-01-01T00:00:00.000Z",
        location: "Meeting room",
        meetingStatusId: 1,
      },
    });
    expect(created.response.status).toBe(201);
    const meetingId = (created.data as any)?.data?.id;
    expect(meetingId).toBeString();
    records.meetingIds.push(meetingId);
    expect((created.data as any)?.data?.meetingStatusId).toBe(5);

    for (const status of ["SCHEDULED", "IN_PROGRESS", "COMPLETED"]) {
      const transition = await requestJson(context.app, `/api/v1/meetings/${meetingId}/status`, {
        method: "POST",
        user: secretary.context,
        body: { status },
      });
      expect(transition.response.status).toBe(200);
    }
    const terminalTransition = await requestJson(context.app, `/api/v1/meetings/${meetingId}/status`, {
      method: "POST",
      user: secretary.context,
      body: { status: "IN_PROGRESS" },
    });
    expect(terminalTransition.response.status).toBe(409);

    const normalUserAttempt = await requestJson(context.app, "/api/v1/meetings/", {
      method: "POST",
      user: user.context,
      body: {
        meetingNo: `NORMAL-${Date.now()}`,
        title: "Unauthorized meeting",
        meetingTypeId: 1,
        meetingDate: "2027-01-01T00:00:00.000Z",
        meetingStatusId: 1,
      },
    });
    expect(normalUserAttempt.response.status).toBe(403);

    // The fixture is also used to ensure deterministic cleanup handles rows
    // created through the database connection rather than the HTTP route.
    const fixtureMeeting = await createTestMeeting(context.db, secretary.user.userId);
    records.meetingIds.push(fixtureMeeting.id);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});

test("Small Board eligibility includes pending projects and bulk assignment is atomic", async () => {
  const context = await getIntegrationContext();
  const records: { userIds: string[]; meetingIds: string[]; projectIds: string[] } = { userIds: [], meetingIds: [], projectIds: [] };
  const secretary = await createTestUser(context.db, { roles: ["secretary"], usernamePrefix: "agenda-secretary" });
  records.userIds.push(secretary.user.userId);
  const meeting = await createTestMeeting(context.db, secretary.user.userId);
  records.meetingIds.push(meeting.id);
  const firstProject = await createTestProject(context.db, secretary.user.userId, { statusId: PROJECT_STATUS.PENDING_SMALL_BOARD, projectName: "โครงการทดสอบหนึ่ง" });
  const secondProject = await createTestProject(context.db, secretary.user.userId, { statusId: PROJECT_STATUS.PENDING_SMALL_BOARD, projectName: "โครงการทดสอบสอง" });
  records.projectIds.push(firstProject.id, secondProject.id);

  try {
    const eligible = await requestJson(context.app, `/api/v1/meetings/${meeting.id}/eligible-projects?search=โครงการทดสอบ`, { user: secretary.context });
    expect(eligible.response.status).toBe(200);
    expect((eligible.data as any).data.map((project: any) => project.id)).toEqual(expect.arrayContaining([firstProject.id, secondProject.id]));

    const bulk = await requestJson(context.app, `/api/v1/meetings/${meeting.id}/agendas/bulk`, {
      method: "POST", user: secretary.context, body: { projectIds: [firstProject.id, secondProject.id], agendaTypeId: 4 },
    });
    expect(bulk.response.status).toBe(201);
    expect((bulk.data as any).data.filter((agenda: any) => agenda.projectId).length).toBe(2);

    const afterBulk = await requestJson(context.app, `/api/v1/meetings/${meeting.id}/eligible-projects`, { user: secretary.context });
    expect((afterBulk.data as any).data).toHaveLength(0);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});

test("Meeting file policy is exposed and unsupported uploads are rejected", async () => {
  const context = await getIntegrationContext();
  const records: { userIds: string[]; meetingIds: string[] } = { userIds: [], meetingIds: [] };
  const secretary = await createTestUser(context.db, { roles: ["secretary"], usernamePrefix: "file-secretary" });
  records.userIds.push(secretary.user.userId);
  const meeting = await createTestMeeting(context.db, secretary.user.userId);
  records.meetingIds.push(meeting.id);
  try {
    const policy = await requestJson(context.app, `/api/v1/meetings/${meeting.id}/files/policy`, { user: secretary.context });
    expect(policy.response.status).toBe(200);
    expect((policy.data as any).data.acceptedExtensions).toContain(".pdf");
    expect((policy.data as any).data.limits.pdfBytes).toBe(20 * 1024 * 1024);

    const form = new FormData();
    form.append("documentType", "MEETING_DOCUMENT");
    form.append("file", new File(["not an executable upload"], "malware.exe", { type: "application/x-msdownload" }));
    const headers = await authHeaders(secretary.context);
    const response = await context.app.fetch(new Request(`http://test.local/api/v1/meetings/${meeting.id}/files`, { method: "POST", headers, body: form }));
    expect(response.status).toBe(400);
  } finally {
    await cleanupTestRecords(context.db, records);
  }
});
