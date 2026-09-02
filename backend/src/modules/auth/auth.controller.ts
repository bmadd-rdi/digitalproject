// src/modules/auth/auth.controller.ts
import crypto from "crypto";
import { Context } from "hono";
import { db } from "@/db";
import { and, eq, gt, or } from "drizzle-orm";
import { userLoginHistory, users } from "@/db/schema";
import {
  LoginRequestSchema,
  RecoveryEmailRequestSchema,
  ResetPasswordRequestSchema,
} from "./auth.schema";
import { z } from "@hono/zod-openapi";
import { sign } from "hono/jwt";
import { setCookie, deleteCookie } from "hono/cookie";
import type { UserContext } from "@/shared/auth/permission.helper";
import { HTTPException } from "hono/http-exception";
import { consumeRateLimit, getClientIp } from "@/shared/security/rate-limit";
import { appEnv } from "@/config/app-env";
import { getAppServices } from "@/shared/app/services";
import { createUser } from "../users/user.controller";

type LoginBody = z.infer<typeof LoginRequestSchema>;
type RecoveryEmailBody = z.infer<typeof RecoveryEmailRequestSchema>;
type ResetPasswordBody = z.infer<typeof ResetPasswordRequestSchema>;

async function issueUserToken(user: any, now = new Date()) {
  const userRoles =
    user.roles && user.roles.length > 0
      ? user.roles
          .map((userRole: any) => userRole.role?.roleName)
          .filter(Boolean)
          .map((roleName: string) => roleName.toLowerCase())
      : ["user"];

  return sign(
    {
      userId: user.userId,
      username: user.username,
      roles: userRoles,
      divisionId: user.divisionId,
      departmentId: user.division?.departmentId || 0,
      exp: Math.floor(now.getTime() / 1000) + 60 * 60 * 24,
    },
    appEnv.JWT_SECRET,
  );
}

const RECOVERY_MESSAGE =
  // "If this email is registered in our system, you will receive further instructions shortly.";
  "หากอีเมลนี้มีอยู่ในระบบของเรา คุณจะได้รับอีเมลตอบกลับในไม่ช้า";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

function recoveryRateLimitExceeded(c: Context, action: string, email: string) {
  const emailLimit = consumeRateLimit(`${action}:email:${email}`);
  const ipLimit = consumeRateLimit(`${action}:ip:${getClientIp(c.req)}`);

  if (emailLimit.allowed && ipLimit.allowed) return null;

  const retryAfterSeconds = Math.max(
    emailLimit.retryAfterSeconds,
    ipLimit.retryAfterSeconds,
  );
  c.header("Retry-After", String(retryAfterSeconds));
  return c.json(
    { error: "Too many recovery requests. Please try again later.", field: "email" },
    429,
  );
}

export const login = async (c: Context, body: LoginBody) => {
  try {
    const { clock } = getAppServices(c);
    const { username: identifier, password } = body;

    const user = await db.query.users.findFirst({
      where: or(eq(users.username, identifier), eq(users.email, identifier)),
      with: {
        roles: { with: { role: true } },
        division: true,
      },
    });

    if (!user) {
      return c.json(
        { error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง", field: "credentials" },
        401,
      );
    }

    const isPasswordValid = await Bun.password.verify(password, user.password);
    if (!isPasswordValid) {
      return c.json(
        { error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง", field: "credentials" },
        401,
      );
    }

    if (!user.isActive) {
      return c.json(
        {
          error: "บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
          field: "general",
        },
        403,
      );
    }

    if (!user.isVerified) {
      return c.json(
        { error: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ", field: "general" },
        403,
      );
    }

    const ipAddress = getClientIp(c.req);
    const userAgent = c.req.header("user-agent") || null;

    // Record only successful, verified logins in the audit table.
    await db
      .insert(userLoginHistory)
      .values({
        userId: user.userId,
        ipAddress,
        userAgent,
      });

    const token = await issueUserToken(user, clock.now());

    // 👇 เพิ่มการ Set Cookie ที่นี่ เพื่อให้สอดคล้องกับตอน Logout
    setCookie(c, "token", token, {
      path: "/",
      secure: appEnv.COOKIE_SECURE,
      httpOnly: true,
      sameSite: appEnv.COOKIE_SAME_SITE,
      ...(appEnv.COOKIE_DOMAIN ? { domain: appEnv.COOKIE_DOMAIN } : {}),
      maxAge: 60 * 60 * 24, // 1 วัน (ให้ตรงกับเวลา exp ของ JWT)
    });

    return c.json(
      {
        message: "Login Successful",
        token: token,
        user: {
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      200,
    );
  } catch (error) {
    console.error("Login Error:", error);
    return c.json(
      { error: "เกิดข้อผิดพลาดในระบบเซิร์ฟเวอร์", field: "server" },
      500,
    );
  }
};

/**
 * Re-issues the current user's JWT from the database. This is intentionally
 * separate from login so role changes become effective without requiring the
 * user to enter their password again.
 */
export const refreshSession = async (c: Context) => {
  const actor = c.get("user") as UserContext | undefined;
  if (!actor?.userId) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.userId, actor.userId),
    with: {
      roles: { with: { role: true } },
      division: true,
    },
  });

  if (!user || !user.isActive || !user.isVerified) {
    throw new HTTPException(401, { message: "Session is no longer valid" });
  }

  return c.json({ token: await issueUserToken(user, getAppServices(c).clock.now()) }, 200);
};

export const registerUser = async (c: Context) => {
  const body = await c.req.json();
  return createUser(c, body);
};

export const verifyEmail = async (c: Context) => {
  try {
    const token = c.req.query("token");

    if (!token) {
      return c.json({ error: "ไม่พบข้อมูล Token ยืนยัน", field: "token" }, 400);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1);

    if (!user) {
      return c.json(
        {
          error: "ลิงก์ยืนยันไม่ถูกต้อง หรือบัญชีนี้ได้รับการยืนยันไปแล้ว",
          field: "token",
        },
        400,
      );
    }

    if (user.verificationExpires && getAppServices(c).clock.now() > user.verificationExpires) {
      return c.json(
        {
          error: "ลิงก์ยืนยันหมดอายุแล้ว กรุณาติดต่อผู้ดูแลระบบหรือสมัครใหม่",
          field: "token",
        },
        400,
      );
    }

    await db
      .update(users)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationExpires: null,
      })
      .where(eq(users.userId, user.userId));

    return c.json(
      { message: "ยืนยันอีเมลสำเร็จ ตอนนี้คุณสามารถเข้าสู่ระบบได้แล้ว" },
      200,
    );
  } catch (error) {
    console.error("🔴 Verification API Crashed:", error);
    return c.json(
      { error: "เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์", field: "server" },
      500,
    );
  }
};

export const requestUsernameRecovery = async (c: Context, body: RecoveryEmailBody) => {
  const { emailService } = getAppServices(c);
  const email = normalizeEmail(body.email);
  const limited = recoveryRateLimitExceeded(c, "username-recovery", email);
  if (limited) return limited;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { username: true, email: true },
    });

    if (user) {
      const result = await emailService.sendUsernameRecoveryEmail(user.email, user.username);
      if (!result.success) {
        console.error("Username recovery email was not delivered", result.error);
      }
    }
  } catch (error) {
    console.error("Username recovery request failed:", error);
  }

  return c.json({ message: RECOVERY_MESSAGE }, 202);
};

export const requestPasswordReset = async (c: Context, body: RecoveryEmailBody) => {
  const { emailService, clock } = getAppServices(c);
  const email = normalizeEmail(body.email);
  const limited = recoveryRateLimitExceeded(c, "password-recovery", email);
  if (limited) return limited;

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
      columns: { userId: true, email: true },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(clock.now().getTime() + 30 * 60 * 1000);

      await db
        .update(users)
        .set({ resetPasswordToken: token, resetPasswordExpires: expiresAt })
        .where(eq(users.userId, user.userId));

      const result = await emailService.sendPasswordResetEmail(user.email, token);
      if (!result.success) {
        console.error("Password reset email was not delivered", result.error);
      }
    }
  } catch (error) {
    console.error("Password reset request failed:", error);
  }

  return c.json({ message: RECOVERY_MESSAGE }, 202);
};

export const resetPassword = async (c: Context, body: ResetPasswordBody) => {
  try {
    const { clock } = getAppServices(c);
    const hashedPassword = await Bun.password.hash(body.newPassword);
    const now = clock.now();

    // The token and expiry are part of the UPDATE predicate so two concurrent
    // requests cannot successfully reuse the same reset link.
    const [updatedUser] = await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(
        and(
          eq(users.resetPasswordToken, body.token),
          gt(users.resetPasswordExpires, now),
        ),
      )
      .returning({ userId: users.userId });

    if (!updatedUser) {
      return c.json(
        { error: "This password reset link is invalid or has expired.", field: "token" },
        400,
      );
    }

    return c.json({ message: "Password reset successfully." }, 200);
  } catch (error) {
    console.error("Password reset failed:", error);
    return c.json({ error: "Unable to reset password.", field: "server" }, 500);
  }
};

// เพิ่มฟังก์ชัน Logout
export const logout = async (c: Context) => {
  try {
    // ลบคุกกี้ด้วยค่า Configuration มาตรฐานเพื่อความปลอดภัย
    deleteCookie(c, "token", {
      path: "/",
      secure: appEnv.COOKIE_SECURE,
      httpOnly: true,
      // sameSite: "Strict",
      sameSite: appEnv.COOKIE_SAME_SITE,
      ...(appEnv.COOKIE_DOMAIN ? { domain: appEnv.COOKIE_DOMAIN } : {}),
    });

    return c.json({ message: "ออกจากระบบสำเร็จ" }, 200);
  } catch (error) {
    console.error("Logout Error:", error);
    return c.json(
      { error: "เกิดข้อผิดพลาดในการออกจากระบบ", field: "server" },
      500,
    );
  }
};
