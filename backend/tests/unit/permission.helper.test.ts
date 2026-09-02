import { expect, test } from "bun:test";
import { HTTPException } from "hono/http-exception";
import { checkPermission, isSecretaryOnlyUser, type UserContext } from "../../src/shared/auth/permission.helper";

const user = (roles: UserContext["roles"]): UserContext => ({
  userId: crypto.randomUUID(),
  roles,
  divisionId: 10,
  departmentId: 20,
});

test("central roles can use their configured permissions across departments", () => {
  expect(checkPermission(user(["secretary"]), "read", "project", { departmentId: 999 })).toBe(true);
});

test("ordinary users are limited by department and permission", () => {
  expect(() => checkPermission(user(["user"]), "read", "project", { departmentId: 999 })).toThrow(HTTPException);
  expect(checkPermission(user(["user"]), "read", "project", { departmentId: 20 })).toBe(true);
});

test("secretary-only detection is additive-role aware", () => {
  expect(isSecretaryOnlyUser({ roles: ["secretary"] })).toBe(true);
  expect(isSecretaryOnlyUser({ roles: ["secretary", "user"] })).toBe(false);
});
