import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export function configureTestEnvironment() {
  const testDatabaseUrl = (process.env.TEST_DATABASE_URL ??
    "postgresql://bma_test:bma_test_only_password@127.0.0.1:55433/bma_test").trim();

  const url = new URL(testDatabaseUrl);
  const databaseName = url.pathname.replace(/^\//, "");
  if (databaseName !== "bma_test") {
    throw new Error("Integration tests may only use the bma_test database");
  }

  process.env.NODE_ENV = "test";
  process.env.TEST_DATABASE_URL = testDatabaseUrl;
  process.env.DATABASE_URL = testDatabaseUrl;
  process.env.JWT_SECRET ??= `test-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  process.env.PUBLIC_API_URL ??= "http://localhost:8081/api/v1";
  process.env.UPLOAD_STORAGE_DIR ??= join(process.cwd(), ".test-uploads");

  return mkdir(process.env.UPLOAD_STORAGE_DIR, { recursive: true });
}
