import { expect, test } from "bun:test";
import { getIntegrationContext } from "../setup/integration";

test("application registers critical routes without exposing sensitive schemas", async () => {
  const context = await getIntegrationContext();
  const response = await context.app.fetch(new Request("http://test.local/openapi-v1.json"));
  expect(response.status).toBe(200);
  const document = await response.json() as any;
  expect(document.paths["/api/v1/users/{userId}/roles"].patch.responses["403"]).toBeDefined();
  expect(document.paths["/api/v1/users/me"].patch.responses["401"]).toBeDefined();
  expect(document.paths["/api/v1/projects/{id}/secretary-review"].post.responses["409"]).toBeDefined();
  const publicSchema = JSON.stringify(document.components.schemas.PublicProject);
  expect(publicSchema).not.toContain("createdAt");
  expect(publicSchema).not.toContain("updatedAt");
  expect(publicSchema).not.toContain("attachments");
});
