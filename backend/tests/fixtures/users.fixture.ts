import { eq, inArray } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import type { UserContext } from "../../src/shared/auth/permission.helper";

export async function createTestUser(db: any, options: {
  roles?: string[];
  isActive?: boolean;
  isVerified?: boolean;
  usernamePrefix?: string;
  divisionId?: number;
} = {}) {
  const userId = uuidv7();
  const roles = (options.roles ?? ["user"]).map((role) => role.toLowerCase());
  const lookupSchema = await import("../../src/db/schema/lookups");
  const divisionRows = await db.select().from(lookupSchema.divisions)
    .where(options.divisionId ? eq(lookupSchema.divisions.divisionId, options.divisionId) : undefined)
    .limit(1);
  const [division] = divisionRows;
  if (!division) throw new Error("Required division lookup data is missing");

  const username = `${options.usernamePrefix ?? "test"}_${userId.slice(-12)}`;
  const email = `${username}@example.test`;
  const password = `Test-${userId}-Password!`;
  const [user] = await db.insert((await import("../../src/db/schema/users")).users).values({
    userId,
    username,
    password: await Bun.password.hash(password),
    firstName: "Test",
    lastName: "User",
    email,
    divisionId: division.divisionId,
    mobilePhone: "0812345678",
    isActive: options.isActive ?? true,
    isVerified: options.isVerified ?? true,
  }).returning();

  const userSchema = await import("../../src/db/schema/users");
  const roleRows: Array<{ roleId: number }> = await db.select({ roleId: userSchema.roles.roleId })
    .from(userSchema.roles)
    .where(inArray(userSchema.roles.roleName, roles.map((role) => role.toUpperCase())));
  if (roleRows.length !== roles.length) throw new Error(`Missing required roles: ${roles.join(", ")}`);
  await db.insert((await import("../../src/db/schema/users")).roleUsers).values(
    roleRows.map(({ roleId }) => ({ userId, roleId, assignedBy: userId })),
  );

  const context: UserContext = {
    userId,
    roles: roles as UserContext["roles"],
    divisionId: division.divisionId,
    departmentId: division.departmentId,
  };
  return { user, context, password };
}
