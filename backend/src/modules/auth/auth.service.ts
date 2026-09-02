// src/modules/auth/auth.service.ts
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";

// เปลี่ยนชื่อ Parameter จาก username เป็น identifier เพื่อความชัดเจน
export const verifyUser = async (identifier: string) => {
  const result = await db
    .select()
    .from(users)
    .where(
      // ค้นหาทั้งจาก username และ email
      or(
        eq(users.username, identifier),
        eq(users.email, identifier)
      )
    );
  return result[0];
};
