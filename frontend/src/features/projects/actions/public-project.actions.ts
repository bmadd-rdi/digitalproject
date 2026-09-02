"use server";

import { z } from "zod";
import { schemas } from "@/types/api-schemas";
import { serverFetch } from "@/lib/server-fetch";

export type PublicProjectsResponse = z.infer<typeof schemas.PaginatedPublicProjectResponse>;
export type PublicProject = z.infer<typeof schemas.PublicProject>;

export async function getPublicProjectsAction(queryString: string): Promise<PublicProjectsResponse> {
  return serverFetch<PublicProjectsResponse>(
    `/api/v1/public/projects${queryString ? `?${queryString}` : ""}`,
    { method: "GET", skipToken: true },
  );
}

export async function getPublicProjectAction(projectId: string): Promise<PublicProject> {
  return serverFetch<PublicProject>(`/api/v1/public/projects/${projectId}`, {
    method: "GET",
    skipToken: true,
  });
}
