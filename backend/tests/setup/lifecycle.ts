import { afterAll, beforeAll } from "bun:test";
import { rm } from "node:fs/promises";
import { configureTestEnvironment } from "./env";

let configured = false;

export function useIntegrationLifecycle() {
  beforeAll(async () => {
    if (!configured) {
      await configureTestEnvironment();
      configured = true;
    }
  });

  afterAll(async () => {
    if (process.env.UPLOAD_STORAGE_DIR) {
      await rm(process.env.UPLOAD_STORAGE_DIR, { recursive: true, force: true });
    }
  });
}
