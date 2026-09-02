import { configureTestEnvironment } from "../setup/env";

await configureTestEnvironment();
const { createApp } = await import("../../src/app");
const app = createApp({ startJobs: false });
const response = await app.fetch(new Request("http://contract.test/openapi-v1.json"));
if (!response.ok) throw new Error(`OpenAPI endpoint returned ${response.status}`);

const document = await response.json() as {
  paths?: Record<string, Record<string, any>>;
  components?: { schemas?: Record<string, any> };
};
const paths = document.paths ?? {};
const requiredRoutes = [
  ["/api/v1/auth/login", "post"],
  ["/api/v1/users/{userId}/roles", "patch"],
  ["/api/v1/users/{userId}/status", "patch"],
  ["/api/v1/users/me", "patch"],
  ["/api/v1/projects/{id}/cancel-submit", "post"],
  ["/api/v1/projects/{id}/secretary-review", "post"],
  ["/api/v1/proposals/projects/{projectId}", "get"],
  ["/api/v1/proposals/projects/{projectId}/submit", "post"],
] as const;

for (const [path, method] of requiredRoutes) {
  if (!paths[path]?.[method]) throw new Error(`Missing OpenAPI route registration: ${method.toUpperCase()} ${path}`);
}

const loginResponses = paths["/api/v1/auth/login"].post.responses;
if (!loginResponses["403"]) throw new Error("Login must document HTTP 403 for inactive accounts");
if (!paths["/api/v1/users/{userId}/roles"].patch.responses["403"]) {
  throw new Error("Role management must document HTTP 403");
}
if (!paths["/api/v1/projects/{id}/secretary-review"].post.responses["409"]) {
  throw new Error("Secretary review must document HTTP 409 for state conflicts");
}

const schemas = document.components?.schemas ?? {};
const userSchema = JSON.stringify(schemas.UserProfileResponse ?? schemas.UserSchema ?? {});
for (const sensitiveField of ["password", "verificationToken", "resetPasswordToken", "verificationExpires", "resetPasswordExpires"]) {
  if (userSchema.includes(sensitiveField)) throw new Error(`Sensitive field leaked in user response schema: ${sensitiveField}`);
}
const publicProjectSchema = JSON.stringify(schemas.PublicProject ?? {});
for (const sensitiveField of ["ownerId", "attachments", "createdAt", "updatedAt", "internalRemarks"]) {
  if (publicProjectSchema.includes(`\"${sensitiveField}\"`)) {
    throw new Error(`Sensitive field leaked in public project schema: ${sensitiveField}`);
  }
}

console.log(`Backend OpenAPI contract verified: ${Object.keys(paths).length} paths`);
