// src/modules/lookups/lookup.actions.ts
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { schemas } from "@/types/api-schemas";
import { z } from "zod";

type LookupResponse = z.infer<typeof schemas.LookupResponse>;
type DivisionResponse = z.infer<typeof schemas.DivisionResponse>;

export async function getFourQuadrantsAction() {
  return serverFetch<LookupResponse>("/api/v1/lookups/four-quadrants", { skipToken: true });
}

export async function getDeputyGovernorsAction() {
  return serverFetch<LookupResponse>("/api/v1/lookups/deputy-governors", { skipToken: true });
}

export async function getDepartmentsAction() {
  return serverFetch<LookupResponse>("/api/v1/lookups/departments", { skipToken: true });
}

export async function getRolesAction() {
  return serverFetch<LookupResponse>("/api/v1/lookups/roles", { skipToken: true });
}

export async function getDivisionsAction(departmentId?: number) {
  const query = departmentId ? `?departmentId=${departmentId}` : "";
  return serverFetch<DivisionResponse>(`/api/v1/lookups/divisions${query}`, { skipToken: true });
}
