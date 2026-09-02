import { describe, expect, test } from "bun:test";
import { parseAppEnv } from "../../src/config/app-env";

const baseEnv = {
  NODE_ENV: "production",
  DATABASE_URL: "postgresql://bma_app:password@db.internal:5432/bma_db",
  JWT_SECRET: "a-real-staging-secret-that-is-longer-than-32-characters",
  PUBLIC_API_URL: "https://staging.example.invalid/api/v1",
  CORS_ORIGINS: "https://staging.example.invalid",
  UPLOAD_STORAGE_DIR: "/app/uploads",
  MAX_UPLOAD_SIZE: "26214400",
  TRUST_PROXY: "true",
  COOKIE_SECURE: "true",
  COOKIE_SAME_SITE: "lax",
};

describe("application environment validation", () => {
  test("accepts strict staging configuration", () => {
    expect(parseAppEnv(baseEnv).MAX_UPLOAD_SIZE).toBe(26214400);
    expect(parseAppEnv(baseEnv).TRUST_PROXY).toBe(true);
  });

  test("rejects a placeholder secret, wildcard CORS, and relative upload path", () => {
    expect(() => parseAppEnv({
      ...baseEnv,
      JWT_SECRET: "replace-with-a-unique-staging-secret-at-least-32-characters",
      CORS_ORIGINS: "*",
      UPLOAD_STORAGE_DIR: "uploads",
    })).toThrow();
  });

  test("rejects invalid boolean and upload-size values", () => {
    expect(() => parseAppEnv({ ...baseEnv, TRUST_PROXY: "yes" })).toThrow();
    expect(() => parseAppEnv({ ...baseEnv, MAX_UPLOAD_SIZE: "0" })).toThrow();
  });
});
