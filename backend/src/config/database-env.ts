import { z } from "zod";

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().trim().min(1, "DATABASE_URL is required").refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "postgres:" || url.protocol === "postgresql:";
    } catch {
      return false;
    }
  }, "DATABASE_URL must be a valid PostgreSQL URL"),
});

export const databaseEnv = databaseEnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
