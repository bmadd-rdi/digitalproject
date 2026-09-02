// src/lib/session.ts
import { cookies } from "next/headers";

// ฟังก์ชันแกะ JWT Token
export function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// ดึง Session ของuserปัจจุบันจาก Cookie (ใช้ใน Server Actions หรือ Server Components)
export async function getUserSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  const payload = decodeJwt(token);

  if (!payload) {
    return null;
  }

  // จัดโครงสร้างให้เรียกใช้ userId ได้ง่ายๆ เสมอ (เผื่อ Backend ใช้ชื่อฟิลด์อื่น)
  return {
    ...payload,
    userId: payload.userId || payload.id || payload.sub,
  };
}
