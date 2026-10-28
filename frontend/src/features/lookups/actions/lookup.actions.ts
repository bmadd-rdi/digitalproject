// src/modules/lookups/lookup.actions.ts
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { schemas } from "@/types/api-schemas";
import { z } from "zod";

type LookupResponse = z.infer<typeof schemas.LookupResponse>;
type DivisionResponse = z.infer<typeof schemas.DivisionResponse>;
// budget_type is free text (no id-backed table), so the endpoint returns plain
// strings. Typed inline so this doesn't depend on the generated api-schemas.ts
// being regenerated after the backend schema change.
type StringLookupResponse = { data: string[] };

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

// +
// +export async function getProjectTypesAction() {
// +  return serverFetch<LookupResponse>("/api/v1/lookups/project-types", { skipToken: true });
// +}
// +
// +export async function getBudgetTypesAction() {
// +  return serverFetch<z.infer<typeof schemas.StringLookupResponse>>("/api/v1/lookups/budget-types", { skipToken: true });
// +}



export async function getProjectTypesAction() {
  return serverFetch<LookupResponse>("/api/v1/lookups/project-types", { skipToken: true });
}

export async function getBudgetTypesAction() {
  return serverFetch<StringLookupResponse>("/api/v1/lookups/budget-types", { skipToken: true });
}

// รายชื่อผู้วิเคราะห์ต้องล็อกอิน — จึงไม่ใส่ skipToken เพื่อให้ส่ง session token ไปด้วย
export async function getAnalystsLookupAction() {
  return serverFetch<{ data: { userId: string; name: string }[] }>("/api/v1/lookups/analysts");
}
