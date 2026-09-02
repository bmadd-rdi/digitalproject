"use server";

import { serverFetch } from "@/lib/server-fetch";
import { schemas } from "@/types/api-schemas";
import { z } from "zod";

export type AssignmentProjectQuery = {
  page?: number;
  limit?: number;
  search?: string;
};
export type AssignmentProjectsResponse = z.infer<
  typeof schemas.PaginatedAssignmentProjectResponse
>;
export type AnalystWorkloadResponse = z.infer<
  typeof schemas.AnalystWorkloadResponse
>;
export type AssignProjectPayload = z.infer<typeof schemas.AssignProjectRequest>;
export type BulkAssignProjectPayload = z.infer<
  typeof schemas.BulkAssignProjectRequest
>;
export type BulkAssignProjectResponse = z.infer<
  typeof schemas.BulkAssignProjectResponse
>;

export async function getAssignmentProjectsAction(
  query: AssignmentProjectQuery,
): Promise<AssignmentProjectsResponse> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
  });

  if (query.search?.trim()) params.set("search", query.search.trim());

  return serverFetch<AssignmentProjectsResponse>(
    `/api/v1/projects/assignment/pending?${params.toString()}`,
    { method: "GET" },
  );
}

export async function getAnalystWorkloadsAction(): Promise<AnalystWorkloadResponse> {
  return serverFetch<AnalystWorkloadResponse>(
    "/api/v1/users/analysts/workload",
    { method: "GET" },
  );
}

export async function assignProjectAction(
  projectId: string,
  payload: AssignProjectPayload,
): Promise<z.infer<typeof schemas.Project>> {
  return serverFetch<z.infer<typeof schemas.Project>>(`/api/v1/projects/${projectId}/assign`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function bulkAssignProjectsAction(
  payload: BulkAssignProjectPayload,
): Promise<BulkAssignProjectResponse> {
  return serverFetch<BulkAssignProjectResponse>(
    "/api/v1/projects/assignment/bulk",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
