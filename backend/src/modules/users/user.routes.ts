// src/modules/users/user.routes.ts
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import {
  UserSchema,
  CreateUserSchema,
  ErrorSchema,
  PaginatedUserResponseSchema,
  UserQuerySchema,
  UpdateUserRolesSchema,
  UpdateUserStatusSchema,
  UpdateOwnProfileSchema,
  AnalystWorkloadResponseSchema,
} from './user.schema';
import * as userController from './user.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { HTTPException } from 'hono/http-exception';
import type { Context, Next } from 'hono';
import { checkPermission, type UserContext } from '../../shared/auth/permission.helper';
import type { Action, Resource } from '../../config/permissions.config';

const app = new OpenAPIHono();

const requirePermission = (action: Action, resource: Resource) => async (c: Context, next: Next) => {
  const user = c.get('user') as UserContext | undefined;
  if (!user) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
  checkPermission(user, action, resource);
  await next();
};

const getUsersRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['Users'],
  middleware: [authMiddleware, requirePermission('read', 'user_management')],
  request: { query: UserQuerySchema },
  summary: 'ดึงรายชื่อผู้ใช้งานทั้งหมด',
  responses: {
    200: {
      content: { 'application/json': { schema: PaginatedUserResponseSchema } },
      description: 'รายชื่อผู้ใช้ทั้งหมดในระบบ',
    },
    404: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'ไม่พบข้อมูลผู้ใช้งานในระบบ',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'ข้อผิดพลาดทางเซิร์ฟเวอร์',
    },
  },
});
app.openapi(getUsersRoute, (c) => userController.getUsers(c, c.req.valid('query')));

const getAnalystWorkloadsRoute = createRoute({
  method: 'get',
  path: '/analysts/workload',
  tags: ['Users', 'Project Assignment'],
  middleware: [authMiddleware, requirePermission('read', 'project_assign')],
  summary: 'Get active Analysts and their current workload',
  responses: {
    200: {
      content: { 'application/json': { schema: AnalystWorkloadResponseSchema } },
      description: 'Analyst workload list',
    },
    403: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'Only Admin users may access Analyst workload data',
    },
  },
});
app.openapi(getAnalystWorkloadsRoute, (c) => userController.getAnalystWorkloads(c));

const getUserProfileRoute = createRoute({
  method: 'get',
  path: '/profile/{userId}', // OpenAPI และเส้นทางจริงใช้พารามิเตอร์เดียวกัน
  tags: ['Users'],
  middleware: [authMiddleware],
  summary: 'ดึงโปรไฟล์ผู้ใช้งานรายบุคคล',
  request: {
    params: z.object({
      // บังคับให้หน้าบ้านส่งมาในรูปแบบ UUID เท่านั้น
      userId: z.string().uuid().openapi({ description: 'รหัสประจำตัวของผู้ใช้ (UUID)' }),
    }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: UserSchema } },
      description: 'ข้อมูลโปรไฟล์ของผู้ใช้รายบุคคล',
    },
    400: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'กรุณาระบุรหัสผู้ใช้งาน',
    },
    404: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'ไม่พบรหัสผู้ใช้งานนี้ในฐานข้อมูล',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'ข้อผิดพลาดทางเซิร์ฟเวอร์',
    },
  },
});
app.openapi(getUserProfileRoute, (c) => {
  const { userId } = c.req.valid('param');
  return userController.getUserProfile(c, userId);
});

const createUserRoute = createRoute({
  method: 'post',
  path: '/',
  tags: ['Users'],
  summary: 'สร้างผู้ใช้งานใหม่',
  request: {
    body: {
      content: { 'application/json': { schema: CreateUserSchema } },
    },
  },
  responses: {
    201: {
      content: { 
        'application/json': { 
          schema: z.object({
            message: z.string(),
            requireVerification: z.boolean(),
            user: z.any() 
          })
        } 
      },
      description: 'สร้างผู้ใช้สำเร็จ',
    },
    409: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'ข้อมูลซ้ำซ้อน (Conflict)',
    },
    500: {
      content: { 'application/json': { schema: ErrorSchema } },
      description: 'ข้อผิดพลาดทางเซิร์ฟเวอร์',
    },
  },
});
app.openapi(createUserRoute, (c) => {
  const body = c.req.valid('json'); 
  return userController.createUser(c, body);
});

const updateUserRolesRoute = createRoute({
  method: 'patch',
  path: '/{userId}/roles',
  tags: ['Users'],
  middleware: [authMiddleware, requirePermission('update', 'rbac')],
  request: {
    params: z.object({ userId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateUserRolesSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: UserSchema } }, description: 'User roles updated' },
    400: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Invalid role assignment' },
    403: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Forbidden' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'User not found' },
  },
});
app.openapi(updateUserRolesRoute, (c) =>
  userController.updateUserRoles(c, c.req.valid('param').userId, c.req.valid('json')),
);

const updateUserStatusRoute = createRoute({
  method: 'patch',
  path: '/{userId}/status',
  tags: ['Users'],
  middleware: [authMiddleware, requirePermission('update', 'user_management')],
  request: {
    params: z.object({ userId: z.string().uuid() }),
    body: { content: { 'application/json': { schema: UpdateUserStatusSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: UserSchema } }, description: 'User status updated' },
    403: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Forbidden' },
    404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'User not found' },
  },
});
app.openapi(updateUserStatusRoute, (c) =>
  userController.updateUserStatus(c, c.req.valid('param').userId, c.req.valid('json')),
);

const updateOwnProfileRoute = createRoute({
  method: 'patch',
  path: '/me',
  tags: ['Users'],
  middleware: [authMiddleware, requirePermission('update', 'profile')],
  request: {
    body: { content: { 'application/json': { schema: UpdateOwnProfileSchema } } },
  },
  responses: {
    200: { content: { 'application/json': { schema: UserSchema } }, description: 'Own profile updated' },
    400: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Invalid profile update' },
    401: { content: { 'application/json': { schema: ErrorSchema } }, description: 'Unauthorized' },
  },
});
app.openapi(updateOwnProfileRoute, (c) =>
  userController.updateOwnProfile(c, c.req.valid('json')),
);

export default app;
