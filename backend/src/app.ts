import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";
import { HTTPException } from "hono/http-exception";
import uploadRoutes from "./modules/uploads/upload.routes";
import userRoutesV1 from "./modules/users/user.routes";
import authRoutesV1 from "./modules/auth/auth.routes";
import healthRoutes from "./modules/health/health.routes";
import projectRoutes from "./modules/projects/project.routes";
import publicProjectRoutes from "./modules/projects/public-project.routes";
import proposalRoutes from "./modules/proposals/proposal.routes";
import meetingRoutes, { meetingAdminRouter } from "./modules/meeting/meeting.routes";
import { meetingController } from "./modules/meeting/meeting.controller";
import { CreateMeetingSchema } from "./modules/meeting/meeting.schema";
import { authMiddleware } from "./middlewares/auth.middleware";
import internalRoutes from "./modules/internal/internal.routes";
import lookupRoutes from "./modules/lookups/lookup.routes";
import { startCronJobs } from "./jobs/cron";
import { corsOrigins } from "./config/app-env";
import { productionEmailService } from "./infrastructure/email/email.service";
import { compressPdf } from "./infrastructure/files/pdf-compressor";
import { systemClock, type AppServices, type PdfCompressor } from "./shared/app/services";

export type CreateAppOptions = {
  startJobs?: boolean;
  emailService?: AppServices["emailService"];
  pdfCompressor?: PdfCompressor;
  clock?: AppServices["clock"];
};

const productionPdfCompressor: PdfCompressor = { compressPdf };

export function createApp(options: CreateAppOptions = {}) {
  const services: AppServices = {
    emailService: options.emailService ?? productionEmailService,
    pdfCompressor: options.pdfCompressor ?? productionPdfCompressor,
    clock: options.clock ?? systemClock,
  };

  const app = new OpenAPIHono<{ Variables: { appServices: AppServices } }>();
  app.use("*", trimTrailingSlash());

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return c.json({ message: err.message }, err.status);
    }

    console.error(err);
    return c.json({ message: "Internal Server Error" }, 500);
  });

  app.use("/*", async (c, next) => {
    c.set("appServices", services);
    await next();
  });

  app.use("/*", cors({
    origin: (origin) => corsOrigins.includes(origin) ? origin : undefined,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }));

  app.route("/health", healthRoutes);

  const v1 = new OpenAPIHono();
  v1.route("/users", userRoutesV1);
  v1.route("/auth", authRoutesV1);
  v1.route("/uploads", uploadRoutes);
  v1.route("/projects", projectRoutes);
  v1.route("/public", publicProjectRoutes);
  v1.route("/proposals", proposalRoutes);
  v1.route("/meetings", meetingRoutes);
  // Compatibility for clients that retained a trailing slash on the collection
  // route. Canonical OpenAPI remains POST /meetings.
  v1.post("/meetings/", authMiddleware, async (c) => {
    const parsed = CreateMeetingSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ message: "Invalid meeting request" }, 400);
    return meetingController.createMeeting(c, parsed.data);
  });
  v1.route("/admin", meetingAdminRouter);
  v1.route("/internal", internalRoutes);
  v1.route("/lookups", lookupRoutes);
  app.route("/api/v1", v1);

  app.doc("/openapi-v1.json", {
    openapi: "3.0.0",
    info: { title: "BMA Platform API (v1)", version: "1.0.0" },
  });
  app.get("/docs/", swaggerUI({ url: "/openapi-v1.json" }));

  if (options.startJobs) startCronJobs();
  return app;
}

export type BmaApp = ReturnType<typeof createApp>;
