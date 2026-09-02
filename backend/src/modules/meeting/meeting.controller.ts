import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getUserContext } from "../../shared/http/controller-helper";
import { getAppServices } from "../../shared/app/services";
import { meetingService } from "./meeting.service";
import type {
  CancelMeetingDTO,
  BulkCreateAgendasDTO,
  CorrectResolutionDTO,
  CreateAgendaDTO,
  CreateMeetingDTO,
  EditResolutionDTO,
  RecordResolutionDTO,
  ReorderAgendasDTO,
  TransitionMeetingStatusDTO,
  UpdateAgendaDTO,
  UpdateMeetingDTO,
  MeetingListQueryDTO,
  EligibleProjectsQueryDTO,
} from "./meeting.schema";

export const meetingController = {
  async createMeeting(c: Context, body: CreateMeetingDTO) {
    return c.json({ data: await meetingService.createMeeting(body, getUserContext(c)) }, 201);
  },
  async getAllMeetings(c: Context, query: MeetingListQueryDTO) {
    return c.json(await meetingService.getAllMeetings(getUserContext(c), query), 200);
  },
  async getMeetingById(c: Context, id: string) {
    return c.json({ data: await meetingService.getMeetingById(id, getUserContext(c)) }, 200);
  },
  async updateMeeting(c: Context, id: string, body: UpdateMeetingDTO) {
    return c.json({ data: await meetingService.updateMeeting(id, body, getUserContext(c)) }, 200);
  },
  async transitionStatus(c: Context, id: string, body: TransitionMeetingStatusDTO) {
    return c.json({ data: await meetingService.transitionStatus(id, body, getUserContext(c)) }, 200);
  },
  async cancelMeeting(c: Context, id: string, body: CancelMeetingDTO) {
    return c.json({ data: await meetingService.cancelMeeting(id, body, getUserContext(c)) }, 200);
  },
  async eligibleProjects(c: Context, id: string, query: EligibleProjectsQueryDTO) {
    return c.json({ data: await meetingService.eligibleProjects(id, query, getUserContext(c)) }, 200);
  },
  async getAgendas(c: Context, meetingId: string) {
    return c.json({ data: await meetingService.getAgendas(meetingId, getUserContext(c)) }, 200);
  },
  async createAgenda(c: Context, meetingId: string, body: CreateAgendaDTO) {
    return c.json({ data: await meetingService.createAgenda(meetingId, body, getUserContext(c)) }, 201);
  },
  async bulkCreateAgendas(c: Context, meetingId: string, body: BulkCreateAgendasDTO) {
    return c.json({ data: await meetingService.bulkCreateAgendas(meetingId, body, getUserContext(c)) }, 201);
  },
  async updateAgenda(c: Context, meetingId: string, agendaId: string, body: UpdateAgendaDTO) {
    return c.json({ data: await meetingService.updateAgenda(meetingId, agendaId, body, getUserContext(c)) }, 200);
  },
  async deleteAgenda(c: Context, meetingId: string, agendaId: string) {
    return c.json(await meetingService.deleteAgenda(meetingId, agendaId, getUserContext(c)), 200);
  },
  async reorderAgendas(c: Context, meetingId: string, body: ReorderAgendasDTO) {
    return c.json({ data: await meetingService.reorderAgendas(meetingId, body, getUserContext(c)) }, 200);
  },
  async recordResolution(c: Context, meetingId: string, agendaId: string, body: RecordResolutionDTO) {
    return c.json({ data: await meetingService.recordResolution(meetingId, agendaId, body, getUserContext(c)) }, 201);
  },
  async editResolution(c: Context, meetingId: string, agendaId: string, body: EditResolutionDTO) {
    return c.json({ data: await meetingService.editResolution(meetingId, agendaId, body, getUserContext(c)) }, 200);
  },
  async correction(c: Context, resolutionId: string, body: CorrectResolutionDTO) {
    return c.json({ data: await meetingService.correctResolution(resolutionId, body, getUserContext(c)) }, 200);
  },
  async history(c: Context, meetingId: string, agendaId: string) {
    return c.json({ data: await meetingService.resolutionHistory(meetingId, agendaId, getUserContext(c)) }, 200);
  },
  async filePolicy(c: Context, meetingId: string) {
    return c.json({ data: await meetingService.filePolicy(meetingId, getUserContext(c)) }, 200);
  },
  async uploadFile(c: Context, meetingId: string) {
    const body = await c.req.parseBody();
    const file = body.file as File | undefined;
    const documentType = body.documentType;
    if (!file || (documentType !== "MEETING_DOCUMENT" && documentType !== "MEETING_MINUTES")) {
      throw new HTTPException(400, { message: "File and a valid documentType are required" });
    }
    return c.json({ data: await meetingService.uploadFile(meetingId, file, documentType, getUserContext(c), getAppServices(c).pdfCompressor) }, 201);
  },
  async listFiles(c: Context, meetingId: string) {
    return c.json({ data: await meetingService.listFiles(meetingId, getUserContext(c)) }, 200);
  },
  async downloadFile(c: Context, meetingId: string, fileId: string) {
    const result = await meetingService.downloadFile(meetingId, fileId, getUserContext(c));
    return new Response(result.file, {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Content-Disposition": `attachment; filename="${result.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  },
  async deleteFile(c: Context, meetingId: string, fileId: string) {
    return c.json(await meetingService.deleteFile(meetingId, fileId, getUserContext(c)), 200);
  },
};
