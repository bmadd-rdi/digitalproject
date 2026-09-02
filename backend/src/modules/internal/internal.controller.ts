import type { Context } from "hono";
import * as internalService from "./internal.service";

export const getCloudRequests = async (c: Context, projectId?: string, projectCode?: string) => {
  const data = await internalService.getCloudRequests(projectId, projectCode);
  return c.json({ data }, 200);
};