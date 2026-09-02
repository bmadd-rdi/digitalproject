import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../index";
import { roleUsers, users } from "../schema/users";
import { departments, divisions } from "../schema/lookups";
import { seedData } from "./seed-data";
import { seedMockProjects } from "./seed-projects";
import { seedRequiredData } from "./seed-required";

async function seedDemoData() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Demo seed is disabled when NODE_ENV=production");
  }

  await seedRequiredData();

  for (const userData of seedData.mockUsers) {
    const department = (await db
      .select()
      .from(departments)
      .where(eq(departments.departmentCode, userData.departmentCode)))[0];
    const division = (await db
      .select()
      .from(divisions)
      .where(eq(divisions.divisionCode, userData.divisionCode)))[0];

    if (!department || !division) {
      throw new Error(
        `ไม่พบข้อมูลหน่วยงานสำหรับผู้ใช้ ${userData.username}: ${userData.departmentCode}/${userData.divisionCode}`,
      );
    }
    if (division.departmentId !== department.departmentId) {
      throw new Error(
        `Division ${userData.divisionCode} ไม่ได้อยู่ภายใต้ Department ${userData.departmentCode}`,
      );
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, userData.username),
    });

    const userId = existingUser?.userId ?? uuidv7();

    if (!existingUser) {
      const password = await Bun.password.hash(userData.rawPassword);
      await db.insert(users).values({
        userId,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password,
        divisionId: division.divisionId,
        isVerified: true,
      });
    } else if (existingUser.divisionId !== division.divisionId) {
      await db
        .update(users)
        .set({ divisionId: division.divisionId })
        .where(eq(users.userId, existingUser.userId));
    }

    await db.insert(roleUsers)
      .values({ userId, roleId: userData.roleId })
      .onConflictDoNothing();
  }

  await seedMockProjects();
}

async function main() {
  try {
    console.log("Starting development demo seed...");
    await seedDemoData();
    console.log("Development demo seed completed.");
  } catch (error) {
    console.error("Development demo seed failed:", error);
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  void main();
}

export { seedDemoData };
