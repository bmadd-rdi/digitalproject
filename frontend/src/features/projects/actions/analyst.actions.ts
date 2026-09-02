"use server";

import { serverFetch } from "@/lib/server-fetch";
import { schemas } from "@/types/api-schemas";
import { z } from "zod";

export type AnalystAssignedProjectQuery = {
  page?: number;
  limit?: number;
  search?: string;
};

export type AnalystAssignedProjectsResponse = z.infer<
  typeof schemas.PaginatedAnalystAssignedProjectResponse
>;
export type AnalystReassignmentPayload = z.infer<
  typeof schemas.AnalystReassignmentRequest
>;
export type AnalystReviewPayload = z.infer<
  typeof schemas.AnalystReviewRequest
>;

export async function getAnalystAssignedProjectsAction(
  query: AnalystAssignedProjectQuery,
): Promise<AnalystAssignedProjectsResponse> {
  const params = new URLSearchParams({
    page: String(query.page ?? 1),
    limit: String(query.limit ?? 20),
  });
  if (query.search?.trim()) params.set("search", query.search.trim());

  return serverFetch<AnalystAssignedProjectsResponse>(
    `/api/v1/projects/analyst/assigned?${params.toString()}`,
    { method: "GET" },
  );
}

export async function requestAnalystReassignmentAction(
  projectId: string,
  payload: AnalystReassignmentPayload,
): Promise<z.infer<typeof schemas.AnalystWorkflowResponse>> {
  return serverFetch<z.infer<typeof schemas.AnalystWorkflowResponse>>(
    `/api/v1/projects/${projectId}/analyst-reassignment`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function reviewAnalystProjectAction(
  projectId: string,
  payload: AnalystReviewPayload,
): Promise<z.infer<typeof schemas.AnalystWorkflowResponse>> {
  return serverFetch<z.infer<typeof schemas.AnalystWorkflowResponse>>(
    `/api/v1/projects/${projectId}/analyst-review`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}
