// src/features/auth/actions/auth.actions.ts
'use server'

import { cookies } from 'next/headers';
import { serverFetch } from "@/lib/server-fetch";
import { redirect } from "next/navigation";
import { z } from "zod";
import { schemas } from "@/types/api-schemas";

// --- 1. สกัด Type จาก Zod Schemas ของ Backend ---
// ใช้ชื่ออ้างอิงตามที่ Backend กำหนดไว้ใน .openapi('LoginRequest') หรือ Path ของมัน
type LoginRequestDTO = z.infer<typeof schemas.LoginRequest>;
type LoginResponseDTO = z.infer<typeof schemas.LoginResponse>;
type RefreshSessionResponseDTO = z.infer<typeof schemas.RefreshSessionResponse>;

// สำหรับหน้า Register (เปลี่ยนชื่อ schemas.postApiv1users_Body ให้ตรงกับ Path ของ API คุณจริงๆ)
// สมมติว่าใน Backend API เป็น POST /users
type RegisterRequestDTO = z.infer<typeof schemas.CreateUserRequest>;

// --- 2. Type ผลลัพธ์สำหรับ Auth Actions (ของ Frontend) ---
type AuthResponse = {
  success: boolean;
  message: string;
  field?: string;
};

const cookieSecure = process.env.COOKIE_SECURE === "true";
const cookieSameSite =
  process.env.COOKIE_SAME_SITE === "strict" ||
  process.env.COOKIE_SAME_SITE === "none"
    ? process.env.COOKIE_SAME_SITE
    : "lax";
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

// ฟังก์ชันสำหรับสมัครสมาชิกผู้ใช้งานใหม่
export async function registerUserAction(data: RegisterRequestDTO): Promise<AuthResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || 'เกิดข้อผิดพลาด',
        field: result.field
      };
    }

    return { success: true, message: 'สมัครสมาชิกสำเร็จ!' };
  } catch {
    return { success: false, message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' };
  }
}

// ฟังก์ชันสำหรับเข้าสู่ระบบ
export async function loginUserAction(data: LoginRequestDTO): Promise<AuthResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.error, field: result.field };
    }

    // บังคับ Type ให้ result ตรงกับ Backend Schema
    const successData = result as LoginResponseDTO;

    const cookieStore = await cookies();

    // บันทึก JWT Token ลงใน HTTP-Only Cookie
    // โดย successData.token จะถูกบังคับให้มีอยู่จริงตาม Schema ของ Backend แน่นอน
    cookieStore.set('token', successData.token, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      domain: cookieDomain,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 วัน
    });

    return { success: true, message: successData.message };
  } catch (error) {
    console.error("Login Fetch Error:", error);
    return { success: false, message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' };
  }
}

type RecoveryActionResponse = {
  success: boolean;
  message: string;
  field?: string;
};

async function postAuthRecovery(
  endpoint: string,
  body: Record<string, string>,
): Promise<RecoveryActionResponse> {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: result.error || result.message || "Unable to process the request.",
        field: result.field,
      };
    }

    return {
      success: true,
      message: result.message || "If the email is registered, further instructions will be sent shortly.",
    };
  } catch (error) { // 👈 1. เติม (error) ตรงนี้
    // 👈 2. เพิ่ม console.error บรรทัดนี้ เพื่อให้มันปริ้นท์สาเหตุที่แท้จริงออกมาใน Terminal
    console.error(`🔥 ERROR [postAuthRecovery - ${endpoint}]:`, error);
    return {
      success: false,
      message: "Unable to connect to the authentication service.",
    };
  }
}

export async function requestUsernameRecoveryAction(email: string) {
  return postAuthRecovery("forgot-username", { email });
}

export async function requestPasswordResetAction(email: string) {
  return postAuthRecovery("forgot-password", { email });
}

export async function resetPasswordAction(token: string, newPassword: string) {
  return postAuthRecovery("reset-password", { token, newPassword });
}

export async function refreshSessionAction(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const result = await serverFetch<RefreshSessionResponseDTO>(
      "/api/v1/auth/refresh",
      { method: "POST" },
    );

    if (!result.token) {
      return { success: false, message: "Unable to refresh the session." };
    }

    const cookieStore = await cookies();
    cookieStore.set("token", result.token, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      domain: cookieDomain,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true, message: "Session refreshed." };
  } catch (error) {
    console.error("Session refresh error:", error);
    return {
      success: false,
      message: "Your role was updated. Please log out and log back in to apply it.",
    };
  }
}

export async function logoutAction() {
  try {
    // 1. ยิง API ไปบอก Backend ให้ทำลาย Token ฝั่งเซิร์ฟเวอร์
    await serverFetch("/api/v1/auth/logout", { method: "POST" });
  } catch (error) {
    console.error("Backend logout error:", error);
  }

  // 2. ลบ Cookie
  const cookieStore = await cookies();
  cookieStore.delete("token");

  // 3. Redirect กลับไปหน้า Login
  redirect("/login");
}
