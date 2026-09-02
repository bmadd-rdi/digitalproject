import { z } from "zod";
import { isAbsolute } from "node:path";

const placeholderSecretPattern = /(replace[_-]with|change[_-]me|your[_-]|example|password123)/i;

function parseCorsOriginList(value: string) {
  const normalized = value.trim().replace(/^\[/, "").replace(/\]$/, "");
  return normalized
    .split(",")
    .map((origin) => origin.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

const explicitBoolean = (defaultValue: "true" | "false" = "false") =>
  z.string().default(defaultValue).transform((value, ctx) => {
    const normalized = value.trim().toLowerCase();
    if (normalized !== "true" && normalized !== "false") {
      ctx.addIssue({ code: "custom", message: "Expected true or false" });
      return z.NEVER;
    }
    return normalized === "true";
  });

const appEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8081),
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must contain at least 32 characters"),
  PUBLIC_API_URL: z.string().url().default("http://localhost:8080/api/v1"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  UPLOAD_STORAGE_DIR: z.string().trim().min(1).default("uploads"),
  MAX_UPLOAD_SIZE: z.coerce.number().int().positive().default(25 * 1024 * 1024),
  TRUST_PROXY: explicitBoolean(),
  COOKIE_SECURE: explicitBoolean(),
  COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  COOKIE_DOMAIN: z.string().default(""),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_SECURE: explicitBoolean(),
  SMTP_FROM_NAME: z.string().default("BMA Digital Project"),
  SMTP_FROM_EMAIL: z.string().default("noreply@bangkok.go.th"),
  RESEND_API_KEY: z.string().optional(),
}).superRefine((data, ctx) => {
  const strictRuntime = data.NODE_ENV === "production";

  try {
    const databaseUrl = new URL(data.DATABASE_URL);
    if (databaseUrl.protocol !== "postgres:" && databaseUrl.protocol !== "postgresql:") {
      ctx.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "DATABASE_URL must use PostgreSQL" });
    }
  } catch {
    ctx.addIssue({ code: "custom", path: ["DATABASE_URL"], message: "DATABASE_URL must be a valid PostgreSQL URL" });
  }

  if (strictRuntime && !isAbsolute(data.UPLOAD_STORAGE_DIR)) {
    ctx.addIssue({ code: "custom", path: ["UPLOAD_STORAGE_DIR"], message: "UPLOAD_STORAGE_DIR must be absolute in production" });
  }

  if (strictRuntime && placeholderSecretPattern.test(data.JWT_SECRET)) {
    ctx.addIssue({ code: "custom", path: ["JWT_SECRET"], message: "JWT_SECRET must not be a placeholder" });
  }

  const origins = parseCorsOriginList(data.CORS_ORIGINS);
  if (strictRuntime && (origins.length === 0 || origins.includes("*"))) {
    ctx.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: "Staging and production require explicit CORS origins" });
  }
  for (const origin of origins) {
    try {
      const parsed = new URL(origin);
      if (!parsed.origin || parsed.origin === "null") throw new Error("invalid origin");
    } catch {
      ctx.addIssue({ code: "custom", path: ["CORS_ORIGINS"], message: `Invalid CORS origin: ${origin}` });
    }
  }
});

export function parseAppEnv(source: Record<string, string | undefined> = process.env) {
  return appEnvSchema.parse({
    NODE_ENV: source.NODE_ENV,
    PORT: source.PORT,
    DATABASE_URL: source.DATABASE_URL,
    JWT_SECRET: source.JWT_SECRET,
    PUBLIC_API_URL: source.PUBLIC_API_URL,
    CORS_ORIGINS: source.CORS_ORIGINS,
    UPLOAD_STORAGE_DIR: source.UPLOAD_STORAGE_DIR,
    MAX_UPLOAD_SIZE: source.MAX_UPLOAD_SIZE,
    TRUST_PROXY: source.TRUST_PROXY,
    COOKIE_SECURE: source.COOKIE_SECURE,
    COOKIE_SAME_SITE: source.COOKIE_SAME_SITE,
    COOKIE_DOMAIN: source.COOKIE_DOMAIN,
    FRONTEND_URL: source.FRONTEND_URL,
    SMTP_HOST: source.SMTP_HOST,
    SMTP_PORT: source.SMTP_PORT,
    SMTP_USER: source.SMTP_USER,
    SMTP_PASS: source.SMTP_PASS,
    SMTP_SECURE: source.SMTP_SECURE,
    SMTP_FROM_NAME: source.SMTP_FROM_NAME,
    SMTP_FROM_EMAIL: source.SMTP_FROM_EMAIL,
    RESEND_API_KEY: source.RESEND_API_KEY,
  });
}

export const appEnv = parseAppEnv();

export const corsOrigins = parseCorsOriginList(appEnv.CORS_ORIGINS);

export type AppEnv = z.infer<typeof appEnvSchema>;
