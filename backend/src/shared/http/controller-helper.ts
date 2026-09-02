import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserContext } from "../auth/permission.helper";

export const getUserContext = (c: Context): UserContext => {
  const user = c.get("user") as UserContext | undefined;
  if (!user || !user.userId) {
    throw new HTTPException(401, { message: "Unauthorized: Token อาจหมดอายุหรือไม่ถูกต้อง" });
  }
  return user;
};

// ดึงเฉพาะ User ID (ใช้ในกรณีที่ Service เดิมยังไม่ต้องการข้อมูลสิทธิ์)
export const getUserId = (c: Context): string => {
  const user = getUserContext(c);
  return user.userId;
};
