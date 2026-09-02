import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { meetingController } from "./meeting.controller";
import * as projectController from "../projects/project.controller";
import { ReopenRejectedProjectSchema } from "../projects/project.schema";
import {
  AgendaSchema,
  BulkCreateAgendasSchema,
  CancelMeetingSchema,
  CorrectResolutionSchema,
  CreateAgendaSchema,
  CreateMeetingSchema,
  EditResolutionSchema,
  ErrorSchema,
  IdParamSchema,
  MeetingAgendaParamSchema,
  MeetingDocumentTypeSchema,
  MeetingFileParamSchema,
  MeetingIdParamSchema,
  MeetingSchema,
  RecordResolutionSchema,
  ReorderAgendasSchema,
  ResolutionRevisionSchema,
  ResolutionSchema,
  TransitionMeetingStatusSchema,
  UpdateAgendaSchema,
  UpdateMeetingSchema,
  MeetingFileSchema,
  MeetingListQuerySchema,
  EligibleProjectsQuerySchema,
  MeetingFilePolicySchema,
} from "./meeting.schema";

const meetingsRouter = new OpenAPIHono();
meetingsRouter.use("*", authMiddleware);
const errors = {
  401: { description: "Unauthenticated", content: { "application/json": { schema: ErrorSchema } } },
  403: { description: "Forbidden", content: { "application/json": { schema: ErrorSchema } } },
  404: { description: "Not found", content: { "application/json": { schema: ErrorSchema } } },
  409: { description: "Workflow conflict", content: { "application/json": { schema: ErrorSchema } } },
} as const;

meetingsRouter.openapi(createRoute({
  method: "post", path: "/", tags: ["Meetings"], summary: "สร้างการประชุม",
  request: { body: { content: { "application/json": { schema: CreateMeetingSchema } } } },
  responses: { 201: { description: "Created", content: { "application/json": { schema: z.object({ data: MeetingSchema }) } } }, ...errors },
}), (c) => meetingController.createMeeting(c, c.req.valid("json")));

meetingsRouter.openapi(createRoute({
  method: "get", path: "/", tags: ["Meetings"], summary: "รายการการประชุมที่มีสิทธิ์เข้าถึง",
  request: { query: MeetingListQuerySchema },
  responses: { 200: { description: "Meetings", content: { "application/json": { schema: z.object({
    data: z.array(MeetingSchema),
    pagination: z.object({ page: z.number(), limit: z.number(), total: z.number(), totalPages: z.number() }),
  }) } } }, ...errors },
}), (c) => meetingController.getAllMeetings(c, c.req.valid("query")));

meetingsRouter.openapi(createRoute({
  method: "get", path: "/{id}", tags: ["Meetings"], request: { params: IdParamSchema },
  responses: { 200: { description: "Meeting", content: { "application/json": { schema: z.object({ data: MeetingSchema.extend({ agendas: z.array(AgendaSchema).optional() }) }) } } }, ...errors },
}), (c) => meetingController.getMeetingById(c, c.req.valid("param").id));

meetingsRouter.openapi(createRoute({
  method: "patch", path: "/{id}", tags: ["Meetings"], request: { params: IdParamSchema, body: { content: { "application/json": { schema: UpdateMeetingSchema } } } },
  responses: { 200: { description: "Updated", content: { "application/json": { schema: z.object({ data: z.any() }) } } }, ...errors },
}), (c) => meetingController.updateMeeting(c, c.req.valid("param").id, c.req.valid("json")));

meetingsRouter.openapi(createRoute({
  method: "post", path: "/{id}/status", tags: ["Meetings"], request: { params: IdParamSchema, body: { content: { "application/json": { schema: TransitionMeetingStatusSchema } } } },
  responses: { 200: { description: "Transitioned", content: { "application/json": { schema: z.object({ data: MeetingSchema }) } } }, ...errors },
}), (c) => meetingController.transitionStatus(c, c.req.valid("param").id, c.req.valid("json")));

meetingsRouter.openapi(createRoute({
  method: "post", path: "/{id}/cancel", tags: ["Meetings"], request: { params: IdParamSchema, body: { content: { "application/json": { schema: CancelMeetingSchema } } } },
  responses: { 200: { description: "Cancelled", content: { "application/json": { schema: z.object({ data: MeetingSchema }) } } }, ...errors },
}), (c) => meetingController.cancelMeeting(c, c.req.valid("param").id, c.req.valid("json")));

meetingsRouter.openapi(createRoute({
  method: "get", path: "/{id}/eligible-projects", tags: ["Meetings", "Agendas"],
  request: { params: IdParamSchema, query: EligibleProjectsQuerySchema },
  responses: { 200: { description: "Eligible projects", content: { "application/json": { schema: z.object({ data: z.array(z.object({
    id: z.string().uuid(), projectCode: z.string().nullable(), projectName: z.string().nullable(),
    latestRequestedBudget: z.string().nullable(), projectStatusId: z.number().int(),
  })) }) } } }, ...errors },
}), (c) => meetingController.eligibleProjects(c, c.req.valid("param").id, c.req.valid("query")));

meetingsRouter.openapi(createRoute({
  method: "get", path: "/{meetingId}/agendas", tags: ["Agendas"], request: { params: MeetingIdParamSchema },
  responses: { 200: { description: "Agendas", content: { "application/json": { schema: z.object({ data: z.array(AgendaSchema) }) } } }, ...errors },
}), (c) => meetingController.getAgendas(c, c.req.valid("param").meetingId));

meetingsRouter.openapi(createRoute({
  method: "post", path: "/{meetingId}/agendas", tags: ["Agendas"], request: { params: MeetingIdParamSchema, body: { content: { "application/json": { schema: CreateAgendaSchema } } } },
  responses: { 201: { description: "Agenda created", content: { "application/json": { schema: z.object({ data: z.any() }) } } }, ...errors },
}), (c) => meetingController.createAgenda(c, c.req.valid("param").meetingId, c.req.valid("json")));

meetingsRouter.openapi(createRoute({
  method: "post", path: "/{meetingId}/agendas/bulk", tags: ["Agendas"],
  request: { params: MeetingIdParamSchema, body: { content: { "application/json": { schema: BulkCreateAgendasSchema } } } },
  responses: { 201: { description: "Agendas created", content: { "application/json": { schema: z.object({ data: z.array(AgendaSchema) }) } } }, ...errors },
}), (c) => meetingController.bulkCreateAgendas(c, c.req.valid("param").meetingId, c.req.valid("json")));

meetingsRouter.openapi(createRoute({
  method: "patch", path: "/{meetingId}/agendas/{agendaId}", tags: ["Agendas"], request: { params: MeetingAgendaParamSchema, body: { content: { "application/json": { schema: UpdateAgendaSchema } } } },
  responses: { 200: { description: "Agenda updated", content: { "application/json": { schema: z.object({ data: z.any() }) } } }, ...errors },
}), (c) => { const p = c.req.valid("param"); return meetingController.updateAgenda(c, p.meetingId, p.agendaId, c.req.valid("json")); });

meetingsRouter.openapi(createRoute({
  method: "delete", path: "/{meetingId}/agendas/{agendaId}", tags: ["Agendas"], request: { params: MeetingAgendaParamSchema },
  responses: { 200: { description: "Agenda deleted", content: { "application/json": { schema: z.object({ success: z.boolean() }) } } }, ...errors },
}), (c) => { const p = c.req.valid("param"); return meetingController.deleteAgenda(c, p.meetingId, p.agendaId); });

meetingsRouter.openapi(createRoute({
  method: "post", path: "/{meetingId}/agendas/reorder", tags: ["Agendas"], request: { params: MeetingIdParamSchema, body: { content: { "application/json": { schema: ReorderAgendasSchema } } } },
  responses: { 200: { description: "Agendas reordered", content: { "application/json": { schema: z.object({ data: z.array(AgendaSchema) }) } } }, ...errors },
}), (c) => meetingController.reorderAgendas(c, c.req.valid("param").meetingId, c.req.valid("json")));

meetingsRouter.openapi(createRoute({
  method: "post", path: "/{meetingId}/agendas/{agendaId}/resolution", tags: ["Resolutions"], request: { params: MeetingAgendaParamSchema, body: { content: { "application/json": { schema: RecordResolutionSchema } } } },
  responses: { 201: { description: "Resolution recorded", content: { "application/json": { schema: z.object({ data: ResolutionSchema }) } } }, ...errors },
}), (c) => { const p = c.req.valid("param"); return meetingController.recordResolution(c, p.meetingId, p.agendaId, c.req.valid("json")); });

meetingsRouter.openapi(createRoute({
  method: "patch", path: "/{meetingId}/agendas/{agendaId}/resolution", tags: ["Resolutions"], request: { params: MeetingAgendaParamSchema, body: { content: { "application/json": { schema: EditResolutionSchema } } } },
  responses: { 200: { description: "Resolution edited", content: { "application/json": { schema: z.object({ data: ResolutionSchema }) } } }, ...errors },
}), (c) => { const p = c.req.valid("param"); return meetingController.editResolution(c, p.meetingId, p.agendaId, c.req.valid("json")); });

meetingsRouter.openapi(createRoute({
  method: "get", path: "/{meetingId}/agendas/{agendaId}/resolution/history", tags: ["Resolutions"], request: { params: MeetingAgendaParamSchema },
  responses: { 200: { description: "Resolution history", content: { "application/json": { schema: z.object({ data: z.array(ResolutionRevisionSchema) }) } } }, ...errors },
}), (c) => { const p = c.req.valid("param"); return meetingController.history(c, p.meetingId, p.agendaId); });

meetingsRouter.openapi(createRoute({
  method: "get", path: "/{meetingId}/files/policy", tags: ["Meeting Files"], request: { params: MeetingIdParamSchema },
  responses: { 200: { description: "Meeting file policy", content: { "application/json": { schema: z.object({ data: MeetingFilePolicySchema }) } } }, ...errors },
}), (c) => meetingController.filePolicy(c, c.req.valid("param").meetingId));

meetingsRouter.openapi(createRoute({
  method: "post", path: "/{meetingId}/files", tags: ["Meeting Files"], request: { params: MeetingIdParamSchema, body: { content: { "multipart/form-data": { schema: z.object({ file: z.any(), documentType: MeetingDocumentTypeSchema }) } } } },
  responses: { 201: { description: "File uploaded", content: { "application/json": { schema: z.object({ data: MeetingFileSchema }) } } }, ...errors },
}), (c) => meetingController.uploadFile(c, c.req.valid("param").meetingId));

meetingsRouter.openapi(createRoute({
  method: "get", path: "/{meetingId}/files", tags: ["Meeting Files"], request: { params: MeetingIdParamSchema },
  responses: { 200: { description: "Meeting files", content: { "application/json": { schema: z.object({ data: z.array(MeetingFileSchema) }) } } }, ...errors },
}), (c) => meetingController.listFiles(c, c.req.valid("param").meetingId));

meetingsRouter.openapi(createRoute({
  method: "get", path: "/{meetingId}/files/{fileId}/download", tags: ["Meeting Files"], request: { params: MeetingFileParamSchema },
  responses: { 200: { description: "Private meeting file" }, ...errors },
}), (c) => { const p = c.req.valid("param"); return meetingController.downloadFile(c, p.meetingId, p.fileId); });

meetingsRouter.openapi(createRoute({
  method: "delete", path: "/{meetingId}/files/{fileId}", tags: ["Meeting Files"], request: { params: MeetingFileParamSchema },
  responses: { 200: { description: "File deleted", content: { "application/json": { schema: z.object({ success: z.boolean() }) } } }, ...errors },
}), (c) => { const p = c.req.valid("param"); return meetingController.deleteFile(c, p.meetingId, p.fileId); });

export const meetingAdminRouter = new OpenAPIHono();
meetingAdminRouter.use("*", authMiddleware);
meetingAdminRouter.openapi(createRoute({
  method: "post", path: "/resolutions/{id}/correct", tags: ["Admin", "Resolutions"], request: { params: IdParamSchema, body: { content: { "application/json": { schema: CorrectResolutionSchema } } } },
  responses: { 200: { description: "Resolution corrected", content: { "application/json": { schema: z.object({ data: ResolutionSchema }) } } }, ...errors },
}), (c) => meetingController.correction(c, c.req.valid("param").id, c.req.valid("json")));

meetingAdminRouter.openapi(createRoute({
  method: "post", path: "/projects/{id}/reopen-rejected", tags: ["Admin", "Projects"],
  request: { params: IdParamSchema, body: { content: { "application/json": { schema: ReopenRejectedProjectSchema } } } },
  responses: { 200: { description: "Rejected project reopened", content: { "application/json": { schema: z.any() } } }, ...errors },
}), (c) => projectController.reopenRejectedProject(c, c.req.valid("param").id, c.req.valid("json")));

export default meetingsRouter;
