// src/lib/server-fetch.ts
import { cookies } from "next/headers";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
  skipToken?: boolean;
};

/**
 * ฟังก์ชันสำหรับยิง API ภายใน Server Actions
 * - จัดการดึง Token จาก HTTP-Only Cookie มาใส่ Header ให้อัตโนมัติ
 * - จัดการ Error กลาง
 */
export async function serverFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token && !options.skipToken) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const backendBaseUrl = process.env.BACKEND_URL;
  if (!backendBaseUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  const url = new URL(
    `${backendBaseUrl.replace(/\/+$/, "")}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
  );

  // แปลง params ให้เป็น Query String (เช่น ?status=pending)
  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers,
    });

    // ดึงค่า response ออกมาเช็ค (รองรับกรณี API ตอบกลับเป็นค่าว่าง เช่น 204 No Content)
    const text = await response.text();
    // console.log("--- DEBUG SERVER FETCH ---");
    // console.log("URL ที่ยิงไป:", url.toString());
    // console.log("สถานะ HTTP:", response.status);
    // console.log("ข้อความที่ได้มา:", text);
    // console.log("--------------------------");
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      let errorDetail = data.message || data.error || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      if (typeof errorDetail === "object") {
        errorDetail = JSON.stringify(errorDetail);
      }
      throw new Error(errorDetail);
    }

    return data as T;
  } catch (error: unknown) {
    console.error(`[ServerFetch Error] ${endpoint}:`, error);
    throw error;
  }
}
