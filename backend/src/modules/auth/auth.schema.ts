import { z } from '@hono/zod-openapi';

export const LoginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
}).openapi('LoginRequest');

export const LoginResponseSchema = z.object({
  message: z.string(),
  token: z.string(), // เราจะส่ง JWT Token กลับไปให้หน้าบ้าน
  user: z.object({
    userId: z.string(),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  })
}).openapi('LoginResponse');

export const RefreshSessionResponseSchema = z.object({
  token: z.string(),
}).openapi('RefreshSessionResponse');

export const VerifyEmailQuerySchema = z.object({
  token: z.string().openapi({ description: 'รหัสยืนยันตัวตนที่ส่งไปใน Gmail' }),
});

export const RecoveryEmailRequestSchema = z.object({
  email: z.string().email().max(255),
}).openapi('RecoveryEmailRequest');

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
}).openapi('ResetPasswordRequest');

export const SuccessResponseSchema = z.object({
  message: z.string(),
}).openapi('SuccessResponse');
