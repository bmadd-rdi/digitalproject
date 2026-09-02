import { and, eq, inArray } from "drizzle-orm";
import {
  agendas,
  meetingAttachments,
  meetingResolutionRevisions,
  meetings,
  resolutions,
} from "../../src/db/schema/meetings";
import { projectAttachments, projects } from "../../src/db/schema/projects";
import { projectStatusLogs } from "../../src/db/schema/project_status_logs";
import { workflowAuditEvents } from "../../src/db/schema/workflow_audit_events";
import { proposalDrafts } from "../../src/db/schema/proposal_drafts";
import { proposals } from "../../src/db/schema/proposals";
import { roleUsers, userLoginHistory, users } from "../../src/db/schema/users";

export type TestRecords = {
  userIds?: string[];
  projectIds?: string[];
  meetingIds?: string[];
};

export async function cleanupTestRecords(db: any, records: TestRecords) {
  const userIds = records.userIds ?? [];
  const projectIds = records.projectIds ?? [];
  const meetingIds = records.meetingIds ?? [];

  await db.transaction(async (tx: any) => {
    if (projectIds.length) {
      const projectAgendas = await tx.select({ id: agendas.id }).from(agendas).where(inArray(agendas.projectId, projectIds));
      const agendaIds = projectAgendas.map((row: { id: string }) => row.id);
      if (agendaIds.length) {
        const resolutionRows = await tx.select({ id: resolutions.id }).from(resolutions).where(inArray(resolutions.agendaId, agendaIds));
        const resolutionIds = resolutionRows.map((row: { id: string }) => row.id);
        if (resolutionIds.length) await tx.delete(meetingResolutionRevisions).where(inArray(meetingResolutionRevisions.resolutionId, resolutionIds));
        await tx.delete(resolutions).where(inArray(resolutions.agendaId, agendaIds));
        await tx.delete(meetingAttachments).where(inArray(meetingAttachments.agendaId, agendaIds));
        await tx.delete(agendas).where(inArray(agendas.id, agendaIds));
      }
      await tx.delete(projectStatusLogs).where(inArray(projectStatusLogs.projectId, projectIds));
      await tx.delete(projectAttachments).where(inArray(projectAttachments.projectId, projectIds));
      await tx.delete(proposalDrafts).where(inArray(proposalDrafts.projectId, projectIds));
      await tx.delete(proposals).where(inArray(proposals.projectId, projectIds));
      await tx.delete(projects).where(inArray(projects.id, projectIds));
    }

    if (meetingIds.length) {
      const meetingAgendas = await tx.select({ id: agendas.id }).from(agendas).where(inArray(agendas.meetingId, meetingIds));
      const agendaIds = meetingAgendas.map((row: { id: string }) => row.id);
      if (agendaIds.length) {
        const resolutionRows = await tx.select({ id: resolutions.id }).from(resolutions).where(inArray(resolutions.agendaId, agendaIds));
        const resolutionIds = resolutionRows.map((row: { id: string }) => row.id);
        if (resolutionIds.length) await tx.delete(meetingResolutionRevisions).where(inArray(meetingResolutionRevisions.resolutionId, resolutionIds));
        await tx.delete(resolutions).where(inArray(resolutions.agendaId, agendaIds));
        await tx.delete(meetingAttachments).where(inArray(meetingAttachments.agendaId, agendaIds));
      }
      await tx.delete(meetingAttachments).where(inArray(meetingAttachments.meetingId, meetingIds));
      await tx.delete(agendas).where(inArray(agendas.meetingId, meetingIds));
      await tx.delete(meetings).where(inArray(meetings.id, meetingIds));
    }

    if (userIds.length) {
      await tx.delete(workflowAuditEvents).where(inArray(workflowAuditEvents.actorId, userIds));
      await tx.delete(roleUsers).where(inArray(roleUsers.userId, userIds));
      await tx.delete(userLoginHistory).where(inArray(userLoginHistory.userId, userIds));
      await tx.delete(users).where(inArray(users.userId, userIds));
    }
  });
}
