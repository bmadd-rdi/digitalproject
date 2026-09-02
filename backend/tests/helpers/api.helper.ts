import type { BmaApp } from "../../src/app";
import type { UserContext } from "../../src/shared/auth/permission.helper";
import { authHeaders } from "./auth.helper";

export async function requestJson(
  app: BmaApp,
  path: string,
  options: Omit<RequestInit, "body"> & { user?: UserContext; body?: unknown } = {},
) {
  const headers = new Headers(options.headers);
  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (options.user) {
    for (const [key, value] of Object.entries(await authHeaders(options.user))) headers.set(key, value);
  }

  const response = await app.fetch(new Request(`http://test.local${path}`, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  }));
  const text = await response.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { response, data };
}
