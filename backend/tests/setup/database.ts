import { sql } from "drizzle-orm";

export async function verifyTestDatabase() {
  const { db } = await import("../../src/db");
  const [{ databaseName }] = await db.execute<{ databaseName: string }>(sql`select current_database() as "databaseName"`);
  if (databaseName !== "bma_test") {
    throw new Error(`Refusing to run integration tests against ${databaseName}`);
  }
}
