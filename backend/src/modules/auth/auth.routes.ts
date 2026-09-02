// src/modules/auth/auth.routes.ts
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import * as authController from './auth.controller';
import {
  LoginRequestSchema,
  LoginResponseSchema,
  VerifyEmailQuerySchema,
  RecoveryEmailRequestSchema,
  ResetPasswordRequestSchema,
  SuccessResponseSchema,
  RefreshSessionResponseSchema,
} from './auth.schema';
import { ErrorSchema } from '../users/user.schema'; // อ้างอิงจาก ErrorSchema เดิมของคุณ
import { authMiddleware } from '../../middlewares/auth.middleware';

const app = new OpenAPIHono();

const loginRoute = createRoute({
  method: 'post',
  path: '/login',
  tags: ['Auth'],
  summary: 'เข้าสู่ระบบ (Login)',
  request: { body: { content: { 'application/json': { schema: LoginRequestSchema } } } },
  responses: {
    200: { content: { 'application/json': { schema: LoginResponseSchema } }, description: 'สำเร็จ' },
    401: { content: { 'application/json': { schema: ErrorSchema } }, description: 'รหัสผ่านผิด' },
    403: { content: { 'application/json': { schema: ErrorSchema } }, description: 'ยังไม่ได้ยืนยันอีเมล' },
    500: { content: { 'application/json': { schema: ErrorSchema } }, description: 'เกิดข้อผิดพลาด' },
  },
});

const verifyRoute = createRoute({
  method: 'get',
  path: '/verify',
  tags: ['Auth'],
  summary: 'ยืนยันอีเมลของผู้ใช้งาน',
  request: { query: VerifyEmailQuerySchema },
  responses: {
    200: { content: { 'application/json': { schema: SuccessResponseSchema } }, description: 'สำเร็จ' },
    400: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Token ไม่ถูกต้องหรือหมดอายุ' },
    500: { content: { 'application/json': { schema: ErrorSchema } }, description: 'เซิร์ฟเวอร์มีปัญหา' },
  },
});

const forgotUsernameRoute = createRoute({
  method: "post",
  path: "/forgot-username",
  tags: ["Auth"],
  summary: "Request a username reminder",
  request: {
    body: { content: { "application/json": { schema: RecoveryEmailRequestSchema } } },
  },
  responses: {
    202: { content: { "application/json": { schema: SuccessResponseSchema } }, description: "Recovery request accepted" },
    429: { content: { "application/json": { schema: ErrorSchema } }, description: "Too many requests" },
  },
});

const forgotPasswordRoute = createRoute({
  method: "post",
  path: "/forgot-password",
  tags: ["Auth"],
  summary: "Request a password reset link",
  request: {
    body: { content: { "application/json": { schema: RecoveryEmailRequestSchema } } },
  },
  responses: {
    202: { content: { "application/json": { schema: SuccessResponseSchema } }, description: "Recovery request accepted" },
    429: { content: { "application/json": { schema: ErrorSchema } }, description: "Too many requests" },
  },
});

const resetPasswordRoute = createRoute({
  method: "post",
  path: "/reset-password",
  tags: ["Auth"],
  summary: "Set a new password using a reset token",
  request: {
    body: { content: { "application/json": { schema: ResetPasswordRequestSchema } } },
  },
  responses: {
    200: { content: { "application/json": { schema: SuccessResponseSchema } }, description: "Password reset" },
    400: { content: { "application/json": { schema: ErrorSchema } }, description: "Invalid or expired token" },
    500: { content: { "application/json": { schema: ErrorSchema } }, description: "Server error" },
  },
});

export const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  tags: ["Auth"],
  summary: "ออกจากระบบ (Logout)",
  description: "ยกเลิกเซสชันปัจจุบันและลบคุกกี้การยืนยันตัวตน",
  responses: {
    200: { content: { "application/json": { schema: SuccessResponseSchema } }, description: "ออกจากระบบสำเร็จ" },
    500: { content: { "application/json": { schema: ErrorSchema } }, description: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" },
  },
});

const refreshSessionRoute = createRoute({
  method: "post",
  path: "/refresh",
  tags: ["Auth"],
  summary: "Refresh the current user's session claims",
  middleware: [authMiddleware],
  responses: {
    200: {
      content: { "application/json": { schema: RefreshSessionResponseSchema } },
      description: "Session refreshed",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Unauthorized",
    },
  },
});

// การ Binding Routes กับ Controller
app.openapi(loginRoute, (c) => authController.login(c, c.req.valid('json')));
app.openapi(verifyRoute, (c) => authController.verifyEmail(c));
app.openapi(forgotUsernameRoute, (c) => authController.requestUsernameRecovery(c, c.req.valid("json")));
app.openapi(forgotPasswordRoute, (c) => authController.requestPasswordReset(c, c.req.valid("json")));
app.openapi(resetPasswordRoute, (c) => authController.resetPassword(c, c.req.valid("json")));
app.openapi(refreshSessionRoute, (c) => authController.refreshSession(c));
app.openapi(logoutRoute, (c) => authController.logout(c));

export default app;
