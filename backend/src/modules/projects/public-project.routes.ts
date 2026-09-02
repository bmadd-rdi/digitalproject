import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { ErrorSchema, PaginatedPublicProjectResponseSchema, PublicProjectQuerySchema, PublicProjectSchema, ProjectIdParamsSchema } from "./project.schema";
import * as projectController from "./project.controller";

const app = new OpenAPIHono();

app.openapi(createRoute({
  method: "get",
  path: "/projects",
  tags: ["Public Projects"],
  summary: "แสดงรายการโครงการที่เผยแพร่สู่สาธารณะ",
  request: { query: PublicProjectQuerySchema },
  responses: {
    200: { content: { "application/json": { schema: PaginatedPublicProjectResponseSchema } }, description: "รายการโครงการสาธารณะ" },
  },
}), (c) => projectController.getPublicProjects(c, c.req.valid("query")));

app.openapi(createRoute({
  method: "get",
  path: "/projects/{id}",
  tags: ["Public Projects"],
  summary: "แสดงรายละเอียดโครงการที่เผยแพร่สู่สาธารณะ",
  request: { params: ProjectIdParamsSchema },
  responses: {
    200: { content: { "application/json": { schema: PublicProjectSchema } }, description: "รายละเอียดโครงการสาธารณะ" },
    404: { content: { "application/json": { schema: ErrorSchema } }, description: "ไม่พบโครงการสาธารณะ" },
  },
}), (c) => projectController.getPublicProjectById(c, c.req.valid("param").id));

export default app;
