// src/db/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { databaseEnv } from "@/config/database-env";

const client = postgres(databaseEnv.DATABASE_URL, {
  max: 10,
  connect_timeout: 10,
  idle_timeout: 20,
});
export const db = drizzle(client, { schema });
