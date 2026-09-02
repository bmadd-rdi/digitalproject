// src/features/users/actions/user.actions.ts
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { schemas } from "@/types/api-schemas";
import { z } from "zod";

// ใช้ Type ที่ Generate มาจาก Backend Schema
type UserProfileResponse = z.infer<typeof schemas.UserProfileResponse>;
type UpdateOwnProfileRequest = z.infer<typeof schemas.UpdateOwnProfileRequest>;

export async function getUserProfileAction(userId: string): Promise<UserProfileResponse> {
  try {
    // ยิง API ไปที่ Route ดึงข้อมูลรายบุคคล
    const response = await serverFetch(`/api/v1/users/profile/${userId}`, {
      method: "GET",
    });

    if (response instanceof Response) {
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "ไม่สามารถดึงข้อมูลโปรไฟล์ได้");
      }
      return (await response.json()) as UserProfileResponse;
    }

    return response as UserProfileResponse;
  } catch (error: unknown) {
    // ใช้ Type Guard เช็คให้มั่นใจว่าเป็น Instance ของ Error จริงๆ
    const errorMessage = error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการติดต่อเซิร์ฟเวอร์";
    throw new Error(errorMessage);
  }
}

export async function updateUserRolesAction(userId: string, roleIds: number[]) {
  return serverFetch<UserProfileResponse>(`/api/v1/users/${userId}/roles`, {
    method: "PATCH",
    body: JSON.stringify({ roleIds }),
  });
}

export async function updateUserStatusAction(userId: string, isActive: boolean) {
  return serverFetch<UserProfileResponse>(`/api/v1/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export async function updateOwnProfileAction(data: UpdateOwnProfileRequest) {
  return serverFetch<UserProfileResponse>("/api/v1/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
