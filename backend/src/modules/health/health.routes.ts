import { OpenAPIHono } from "@hono/zod-openapi";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { access, constants, open, unlink } from "node:fs/promises";
import { join } from "node:path";
import { appEnv } from "@/config/app-env";

const app = new OpenAPIHono();

export async function verifyUploadStorage(uploadDirectory = appEnv.UPLOAD_STORAGE_DIR) {
  await access(uploadDirectory, constants.F_OK | constants.W_OK);

  const probePath = join(uploadDirectory, `.bma-readiness-${randomUUID()}.probe`);
  let created = false;
  try {
    const handle = await open(probePath, "wx");
    created = true;
    try {
      await handle.writeFile("bma-readiness-probe");
    } finally {
      await handle.close();
    }
  } finally {
    if (created) {
      await unlink(probePath);
    }
  }
}

async function checkReadiness() {
  await db.execute(sql`SELECT 1`);
  await verifyUploadStorage();
}

app.get("/live", (c) => c.json({
  status: "ok",
  timestamp: new Date().toISOString(),
}, 200));

app.get("/ready", async (c) => {
  try {
    await checkReadiness();
    return c.json({
      status: "ok",
      database: "connected",
      uploadStorage: "writable",
      timestamp: new Date().toISOString(),
    }, 200);
  } catch (error) {
    console.error("Health readiness check failed:", error);
    return c.json({ status: "error", database: "unavailable", uploadStorage: "unavailable" }, 503);
  }
});

// Backward-compatible readiness endpoint.
app.get("/", async (c) => {
  try {
    await checkReadiness();
    return c.json({
      status: "ok",
      database: "connected",
      uploadStorage: "writable",
      timestamp: new Date().toISOString(),
    }, 200);
  } catch {
    return c.json({ status: "error", database: "unavailable", uploadStorage: "unavailable" }, 503);
  }
});

export default app;
