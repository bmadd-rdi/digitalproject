function requireTestDatabaseUrl() {
  const value = (process.env.TEST_DATABASE_URL ??
    "postgresql://bma_test:bma_test_only_password@127.0.0.1:55433/bma_test").trim();

  const url = new URL(value);
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("TEST_DATABASE_URL must use PostgreSQL");
  }
  if (url.pathname.replace(/^\//, "") !== "bma_test") {
    throw new Error("TEST_DATABASE_URL must point to the bma_test database");
  }
  return value;
}

async function main() {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = requireTestDatabaseUrl();
  process.env.JWT_SECRET ??= `test-${crypto.randomUUID()}-${crypto.randomUUID()}`;

  const { runMigration } = await import("../../src/db/scripts/migrate");
  const { seedRequiredData } = await import("../../src/db/seeds/seed-required");

  await runMigration();
  await seedRequiredData();
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Test database preparation failed:", error);
    process.exitCode = 1;
  });
}

export { requireTestDatabaseUrl };
