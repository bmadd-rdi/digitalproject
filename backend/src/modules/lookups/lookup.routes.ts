import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { lookupController } from "./lookup.controller";
import {
  LookupResponseSchema,
  DepartmentResponseSchema,
  DivisionResponseSchema,
  ProjectStatusResponseSchema,
  DivisionQuerySchema,
  ErrorSchema,
  ProjectAttachmentTypeLookupResponseSchema,
  StringLookupResponseSchema,
  AnalystLookupResponseSchema,
} from "./lookup.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";

const lookupsRouter = new OpenAPIHono();

// ==========================================
// LOOKUPS ROUTES
// ==========================================

const getDivisionsRoute = createRoute({
  method: "get",
  path: "/divisions",
  tags: ["Lookups"],
  summary: "ดึงข้อมูล Divisions (หน่วยงาน)",
  request: {
    query: DivisionQuerySchema,
  },
  responses: {
    200: {
      description: "รายการ Divisions",
      content: { "application/json": { schema: DivisionResponseSchema } },
    },
    // 401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } }
  },
});
lookupsRouter.openapi(getDivisionsRoute, (c) => {
  return lookupController.getDivisions(c);
});

const getDepartmentsRoute = createRoute({
  method: "get",
  path: "/departments",
  tags: ["Lookups"],
  summary: "ดึงข้อมูล Departments (หน่วยงานหลัก)",
  responses: {
    200: {
      description: "รายการ Departments",
      content: { "application/json": { schema: DepartmentResponseSchema } },
    }, // ใช้ Schema ที่คุณสร้างไว้
  },
});
lookupsRouter.openapi(getDepartmentsRoute, (c) => {
  return lookupController.getDepartments(c);
});

const getRolesRoute = createRoute({
  method: "get",
  path: "/roles",
  tags: ["Lookups"],
  summary: "Get available user roles",
  responses: {
    200: {
      description: "Available user roles",
      content: { "application/json": { schema: LookupResponseSchema } },
    },
  },
});
lookupsRouter.openapi(getRolesRoute, (c) => {
  return lookupController.getRoles(c);
});

const getFourQuadrantsRoute = createRoute({
  method: "get",
  path: "/four-quadrants",
  tags: ["Lookups"],
  summary: "ดึงข้อมูล 4 Quadrants Model",
  responses: {
    200: {
      description: "รายการ 4 Quadrants Model",
      content: { "application/json": { schema: LookupResponseSchema } },
    },
    // 401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } }
  },
});
lookupsRouter.openapi(getFourQuadrantsRoute, (c) => {
  return lookupController.getFourQuadrants(c);
});

const getDeputyGovernorsRoute = createRoute({
  method: "get",
  path: "/deputy-governors",
  tags: ["Lookups"],
  summary: "ดึงข้อมูลรองผู้ว่าฯ ที่กำกับดูแล",
  responses: {
    200: {
      description: "รายการรองผู้ว่าฯ",
      content: { "application/json": { schema: LookupResponseSchema } },
    },
    // 401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } }
  },
});
lookupsRouter.openapi(getDeputyGovernorsRoute, (c) => {
  return lookupController.getDeputyGovernors(c);
});

const getProjectStatusesRoute = createRoute({
  method: "get",
  path: "/project-statuses",
  tags: ["Lookups"],
  summary: "ดึงข้อมูลสถานะโครงการ",
  responses: {
    200: {
      description: "รายการสถานะโครงการ",
      content: { "application/json": { schema: ProjectStatusResponseSchema } },
    },
    // 401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } }
  },
});
lookupsRouter.openapi(getProjectStatusesRoute, (c) => {
  return lookupController.getProjectStatuses(c);
});

const getProjectTypesRoute = createRoute({
  method: "get",
  path: "/project-types",
  tags: ["Lookups"],
  summary: "Get project types",
  responses: {
    200: {
      description: "Available project types",
      content: { "application/json": { schema: LookupResponseSchema } },
    },
  },
});
lookupsRouter.openapi(getProjectTypesRoute, (c) => {
  return lookupController.getProjectTypes(c);
});

const getProjectAttachmentTypesRoute = createRoute({
  method: "get",
  path: "/project-attachment-types",
  tags: ["Lookups"],
  summary: "Get project attachment types",
  responses: {
    200: {
      description: "Available project attachment types",
      content: {
        "application/json": { schema: ProjectAttachmentTypeLookupResponseSchema },
      },
    },
  },
});
lookupsRouter.openapi(getProjectAttachmentTypesRoute, (c) => {
  return lookupController.getProjectAttachmentTypes(c);
});


const getBudgetTypesRoute = createRoute({
  method: "get",
  path: "/budget-types",
  tags: ["Lookups"],
  summary: "ดึงรายการประเภทงบประมาณ (distinct จาก proposal_budgets)",
  responses: {
    200: {
      description: "รายการประเภทงบประมาณ",
      content: { "application/json": { schema: StringLookupResponseSchema } },
    },
  },
});
lookupsRouter.openapi(getBudgetTypesRoute, (c) => {
  return lookupController.getBudgetTypes(c);
});

const getAnalystsRoute = createRoute({
  method: "get",
  path: "/analysts",
  tags: ["Lookups"],
  middleware: [authMiddleware],
  summary: "ดึงรายชื่อผู้วิเคราะห์ (เฉพาะ id และชื่อ) สำหรับตัวกรอง — ต้องล็อกอิน",
  responses: {
    200: {
      description: "รายชื่อผู้วิเคราะห์ที่ยังใช้งานอยู่",
      content: { "application/json": { schema: AnalystLookupResponseSchema } },
    },
    401: {
      description: "ยังไม่ได้ล็อกอิน",
      content: { "application/json": { schema: ErrorSchema } },
    },
  },
});
lookupsRouter.openapi(getAnalystsRoute, (c) => {
  return lookupController.getAnalysts(c);
});

export default lookupsRouter;
