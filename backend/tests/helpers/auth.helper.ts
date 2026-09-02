import { sign } from "hono/jwt";
import type { UserContext } from "../../src/shared/auth/permission.helper";

export async function signTestToken(user: UserContext, now = new Date()) {
  return sign({
    userId: user.userId,
    roles: user.roles,
    divisionId: user.divisionId,
    departmentId: user.departmentId,
    exp: Math.floor(now.getTime() / 1000) + 3600,
  }, process.env.JWT_SECRET!);
}

export async function authHeaders(user: UserContext, now?: Date) {
  return { Authorization: `Bearer ${await signTestToken(user, now)}` };
}
