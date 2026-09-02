import { z } from "@hono/zod-openapi";

export const ErrorSchema = z.object({ message: z.string(), dependencies: z.array(z.string()).optional() });
export const IdParamSchema = z.object({ id: z.string().uuid() });
export const MeetingIdParamSchema = z.object({ meetingId: z.string().uuid() });
export const MeetingAgendaParamSchema = z.object({ meetingId: z.string().uuid(), agendaId: z.string().uuid() });
export const MeetingFileParamSchema = z.object({ meetingId: z.string().uuid(), fileId: z.string().uuid() });

export const MeetingStatusCodeSchema = z.enum(["DRAFT", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const MeetingTypeCodeSchema = z.enum(["SMALL_BOARD", "BIG_BOARD"]);
export const ResolutionTypeSchema = z.enum([
  "APPROVED",
  "ACKNOWLEDGED",
  "CONDITIONAL_APPROVAL",
  "RECONSIDER",
  "NOT_APPROVED",
  "NOT_CONSIDERED",
]);
export const MeetingDocumentTypeSchema = z.enum(["MEETING_DOCUMENT", "MEETING_MINUTES"]);
export const EligibleProjectsSortSchema = z.enum(["projectCode", "projectName", "latestRequestedBudget"]);

const DateTimeSchema = z.string().datetime();
const AgendaTypeIdSchema = z.number().int().min(1).max(5);

export const MeetingSchema = z.object({
  id: z.string().uuid(),
  meetingNo: z.string(),
  title: z.string(),
  meetingTypeId: z.number().int(),
  meetingType: z.object({ id: z.number().int(), code: z.string().nullable(), name: z.string() }).nullable(),
  meetingDate: z.union([z.string(), z.date()]),
  startTime: z.union([z.string(), z.date()]).nullable(),
  endTime: z.union([z.string(), z.date()]).nullable(),
  location: z.string().nullable(),
  description: z.string().nullable(),
  meetingStatusId: z.number().int(),
  meetingStatus: z.object({ id: z.number().int(), code: z.string().nullable(), name: z.string() }).nullable(),
  createdBy: z.string().uuid(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  updatedBy: z.string().uuid().nullable(),
  completedAt: z.union([z.string(), z.date()]).nullable(),
  cancelledAt: z.union([z.string(), z.date()]).nullable(),
  cancelReason: z.string().nullable(),
  unresolvedResolutionCount: z.number().int().default(0),
  creator: z.object({ userId: z.string().uuid(), firstName: z.string(), lastName: z.string() }).nullable(),
}).openapi("Meeting");

export const CreateMeetingSchema = z.object({
  meetingNo: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(500),
  meetingTypeId: z.number().int().min(1).max(2),
  meetingDate: DateTimeSchema,
  startTime: DateTimeSchema.optional(),
  endTime: DateTimeSchema.nullable().optional(),
  location: z.string().trim().max(500).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  // Accepted for compatibility with the previous client. New meetings always
  // start in DRAFT regardless of this legacy value.
  meetingStatusId: z.number().int().optional(),
}).strict().openapi("CreateMeeting");

export const UpdateMeetingSchema = CreateMeetingSchema.partial().strict().openapi("UpdateMeeting");
export const MeetingListQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: MeetingStatusCodeSchema.optional(),
  meetingTypeId: z.coerce.number().int().min(1).max(2).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["meetingDate", "meetingNo", "status"]).default("meetingDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
}).openapi("MeetingListQuery");
export const EligibleProjectsQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  sortBy: EligibleProjectsSortSchema.default("projectCode"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
}).strict().openapi("EligibleProjectsQuery");
export const TransitionMeetingStatusSchema = z.object({
  status: z.enum(["SCHEDULED", "IN_PROGRESS", "COMPLETED"]),
}).strict().openapi("TransitionMeetingStatus");
export const CancelMeetingSchema = z.object({ reason: z.string().trim().min(1).max(5000) }).strict().openapi("CancelMeeting");

export const AgendaSchema = z.object({
  id: z.string().uuid(),
  meetingId: z.string().uuid(),
  projectId: z.string().uuid().nullable(),
  agendaNumber: z.string(),
  sortOrder: z.number().int(),
  agendaTypeId: AgendaTypeIdSchema,
  title: z.string(),
  description: z.string().nullable(),
  project: z.object({
    id: z.string().uuid(),
    projectCode: z.string().nullable(),
    projectName: z.string().nullable(),
    latestRequestedBudget: z.string().nullable(),
    projectStatusId: z.number().int(),
  }).nullable(),
  resolution: z.object({
    id: z.string().uuid(),
    resolutionType: ResolutionTypeSchema.nullable(),
    remark: z.string().nullable(),
    version: z.number().int(),
    resolvedAt: z.union([z.string(), z.date()]).nullable(),
  }).nullable(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
}).openapi("Agenda");

export const CreateAgendaSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  agendaNumber: z.string().trim().min(1).max(50),
  sortOrder: z.number().int().positive().optional(),
  agendaTypeId: AgendaTypeIdSchema,
  title: z.string().trim().min(1).max(500),
  description: z.string().trim().max(5000).nullable().optional(),
}).strict().openapi("CreateAgenda");
export const UpdateAgendaSchema = CreateAgendaSchema.partial().strict().openapi("UpdateAgenda");
export const ReorderAgendasSchema = z.object({
  items: z.array(z.object({ agendaId: z.string().uuid(), sortOrder: z.number().int().positive() })).min(1),
  expectedUpdatedAt: DateTimeSchema,
}).strict().openapi("ReorderAgendas");

export const BulkCreateAgendasSchema = z.object({
  projectIds: z.array(z.string().uuid()).min(1).max(100),
  agendaTypeId: z.number().int().min(3).max(4),
}).strict().openapi("BulkCreateAgendas");

export const RecordResolutionSchema = z.object({
  resolutionType: ResolutionTypeSchema,
  remark: z.string().trim().max(5000).nullable().optional(),
}).strict().openapi("RecordResolution");
export const EditResolutionSchema = RecordResolutionSchema.extend({ version: z.number().int().positive() }).strict().openapi("EditResolution");
export const CorrectResolutionSchema = RecordResolutionSchema.extend({
  reason: z.string().trim().min(1).max(5000),
  version: z.number().int().positive(),
}).strict().openapi("CorrectResolution");

export const ResolutionSchema = z.object({
  id: z.string().uuid(),
  agendaId: z.string().uuid(),
  resolutionType: ResolutionTypeSchema.nullable(),
  remark: z.string().nullable(),
  recordedBy: z.string().uuid(),
  resolvedAt: z.union([z.string(), z.date()]).nullable(),
  version: z.number().int(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
}).openapi("Resolution");

export const ResolutionRevisionSchema = z.object({
  id: z.string().uuid(),
  resolutionId: z.string().uuid(),
  revisionNumber: z.number().int(),
  previousResolutionType: z.string().nullable(),
  newResolutionType: z.string(),
  previousRemark: z.string().nullable(),
  newRemark: z.string().nullable(),
  previousProjectStatusId: z.number().int().nullable(),
  newProjectStatusId: z.number().int(),
  previousLatestApprovedBudget: z.string().nullable(),
  newLatestApprovedBudget: z.string().nullable(),
  reason: z.string().nullable(),
  changeMode: z.string(),
  changedAt: z.union([z.string(), z.date()]),
}).openapi("ResolutionRevision");

export const MeetingFileSchema = z.object({
  id: z.string().uuid(),
  meetingId: z.string().uuid(),
  documentType: MeetingDocumentTypeSchema,
  originalFileName: z.string().nullable(),
  mimeType: z.string().nullable(),
  sizeBytes: z.number().int().nullable(),
  uploadedBy: z.string().uuid(),
  createdAt: z.union([z.string(), z.date()]),
}).openapi("MeetingFile");

export const MeetingFilePolicySchema = z.object({
  acceptedExtensions: z.array(z.string()),
  acceptedMimeTypes: z.array(z.string()),
  limits: z.object({
    pdfBytes: z.number().int(),
    imageBytes: z.number().int(),
    documentBytes: z.number().int(),
  }),
}).openapi("MeetingFilePolicy");

export const ReopenRejectedProjectSchema = z.object({ reason: z.string().trim().min(1).max(5000) }).strict().openapi("ReopenRejectedProject");

export type CreateMeetingDTO = z.infer<typeof CreateMeetingSchema>;
export type UpdateMeetingDTO = z.infer<typeof UpdateMeetingSchema>;
export type MeetingListQueryDTO = z.infer<typeof MeetingListQuerySchema>;
export type EligibleProjectsQueryDTO = z.infer<typeof EligibleProjectsQuerySchema>;
export type TransitionMeetingStatusDTO = z.infer<typeof TransitionMeetingStatusSchema>;
export type CancelMeetingDTO = z.infer<typeof CancelMeetingSchema>;
export type CreateAgendaDTO = z.infer<typeof CreateAgendaSchema>;
export type UpdateAgendaDTO = z.infer<typeof UpdateAgendaSchema>;
export type ReorderAgendasDTO = z.infer<typeof ReorderAgendasSchema>;
export type BulkCreateAgendasDTO = z.infer<typeof BulkCreateAgendasSchema>;
export type RecordResolutionDTO = z.infer<typeof RecordResolutionSchema>;
export type EditResolutionDTO = z.infer<typeof EditResolutionSchema>;
export type CorrectResolutionDTO = z.infer<typeof CorrectResolutionSchema>;
