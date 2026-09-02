// src/middlewares/auth.middleware.ts
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { UserContext } from '../shared/auth/permission.helper';
import type { Role } from '../config/permissions.config';
import { appEnv } from "@/config/app-env";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const cookieToken = getCookie(c, 'token');

  let token = cookieToken;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    throw new HTTPException(401, { message: 'Unauthorized: ไม่พบ Token ยืนยันตัวตน' });
  }

  try {
    const decodedPayload = await verify(token, appEnv.JWT_SECRET, 'HS256') as any;

    // ตรวจสอบและจัดรูปแบบข้อมูลผู้ใช้งานจาก Payload ของ JWT
    let userRoles: Role[] = [];
    if (Array.isArray(decodedPayload.roles)) {
      userRoles = decodedPayload.roles;
    } else if (typeof decodedPayload.role === 'string') {
      userRoles = [decodedPayload.role as Role];
    } else {
      userRoles = ['user']; // Default หากไม่มีการระบุสิทธิ์ใดๆ
    }

    const formattedUser: UserContext = {
      userId: decodedPayload.userId || decodedPayload.id,
      roles: userRoles, 
      divisionId: Number(decodedPayload.divisionId) || 0,
      departmentId: Number(decodedPayload.departmentId) || 0,
    };

    if (!formattedUser.userId) {
      throw new Error("Invalid payload: Missing User ID");
    }
// ตรวจสอบสถานะ User ในฐานข้อมูล
    const [currentUser] = await db
      .select({ isActive: users.isActive })
      .from(users)
      .where(eq(users.userId, formattedUser.userId))
      .limit(1);

    if (!currentUser?.isActive) {
      // โยน Error ออกไปถ้า User ถูกปิดการใช้งาน (Inactive)
      throw new HTTPException(401, { message: "Account is inactive or session is no longer valid" });
    }

    // ฝากข้อมูลลง Context เพื่อส่งต่อให้ Controller
    c.set('user', formattedUser);
    await next();
  } catch (error) {
    // ✅ จุดที่ปรับแก้: เช็คก่อนว่า Error เป็นสิ่งที่เราโยนออกไปเองหรือไม่ (เช่น Inactive)
    if (error instanceof HTTPException) {
      throw error; 
    }
    
    // ถ้าเป็น Error อื่นๆ (เช่น แกะ JWT ไม่ผ่าน, Token หมดอายุ) ให้แสดงข้อความนี้
    throw new HTTPException(401, { message: 'Unauthorized: Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};
