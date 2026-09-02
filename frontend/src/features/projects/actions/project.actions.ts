// src/features/projects/actions/project.actions.ts
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidatePath } from "next/cache";
import { schemas } from "@/types/api-schemas";
import { z } from "zod";

type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

type PaginatedResponse = z.infer<typeof schemas.PaginatedProjectResponse>;
type ProjectResponse = z.infer<typeof schemas.Project>;
type LookupResponse = z.infer<typeof schemas.LookupResponse>;
export type UpdateProjectPayload = z.infer<typeof schemas.UpdateProjectRequest>;
export type CancelSubmitResponse = z.infer<typeof schemas.CancelSubmitResponse>;
export type ProjectVisibilityResponse = z.infer<typeof schemas.ProjectVisibilityResponse>;

export type SecretaryReviewPayload =
  z.infer<typeof schemas.SecretaryReviewRequest>;

export type SecretaryReviewResponse = z.infer<typeof schemas.SecretaryReviewResponse>;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// --- Action สำหรับสร้างโครงการ ---
export async function createProjectAction(payload: Record<string, unknown>): Promise<ActionResponse> {
  try {
    const result = await serverFetch("/api/v1/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Revalidate เพื่อสั่งให้ Next.js เคลียร์ Cache และโหลดข้อมูลใหม่ในหน้า Projects List ทันที
    revalidatePath("/projects");

    return { success: true, message: "สร้างโครงการสำเร็จ", data: result };
  } catch (error: unknown) {
    if (!(error instanceof Error)) error = new Error();
    return { success: false, message: getErrorMessage(error, "ไม่สามารถสร้างโครงการได้") };
  }
}

// --- Action สำหรับดึงข้อมูลโครงการทั้งหมด (ปรับปรุงใหม่สำหรับ React Query) ---
export async function getProjectsAction(queryString: string): Promise<PaginatedResponse> {
  try {
    // 1. เรียก API ด้วย serverFetch (ซึ่งจะจัดการเรื่องการแนบ Token / Cookie ให้เราอัตโนมัติ)
    const response = await serverFetch(`/api/v1/projects?${queryString}`, {
      method: "GET",
    });

    // 2. ตรวจสอบว่า serverFetch ของคุณคืนค่ามาเป็นแบบไหน
    // กรณีที่ 1: คืนค่าเป็นตัวแปรประเภท Response (เหมือน fetch ปกติ)
    if (response instanceof Response) {
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      }
      return (await response.json()) as PaginatedResponse;
    }

    // กรณีที่ 2: serverFetch ของคุณทำ .json() มาให้เรียบร้อยแล้ว
    return response as PaginatedResponse;

  } catch (error: unknown) {
    if (!(error instanceof Error)) error = new Error();
    // 3. 🚨 หากเกิด Error เราจะ throw กลับไปตรงๆ
    // เพื่อให้ตัวจัดการ State อย่าง TanStack Query (isError) ตรวจจับได้
    throw new Error(getErrorMessage(error, "ไม่สามารถติดต่อฐานข้อมูลโครงการได้"));
  }
}

// --- Action สำหรับดึงข้อมูลโครงการตาม ID ---
export async function getProjectByIdAction(id: string): Promise<ProjectResponse> {
  try {
    const response = await serverFetch(`/api/v1/projects/${id}`, {
      method: "GET",
    });

    if (response instanceof Response) {
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      }
      return (await response.json()) as ProjectResponse;
    }

    return response as ProjectResponse;
  } catch (error: unknown) {
    if (!(error instanceof Error)) error = new Error();
    throw new Error(getErrorMessage(error, "ไม่สามารถดึงข้อมูลโครงการได้"));
  }
}

export async function getSecretaryPendingProjectsAction(
  queryString: string,
): Promise<PaginatedResponse> {
  return serverFetch<PaginatedResponse>(
    `/api/v1/projects/secretary/pending?${queryString}`,
    { method: "GET" },
  );
}

export async function reviewSecretaryProjectAction(
  projectId: string,
  payload: SecretaryReviewPayload,
): Promise<SecretaryReviewResponse> {
  return serverFetch<SecretaryReviewResponse>(
    `/api/v1/projects/${projectId}/secretary-review`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function getProjectTypesAction(): Promise<LookupResponse> {
  return serverFetch<LookupResponse>("/api/v1/lookups/project-types", {
    method: "GET",
  });
}

export async function updateProjectAction(
  projectId: string,
  payload: UpdateProjectPayload,
): Promise<{ message: string; project: ProjectResponse }> {
  return serverFetch<{ message: string; project: ProjectResponse }>(
    `/api/v1/projects/${projectId}`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}

export async function cancelSubmitProjectAction(
  projectId: string,
): Promise<CancelSubmitResponse> {
  return serverFetch<CancelSubmitResponse>(
    `/api/v1/projects/${projectId}/cancel-submit`,
    { method: "POST" },
  );
}

export async function updateProjectVisibilityAction(
  projectId: string,
  isPublic: boolean,
): Promise<ProjectVisibilityResponse> {
  return serverFetch<ProjectVisibilityResponse>(
    `/api/v1/projects/${projectId}/visibility`,
    {
      method: "PATCH",
      body: JSON.stringify({ isPublic }),
    },
  );
}
