// src/modules/users/user.controller.ts
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import * as userService from "./user.service";
import { handleRegisterError } from "@/shared/http/error-handler";
import { getAppServices } from "@/shared/app/services";
import type { UserListQuery } from "./user.service";
import { checkPermission } from "@/shared/auth/permission.helper";
import { getUserContext } from "@/shared/http/controller-helper";

export const getUsers = async (c: Context, query: UserListQuery) => {
  const result = await userService.getUsersPage(query);
  if (!result) {
    throw new HTTPException(404, { message: "ไม่พบข้อมูลผู้ใช้งานในระบบ" });
  }
  return c.json(result, 200);
};

export const getUserProfile = async (c: Context, userId: string) => {
  const actor = getUserContext(c);
  if (actor.userId !== userId) {
    checkPermission(actor, "read", "user_management");
  }

  const user = await userService.getUserProfile(userId);
  if (!user) {
    throw new HTTPException(404, { message: "ไม่พบข้อมูลผู้ใช้งานที่ระบุในระบบ" });
  }

  return c.json(user, 200);
};

export const createUser = async (c: Context, body: any) => {
  try {
    const { emailService, clock } = getAppServices(c);
    const newUser = await userService.createUser(body, clock);

    // ส่งอีเมลแบบไม่รอผล: การสมัครบันทึกลงฐานข้อมูลสำเร็จแล้ว จึงตอบผู้ใช้ทันที
    // ไม่ให้หน้า Register ค้าง/ถูก gateway ตัด (504) เมื่อเมลเซิร์ฟเวอร์ช้าหรือล่ม
    // หากส่งไม่สำเร็จจะบันทึก log ไว้ (พร้อม email ผู้รับ) เพื่อให้แอดมินยืนยันบัญชีแทนได้
    void emailService
      .sendVerificationEmail(newUser.email, newUser.verificationToken!, newUser.firstName)
      .then((emailResult) => {
        if (!emailResult.success) {
          console.error(
            `[${new Date().toISOString()}] User verification email was not delivered to ${newUser.email}`,
            emailResult.error,
          );
        }
      })
      .catch((err) => {
        console.error(
          `[${new Date().toISOString()}] User verification email threw for ${newUser.email}`,
          err,
        );
      });

    const publicUser = await userService.getUserProfile(newUser.userId);

    return c.json(
      {
        message:
          "สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลของท่านเพื่อยืนยันตัวตน",
        requireVerification: true,
        user: publicUser,
      },
      201,
    );
  } catch (error: any) {
    return handleRegisterError(c, error);
  }
};

export const getAnalystWorkloads = async (c: Context) => {
  const result = await userService.getAnalystWorkloads();
  return c.json(result, 200);
};

export const updateUserRoles = async (c: Context, userId: string, body: { roleIds: number[] }) => {
  const actor = getUserContext(c);
  checkPermission(actor, "update", "rbac");
  const user = await userService.updateUserRoles(userId, body.roleIds, actor.userId, actor.roles);
  return c.json(user, 200);
};

export const updateUserStatus = async (c: Context, userId: string, body: { isActive: boolean }) => {
  const actor = getUserContext(c);
  checkPermission(actor, "update", "user_management");

  if (actor.userId === userId && !body.isActive) {
    throw new HTTPException(403, { message: "Administrators cannot disable their own account" });
  }

  const user = await userService.updateUserStatus(userId, body.isActive);
  return c.json(user, 200);
};

// Admin ยืนยันตัวตนให้ผู้ใช้ (เปลี่ยน Pending Verification → Active/Suspended)
export const verifyUser = async (c: Context, userId: string) => {
  const actor = getUserContext(c);
  checkPermission(actor, "update", "user_management");

  // ห้ามดำเนินการกับบัญชี SUPER_ADMIN (เช่นเดียวกับการระงับการใช้งาน)
  const target = await userService.getUserProfile(userId);
  if (!target) {
    throw new HTTPException(404, { message: "User not found" });
  }
  const targetIsSuperAdmin = (target.roles ?? []).some(
    (role: { roleName: string }) => role.roleName.toLowerCase() === "super_admin",
  );
  if (targetIsSuperAdmin) {
    throw new HTTPException(403, { message: "SUPER_ADMIN accounts cannot be modified" });
  }

  const user = await userService.verifyUser(userId);
  return c.json(user, 200);
};

export const updateOwnProfile = async (
  c: Context,
  body: {
    firstName?: string;
    lastName?: string;
    mobilePhone?: string | null;
    officePhone?: string | null;
    internalExtension?: string | null;
  },
) => {
  const actor = getUserContext(c);
  checkPermission(actor, "update", "profile");
  const user = await userService.updateOwnProfile(actor.userId, body);
  return c.json(user, 200);
};
