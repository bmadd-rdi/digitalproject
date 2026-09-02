// src/features/projects/schemas/projectShellSchema.ts
import { z } from "zod";

export const projectShellSchema = z.object({
  projectName: z.string()
    .min(5, "กรุณาระบุชื่อโครงการอย่างน้อย 5 ตัวอักษร")
    .max(200, "ชื่อโครงการต้องไม่เกิน 200 ตัวอักษร"),
    
  agencyName: z.string()
    .min(2, "กรุณาระบุชื่อหน่วยงานที่รับผิดชอบ"),
    
  fiscalYear: z.coerce
    .number({ message: "กรุณาระบุปี พ.ศ. เป็นตัวเลข" })
    .int("ปี พ.ศ. ต้องเป็นจำนวนเต็ม")
    .min(2560, "กรุณาระบุปี พ.ศ. ให้ถูกต้อง (เช่น 2569)")
    .max(2600, "กรุณาระบุปี พ.ศ. ให้ถูกต้อง"),
});

export type ProjectShellValues = z.infer<typeof projectShellSchema>;