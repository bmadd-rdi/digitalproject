// src/features/auth/type.ts
import { z } from "zod";
import { ReactNode } from "react";
import { schemas } from "@/types/api-schemas";

const baseRegisterSchema = schemas.CreateUserRequest.omit({ roleIds: true });

export const registerSchema = baseRegisterSchema.extend({
  confirmPassword: z.string().min(8, "กรุณายืนยันรหัสผ่าน"),
  departmentId: z.number({ message: "กรุณาเลือกหน่วยงาน" }).min(1, "กรุณาเลือกหน่วยงาน"),
  divisionId: z.number({ message: "กรุณาเลือกส่วนราชการ" }).min(1, "กรุณาเลือกส่วนราชการ"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "รหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});

export type RegisterValues = z.infer<typeof registerSchema>;

export interface RegisterFieldProps {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}
