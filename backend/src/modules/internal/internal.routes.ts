import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { ipWhitelistMiddleware } from '../../middlewares/ip-whitelist.middleware';
import { getCloudRequests } from './internal.controller';
import { CloudRequestSchema, CloudRequestQuerySchema } from './internal.schema';

const internalRouter = new OpenAPIHono();

// ใช้ IP Whitelist Middleware แทน Auth Middleware (JWT)
internalRouter.use('*', ipWhitelistMiddleware);

const getCloudRequestsRoute = createRoute({
  method: 'get',
  path: '/cloud-requests',
  tags: ['Internal'],
  summary: 'ดึงข้อมูลการร้องขอ Cloud และ VM (สำหรับ Internal API)',
  request: {
    query: CloudRequestQuerySchema
  },
  responses: {
    200: {
      description: 'ข้อมูล Cloud Requests พร้อมรายละเอียด VM',
      content: {
        'application/json': { schema: z.object({ data: z.array(CloudRequestSchema) }) }
      }
    },
    403: {
      description: 'ถูกปฏิเสธเนื่องจาก IP ไม่อยู่ใน Whitelist',
      content: { 'application/json': { schema: z.object({ message: z.string() }) } }
    }
  }
});
internalRouter.openapi(getCloudRequestsRoute, (c) => {
  const query = c.req.valid('query');
  return getCloudRequests(c, query.projectId, query.projectCode);
});

export default internalRouter;