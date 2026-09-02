import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const frontendDir = resolve(process.env.FRONTEND_DIR ?? join(process.cwd(), "..", "frontend"));
if (!existsSync(frontendDir)) {
  throw new Error(`Frontend repository not found at ${frontendDir}. Check out it as a sibling or set FRONTEND_DIR.`);
}

const packageJson = JSON.parse(readFileSync(join(frontendDir, "package.json"), "utf8")) as {
  scripts?: Record<string, string>;
};
for (const script of ["generate:types", "generate:schemas"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`Frontend package is missing ${script}`);
}

const packageManager = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const openapiUrl = process.env.OPENAPI_URL ?? "http://localhost:8081/openapi-v1.json";
for (const script of ["generate:types", "generate:schemas"]) {
  const result = Bun.spawnSync([packageManager, "run", script], {
    cwd: frontendDir,
    env: { ...process.env, OPENAPI_URL: openapiUrl },
    stdout: "inherit",
    stderr: "inherit",
  });
  if (result.exitCode !== 0) throw new Error(`Frontend ${script} failed with exit code ${result.exitCode}`);
}

for (const output of ["src/types/api.d.ts", "src/types/api-schemas.ts"]) {
  if (!existsSync(join(frontendDir, output))) throw new Error(`Generated frontend file is missing: ${output}`);
}
console.log(`Frontend OpenAPI generation verified from ${openapiUrl}`);
