import { execFileSync } from "node:child_process";

const mode = process.argv[2];
if (mode !== "types" && mode !== "schemas") {
  throw new Error("Usage: node scripts/generate-openapi.mjs <types|schemas>");
}

const openapiUrl = process.env.OPENAPI_URL ?? "http://localhost:8080/openapi-v1.json";
const response = await fetch(openapiUrl);
if (!response.ok) {
  throw new Error(`Unable to load OpenAPI document from ${openapiUrl}: ${response.status}`);
}

const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const generator = mode === "types" ? "openapi-typescript" : "openapi-zod-client";
const output = mode === "types" ? "src/types/api.d.ts" : "src/types/api-schemas.ts";

execFileSync(pnpm, ["exec", generator, openapiUrl, "-o", output], {
  stdio: "inherit",
  // Windows exposes pnpm as a .cmd shim, which Node cannot execute directly
  // without shell resolution. Unix keeps the direct executable behavior.
  shell: process.platform === "win32",
});

if (mode === "schemas") {
  execFileSync(process.execPath, ["scripts/normalize-generated-schemas.mjs"], {
    stdio: "inherit",
  });
}
