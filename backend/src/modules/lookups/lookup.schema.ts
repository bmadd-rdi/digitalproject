// src/modules/lookups/lookup.schema.ts
import { z } from '@hono/zod-openapi';

// --- Error Schema ---
export const ErrorSchema = z.object({
  message: z.string().openapi({ example: 'เกิดข้อผิดพลาดบางอย่าง' }),
});

// --- Lookup Schemas ---
// สมมติว่าโครงสร้างตาราง Lookups พื้นฐานมี id และ name
export const LookupItemSchema = z.object({
  id: z.number().int(),
  name: z.string().max(255),
}).openapi('LookupItem');

export const LookupResponseSchema = z.object({
  data: z.array(LookupItemSchema)
}).openapi('LookupResponse');

export const DepartmentItemSchema = z.object({
  id: z.number().int(),
  code: z.string().length(8),
  name: z.string().max(255),
}).openapi('DepartmentItem');

export const DepartmentResponseSchema = z.object({
  data: z.array(DepartmentItemSchema),
}).openapi('DepartmentResponse');

export const ProjectAttachmentTypeLookupItemSchema = z.object({
  id: z.number().int(),
  name: z.string().max(255),
  label: z.string().max(255),
}).openapi('ProjectAttachmentTypeLookupItem');

export const ProjectAttachmentTypeLookupResponseSchema = z.object({
  data: z.array(ProjectAttachmentTypeLookupItemSchema),
}).openapi('ProjectAttachmentTypeLookupResponse');

// --- Division Schemas ---
export const DivisionItemSchema = z.object({
  id: z.number().int(),
  code: z.string().length(8),
  departmentId: z.number().int(),
  name: z.string().max(255),
}).openapi('DivisionItem');

export const DivisionResponseSchema = z.object({
  data: z.array(DivisionItemSchema)
}).openapi('DivisionResponse');

export const ProjectStatusItemSchema = z.object({
  id: z.number().int(),
  statusName: z.string().max(255),
}).openapi('ProjectStatusItem');

export const ProjectStatusResponseSchema = z.object({
  data: z.array(ProjectStatusItemSchema)
}).openapi('ProjectStatusResponse');





// budget_type on proposal_budgets is free text the owner types when filling
// out the proposal form — there's no id-backed lookup table for it, so this
// returns the distinct values as plain strings instead of {id, name} pairs.
export const StringLookupResponseSchema = z.object({
  data: z.array(z.string()),
}).openapi('StringLookupResponse');


// รายชื่อผู้วิเคราะห์สำหรับตัวกรองรายการโครงการ — คืนเฉพาะ userId กับชื่อที่แสดง
// (ไม่รวม username/ตำแหน่ง/ภาระงาน ซึ่งยังอยู่หลังสิทธิ์ project_assign ที่
// /users/analysts/workload) ใช้ id เป็น UUID จึงไม่ใช้ LookupItemSchema ที่ id เป็นตัวเลข
export const AnalystLookupItemSchema = z.object({
  userId: z.string().uuid(),
  name: z.string(),
}).openapi('AnalystLookupItem');

export const AnalystLookupResponseSchema = z.object({
  data: z.array(AnalystLookupItemSchema),
}).openapi('AnalystLookupResponse');




// --- Query Parameter Schemas ---
export const DivisionQuerySchema = z.object({
  departmentId: z.coerce.number().optional().openapi({ description: 'ใช้กรองส่วนราชการตาม ID หน่วยงานหลัก' }),
});

// --- Types ---
export type LookupItemDTO = z.infer<typeof LookupItemSchema>;
