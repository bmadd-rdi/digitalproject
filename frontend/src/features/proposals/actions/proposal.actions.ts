// src/features/proposals/actions/proposal.actions.ts
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { revalidatePath } from "next/cache";

type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
};

type JsonRecord = Record<string, unknown>;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

// ============================================================================
// 1. Action สำหรับเริ่มต้นสร้างแบบร่าง (Initialize Draft)
// ============================================================================
export async function initializeDraftAction(projectId: string): Promise<ActionResponse> {
  try {
    const result = await serverFetch(`/api/v1/proposals/projects/${projectId}/draft`, {
      method: "POST",
    });

    return { success: true, message: "สร้างแบบร่างสำเร็จ", data: result };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "ไม่สามารถสร้างแบบร่างได้") };
  }
}

// ============================================================================
// 2. Action สำหรับบันทึกแบบร่าง (Auto-Save / Upsert Draft)
// ============================================================================
// รองรับข้อมูลแบบ Loose Schema ตามที่ Backend กำหนดไว้ใน draftProposalSchema
export async function saveDraftAction(projectId: string, payload: JsonRecord): Promise<ActionResponse> {
  try {
    const result = await serverFetch(`/api/v1/proposals/projects/${projectId}/draft`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    return { success: true, message: "บันทึกแบบร่างสำเร็จ", data: result };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "ไม่สามารถบันทึกแบบร่างได้") };
  }
}

// ============================================================================
// 3. Action สำหรับดึงข้อมูลแบบร่าง (Get Draft)
// ============================================================================
export async function getDraftAction(projectId: string) {
  try {
    const response = await serverFetch(`/api/v1/proposals/projects/${projectId}/draft`, {
      method: "GET",
    });

    // ตรวจสอบว่า serverFetch คืนค่าเป็น Response (เหมือน fetch ปกติ)
    if (response instanceof Response) {
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์");
      }
      return await response.json();
    }

    // หรือ serverFetch ทำ .json() มาให้แล้ว
    return response;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "ไม่สามารถดึงข้อมูลแบบร่างได้"));
  }
}

// ============================================================================
// 4. Action สำหรับยื่นเสนอโครงการ (Submit Proposal ตัวจริง)
// ============================================================================
// ต้องส่งข้อมูลที่ผ่านการ Validate ตาม submitProposalSchema (Strict)
export async function submitProposalAction(projectId: string, payload: JsonRecord): Promise<ActionResponse> {
  try {
    const result = await serverFetch(`/api/v1/proposals/projects/${projectId}/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Revalidate เพื่อเคลียร์ Cache หน้า Projects List และ Project Detail
    // เพื่อให้แสดงสถานะล่าสุดว่ามีการ "Submitted" แล้ว
    revalidatePath("/projects");
    revalidatePath(`/projects/${projectId}`);

    return { success: true, message: "ยื่นเสนอโครงการสำเร็จ", data: result };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "ไม่สามารถยื่นเสนอโครงการได้") };
  }
}
