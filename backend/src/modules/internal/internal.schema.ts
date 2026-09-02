import { z } from '@hono/zod-openapi';

// 1. Schema สำหรับ VM (ลูก)
export const CloudVmSchema = z.object({
  id: z.string().uuid(),
  vmDescription: z.string(),
  osDatabase: z.string().nullable(),
  vcpu: z.number(),
  ramGb: z.number(),
  gpuGb: z.number(),
  storageGb: z.number(),
  price: z.string(),
});

// 2. Schema สำหรับ Cloud Request (แม่)
export const CloudRequestSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(), // เปลี่ยนจาก proposalId เป็น projectId ให้คนภายนอกดู
  projectCode: z.string().nullable().openapi({ description: 'รหัสโครงการ (BMA-YY-XXXX)' }),
  projectName: z.string().nullable().openapi({ description: 'ชื่อโครงการ' }),
  agencyName: z.string().nullable().openapi({ description: 'ชื่อหน่วยงาน/ส่วนราชการ' }),
  totalPrice: z.string().openapi({ description: 'ราคารวมของ VM ทั้งหมดใน Request นี้' }),
  systemName: z.string(),
  requestedServiceDate: z.string().datetime().nullable(),
  recordedRequestDate: z.string().datetime().nullable(),
  vms: z.array(CloudVmSchema).default([]), 
}).openapi('CloudRequest');

// Query ได้ด้วย projectId หรือ projectCode (หรือทั้งสองอย่าง) เพื่อกรองข้อมูล
export const CloudRequestQuerySchema = z.object({
  projectId: z.string().uuid().optional().openapi({ description: 'กรองด้วย ID โครงการ (UUID)' }),
  projectCode: z.string().optional().openapi({ description: 'กรองด้วยรหัสโครงการ (เช่น BMA-69-0001)' })
});