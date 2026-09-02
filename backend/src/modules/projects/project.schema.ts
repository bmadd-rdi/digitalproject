import { z } from '@hono/zod-openapi';

// Schema สำหรับ Error แบบมาตรฐาน
export const ErrorSchema = z.object({
  message: z.string().openapi({ example: 'เกิดข้อผิดพลาดบางอย่าง' }),
}).openapi('ErrorResponse');

// Schema สำหรับ Lookup แบบย่อ (ใช้สำหรับ Join ข้อมูลจากตารางอื่น เช่น Division, Status, ProjectType)
const CompactLookupSchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Schema สำหรับ User แบบย่อ (ใช้สำหรับ Join ข้อมูลผู้สร้างโครงการ)
const CompactUserSchema = z.object({
  userId: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
});

const DivisionLookupSchema = z.object({
  id: z.number(),
  code: z.string().length(8),
  name: z.string(),
  departmentId: z.number().nullable(),
  departmentCode: z.string().length(8).nullable(),
  departmentName: z.string().nullable(),
});

const ReturnFeedbackSchema = z.object({
  remark: z.string(),
  reviewer: CompactUserSchema.nullable(),
  reviewerRole: z.string(),
  createdAt: z.union([z.string(), z.date()]),
  oldStatusId: z.number().int(),
  newStatusId: z.number().int(),
}).nullable();

// Schema ของโปรเจกต์เต็มรูปแบบ (ใช้สำหรับ Response)
export const ProjectSchema = z.object({
  id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  projectCode: z.string().nullable().openapi({ example: 'BMA-69-0001' }),
  userId: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
  divisionId: z.number().openapi({ example: 12 }),

  projectStatusId: z.number().nullable().openapi({ example: 1 }),
  returnStage: z.enum(['SMALL_BOARD', 'BIG_BOARD']).nullable(),
  workflowVersion: z.number().int(),
  projectTypeId: z.number().nullable().openapi({ example: 2 }),

  fourQuadrantsId: z.number().nullable().openapi({ example: 1 }),
  deputyGovernorId: z.number().nullable().openapi({ example: 3 }),
  externalTaskId: z.string().nullable().openapi({ example: null }),

  projectName: z.string().nullable().openapi({ example: 'โครงการพัฒนาระบบให้บริการประชาชน' }),
  projectNameOriginal: z.string().nullable().openapi({ example: 'โครงการพัฒนาระบบให้บริการประชาชน' }),
  initialRequestedBudget: z.string().nullable().openapi({ example: '5000000.00' }),
  latestRequestedBudget: z.string().nullable().openapi({ example: '4500000.00' }),
  finalApprovedBudget: z.string().nullable().openapi({ example: null }),
  initialEstimatedCost: z.string().nullable().openapi({ example: '4200000.00' }),
  latestEstimatedCost: z.string().nullable().openapi({ example: '4300000.00' }),
  finalEstimatedCost: z.string().nullable().openapi({ example: null }),
  latestSubmittedRequestedBudget: z.string().nullable().openapi({ example: '4500000.00' }),
  latestApprovedBudget: z.string().nullable().optional().openapi({ deprecated: true, description: 'Deprecated read-only alias of latestRequestedBudget' }),

  analystId: z.string().uuid().nullable().openapi({ example: null }),
  assignedAnalystId: z.string().uuid().nullable().optional().openapi({ example: null }),
  assignedBy: z.string().uuid().nullable().openapi({ example: null }),
  assignedAt: z.union([z.string(), z.date()]).nullable().openapi({ type: 'string', format: 'date-time', example: null }),

  isPublic: z.boolean().openapi({ example: false }),
  publicToken: z.string().nullable().openapi({ example: null }),
  createdAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
  updatedAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
  updatedBy: z.string().uuid().nullable().openapi({ example: null }),
  deletedAt: z.string().datetime().nullable().openapi({ type: 'string', format: 'date-time', example: null }),

  // เพิ่มฟิลด์ที่ถูก Join สำหรับการใช้งานฝั่งหน้าบ้าน
  division: DivisionLookupSchema.nullable().openapi({ description: 'ข้อมูลส่วนราชการเจ้าของโครงการ' }),
  status: CompactLookupSchema.nullable().openapi({ description: 'สถานะโครงการ' }),
  projectType: CompactLookupSchema.nullable().openapi({ description: 'ประเภทโครงการ' }),
  owner: CompactUserSchema.nullable().openapi({ description: 'ผู้สร้างโครงการ' }),
  analyst: CompactUserSchema.nullable().openapi({ description: 'ผู้วิเคราะห์โครงการ' }),
  attachments: z.array(z.object({
    id: z.string().uuid(),
    projectId: z.string().uuid(),
    docTypeId: z.number().int(),
    docTypeName: z.string().nullable(),
    uploadedBy: z.string().uuid(),
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileType: z.string(),
    fileSize: z.number().int().nullable(),
    description: z.string().nullable(),
    uploader: CompactUserSchema.nullable(),
    createdAt: z.union([z.string(), z.date()]),
    canDelete: z.boolean(),
  })).default([]),
  permissions: z.object({
    canDelete: z.boolean(),
    canManageAttachments: z.boolean(),
    canEditProject: z.boolean(),
    canUpdateProject: z.boolean().optional().openapi({ deprecated: true }),
    canEditProposal: z.boolean(),
    canSubmitProposal: z.boolean(),
    canCancelSubmit: z.boolean(),
    canChangeVisibility: z.boolean(),
  }).optional(),
  latestReturnFeedback: ReturnFeedbackSchema.default(null),
}).openapi('Project');

// Schema สำหรับสร้าง Project ใหม่
export const CreateProjectSchema = z.object({
  projectName: z.string().min(1, "กรุณาระบุชื่อโครงการ").max(600, "ชื่อโครงการยาวเกินไป").openapi({ example: 'โครงการพัฒนาระบบให้บริการประชาชน' }),
  projectTypeId: z.number().int().optional().openapi({ example: 2 }),
  fourQuadrantsId: z.coerce.number().int().openapi({ example: 1 }),
  deputyGovernorId: z.coerce.number().int().openapi({ example: 3 }),
}).openapi('CreateProjectRequest');

export const UpdateProjectStatusSchema = z.object({
  projectStatusId: z.number().int().openapi({ example: 2 }),
  projectTypeId: z.number().int().optional().openapi({ example: 2 }),
  remark: z.string().optional().openapi({ example: 'ผ่านการอนุมัติขั้นต้น' }),
}).openapi('UpdateProjectStatusRequest');

export const UpdateProjectTypeSchema = z.object({
  projectTypeId: z.number().int().openapi({ example: 3 }),
}).openapi('UpdateProjectTypeRequest');

export const SecretaryPendingProjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
}).openapi('SecretaryPendingProjectQueryParams');

export const SecretaryReviewRequestSchema = z.discriminatedUnion('decision', [
  z.object({
    decision: z.literal('approve'),
    projectTypeId: z.number().int().positive(),
  }),
  z.object({
    decision: z.literal('return'),
    remark: z.string().trim().min(1),
  }),
  z.object({
    decision: z.literal('reject'),
    remark: z.string().trim().min(1),
  }),
]).openapi('SecretaryReviewRequest');

export const SecretaryReviewResponseSchema = z.object({
  message: z.string(),
  decision: z.enum(['approve', 'return', 'reject']),
  project: ProjectSchema,
}).openapi('SecretaryReviewResponse');

export const CancelSubmitResponseSchema = z.object({
  message: z.string(),
  projectId: z.string().uuid(),
  project: ProjectSchema,
}).openapi('CancelSubmitResponse');

export const UpdateProjectVisibilitySchema = z.object({
  isPublic: z.boolean(),
}).strict().openapi('UpdateProjectVisibilityRequest');

export const ProjectVisibilityResponseSchema = z.object({
  message: z.string(),
  projectId: z.string().uuid(),
  isPublic: z.boolean(),
}).openapi('ProjectVisibilityResponse');

export const AssignProjectSchema = z.object({
  analystId: z.string().uuid().openapi({ description: 'UUID ของนักวิเคราะห์' }),
}).openapi('AssignProjectRequest');

export const AssignmentProjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
}).openapi('AssignmentProjectQueryParams');

export const AssignmentProjectSchema = z.object({
  id: z.string().uuid(),
  projectCode: z.string().nullable(),
  projectName: z.string().nullable(),
  projectType: CompactLookupSchema.nullable(),
  division: DivisionLookupSchema.nullable(),
  owner: CompactUserSchema.nullable(),
  projectStatusId: z.number().int(),
  createdAt: z.union([z.string(), z.date()]),
  analystId: z.string().uuid().nullable(),
}).openapi('AssignmentProject');

export const PaginatedAssignmentProjectResponseSchema = z.object({
  data: z.array(AssignmentProjectSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
}).openapi('PaginatedAssignmentProjectResponse');

export const BulkAssignProjectSchema = z.object({
  projectIds: z.array(z.string().uuid()).min(1).max(100).refine(
    (projectIds) => new Set(projectIds).size === projectIds.length,
    { message: 'Duplicate project IDs are not allowed' },
  ),
  analystId: z.string().uuid(),
}).strict().openapi('BulkAssignProjectRequest');

export const AssignedProjectResultSchema = z.object({
  id: z.string().uuid(),
  projectCode: z.string().nullable(),
  projectStatusId: z.number().int(),
  analystId: z.string().uuid(),
});

export const BulkAssignProjectResponseSchema = z.object({
  count: z.number().int(),
  analyst: CompactUserSchema,
  projects: z.array(AssignedProjectResultSchema),
}).openapi('BulkAssignProjectResponse');

export const AnalystAssignedProjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
}).openapi('AnalystAssignedProjectQueryParams');

export const AnalystAssignedProjectSchema = z.object({
  id: z.string().uuid(),
  projectCode: z.string().nullable(),
  projectName: z.string().nullable(),
  projectType: CompactLookupSchema.nullable(),
  division: DivisionLookupSchema.nullable(),
  owner: CompactUserSchema.nullable(),
  projectStatusId: z.number().int(),
  assignedAt: z.union([z.string(), z.date()]).nullable(),
  createdAt: z.union([z.string(), z.date()]),
  analystId: z.string().uuid(),
}).openapi('AnalystAssignedProject');

export const PaginatedAnalystAssignedProjectResponseSchema = z.object({
  data: z.array(AnalystAssignedProjectSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
}).openapi('PaginatedAnalystAssignedProjectResponse');

export const AnalystReassignmentRequestSchema = z.object({
  reason: z.string().trim().min(1),
}).openapi('AnalystReassignmentRequest');

export const AnalystReviewRequestSchema = z.object({
  decision: z.enum(['approve', 'return', 'reject']),
  remark: z.string().trim().min(1),
}).openapi('AnalystReviewRequest');

export const AnalystWorkflowResponseSchema = z.object({
  message: z.string(),
  project: ProjectSchema,
}).openapi('AnalystWorkflowResponse');

// Schema สำหรับอัปเดต
export const UpdateProjectSchema = CreateProjectSchema.partial().strict().openapi('UpdateProjectRequest');

// Schema สำหรับรับ Parameter จาก URL
export const ProjectIdParamsSchema = z.object({
  id: z.string().uuid("ID โครงการต้องเป็น UUID").openapi({ example: '018f3a3b-1b2c-7d3e-8f4g-5h6i7j8k9l0m', description: 'รหัสโครงการ (UUID)' }),
}).openapi('ProjectIdParams');

// Schema สำหรับ Query Parameters ของการดึงรายการ Project
// ใช้สำหรับ Pagination, Search, Filter
const ProjectStatusIdSchema = z.coerce.number().int().min(1).max(15);
const ProjectStatusIdsSchema = z
  .union([
    z.array(ProjectStatusIdSchema).max(15),
    ProjectStatusIdSchema,
    z.string().regex(/^\s*\d+(?:\s*,\s*\d+)*\s*$/),
  ])
  .optional();

export const ProjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  statusIds: ProjectStatusIdsSchema,
  status: z.enum(['draft', 'submitted', 'all_except_draft', 'all']).default('all'),
  ownership: z.enum(['mine', 'team_only', 'team_and_mine', 'all']).default('all'),
}).openapi('ProjectQueryParams');

export const PaginatedProjectResponseSchema = z.object({
  data: z.array(ProjectSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
}).openapi('PaginatedProjectResponse');

export const PublicProjectSchema = z.object({
  id: z.string().uuid(),
  projectCode: z.string().nullable(),
  projectName: z.string().nullable(),
  projectNameOriginal: z.string().nullable(),
  projectStatus: CompactLookupSchema.nullable(),
  projectType: CompactLookupSchema.nullable(),
}).openapi('PublicProject');

export const PublicProjectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().trim().max(200).optional(),
}).openapi('PublicProjectQueryParams');

export const PaginatedPublicProjectResponseSchema = z.object({
  data: z.array(PublicProjectSchema),
  pagination: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
}).openapi('PaginatedPublicProjectResponse');

export const ReopenRejectedProjectSchema = z.object({
  reason: z.string().trim().min(1).max(5000),
}).strict().openapi('ReopenRejectedProjectRequest');

export type CreateProjectDTO = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectDTO = z.infer<typeof UpdateProjectSchema>;
export type UpdateProjectStatusDTO = z.infer<typeof UpdateProjectStatusSchema>;
export type UpdateProjectTypeDTO = z.infer<typeof UpdateProjectTypeSchema>;
export type AssignProjectDTO = z.infer<typeof AssignProjectSchema>;
export type AssignmentProjectQueryDTO = z.infer<typeof AssignmentProjectQuerySchema>;
export type BulkAssignProjectDTO = z.infer<typeof BulkAssignProjectSchema>;
export type SecretaryPendingProjectQueryDTO = z.infer<typeof SecretaryPendingProjectQuerySchema>;
export type SecretaryReviewDTO = z.infer<typeof SecretaryReviewRequestSchema>;
export type UpdateProjectVisibilityDTO = z.infer<typeof UpdateProjectVisibilitySchema>;
export type PublicProjectQueryDTO = z.infer<typeof PublicProjectQuerySchema>;
export type AnalystAssignedProjectQueryDTO = z.infer<typeof AnalystAssignedProjectQuerySchema>;
export type AnalystReassignmentDTO = z.infer<typeof AnalystReassignmentRequestSchema>;
export type AnalystReviewDTO = z.infer<typeof AnalystReviewRequestSchema>;
export type ProjectQueryDTO = z.infer<typeof ProjectQuerySchema>;
export type ReopenRejectedProjectDTO = z.infer<typeof ReopenRejectedProjectSchema>;
