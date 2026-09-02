// src/modules/users/user.service.ts
import { db } from "@/db";
import { roles, users, roleUsers } from "@/db/schema/users";
import { projects } from "@/db/schema/projects";
import { departments, divisions } from "@/db/schema/lookups";
import { and, asc, countDistinct, desc, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import crypto from "crypto";
import { v7 as uuidv7 } from "uuid";
import { PROJECT_STATUS } from "@/modules/projects/project-workflow";
import type { Clock } from "@/shared/app/services";
import { systemClock } from "@/shared/app/services";

export type UserListQuery = {
  page: number;
  limit: number;
  search?: string;
  sort: "createdAt" | "username" | "name" | "firstName" | "email" | "role" | "department";
  order: "asc" | "desc";
  role?: string;
  status: "all" | "active" | "inactive";
  department?: string;
  departmentId?: number;
  divisionId?: number;
};

// ฟังก์ชันช่วยจัดรูปแบบข้อมูล (Mapping Helper) แปลงข้อมูลที่ Join มาให้ตรงกับ Schema
const mapUserToResponse = (user: any) => {
  // ดึงฟิลด์ที่เป็นความลับออก
  const { 
    password, 
    resetPasswordToken, 
    resetPasswordExpires, 
    verificationToken, 
    verificationExpires, 
    loginHistory,
    ...safeUserData 
  } = user;

  return {
    ...safeUserData,
    lastLogin: loginHistory?.[0]?.loginAt ?? null,
    
    // จัดรูปแบบข้อมูลแผนก (Division & Department)
    division: user.division ? {
      divisionId: user.division.divisionId,
      divisionCode: user.division.divisionCode,
      divisionName: user.division.divisionName,
      departmentId: user.division.department?.departmentId,
      departmentCode: user.division.department?.departmentCode,
      departmentName: user.division.department?.departmentName
    } : null,

    // จัดรูปแบบข้อมูลสิทธิ์ (Roles) - ดึงเฉพาะตาราง role ออกมาจากตาราง many-to-many
    roles: (user.roles ?? [])
      .map((userRole: any) => userRole.role ?? userRole)
      .filter((role: any) => role?.roleId && role?.roleName)
      .map((role: any) => ({
        roleId: role.roleId,
        roleName: role.roleName,
      }))
  };
};

// ดึงรายชื่อผู้ใช้งานทั้งหมด พร้อมข้อมูลหน่วยงานและสิทธิ์
export const getAllUsers = async () => {
  const result = await db.query.users.findMany({
    with: {
      division: {
        with: { department: true } // ดึงข้อมูล Department ทะลุ Division
      },
      roles: {
        with: { role: true }, // ดึงข้อมูล Role ทะลุ RoleUsers
        orderBy: (roleUser, { asc }) => [asc(roleUser.roleId)],
      },
      loginHistory: {
        orderBy: (history, { desc }) => [desc(history.loginAt)],
        limit: 1,
      },
    }
  });
  return result.map(mapUserToResponse);
};

// ดึงโปรไฟล์ผู้ใช้งานรายบุคคล
export const getUsersPage = async (queryParams: UserListQuery) => {
  const {
    page,
    limit,
    search,
    sort,
    order,
    role,
    status,
    department,
    departmentId,
    divisionId,
  } = queryParams;
  const offset = (page - 1) * limit;
  const searchTerm = search ? `%${search}%` : undefined;
  const roleTerm = role ? role.toUpperCase() : undefined;

  const conditions = [
    searchTerm
      ? or(
          ilike(users.username, searchTerm),
          ilike(users.email, searchTerm),
          ilike(users.firstName, searchTerm),
          ilike(users.lastName, searchTerm),
        )
      : undefined,
    roleTerm ? ilike(roles.roleName, roleTerm) : undefined,
    status === "active" ? eq(users.isActive, true) : undefined,
    status === "inactive" ? eq(users.isActive, false) : undefined,
    department ? ilike(departments.departmentName, `%${department}%`) : undefined,
    departmentId ? eq(departments.departmentId, departmentId) : undefined,
    divisionId ? eq(divisions.divisionId, divisionId) : undefined,
  ].filter(Boolean) as Array<ReturnType<typeof eq>>;

  const filter = conditions.length > 0 ? and(...conditions) : undefined;
  const listQuery = db
    .select({ userId: users.userId })
    .from(users)
    .leftJoin(divisions, eq(users.divisionId, divisions.divisionId))
    .leftJoin(departments, eq(divisions.departmentId, departments.departmentId))
    .leftJoin(roleUsers, eq(users.userId, roleUsers.userId))
    .leftJoin(roles, eq(roleUsers.roleId, roles.roleId))
    .where(filter)
    .groupBy(users.userId);

  const sortExpression =
    sort === "role"
      ? sql<string>`min(${roles.roleName})`
      : sort === "username"
        ? sql<string>`min(${users.username})`
        : sort === "name" || sort === "firstName"
          ? sql<string>`min(concat(${users.firstName}, ' ', ${users.lastName}))`
          : sort === "email"
            ? sql<string>`min(${users.email})`
            : sort === "department"
              ? sql<string>`min(${departments.departmentName})`
              : sql<Date>`min(${users.createdAt})`;
  const orderedListQuery = listQuery.orderBy(
    order === "asc" ? asc(sortExpression) : desc(sortExpression),
  );

  const [pagedIds, [{ total }]] = await Promise.all([
    orderedListQuery.limit(limit).offset(offset),
    db
      .select({ total: countDistinct(users.userId) })
      .from(users)
      .leftJoin(divisions, eq(users.divisionId, divisions.divisionId))
      .leftJoin(departments, eq(divisions.departmentId, departments.departmentId))
      .leftJoin(roleUsers, eq(users.userId, roleUsers.userId))
      .leftJoin(roles, eq(roleUsers.roleId, roles.roleId))
      .where(filter),
  ]);

  if (pagedIds.length === 0) {
    return {
      data: [],
      pagination: {
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  const result = await db.query.users.findMany({
    where: inArray(users.userId, pagedIds.map(({ userId }) => userId)),
    with: {
      division: { with: { department: true } },
      roles: {
        with: { role: true },
        orderBy: (roleUser, { asc }) => [asc(roleUser.roleId)],
      },
      loginHistory: {
        orderBy: (history, { desc }) => [desc(history.loginAt)],
        limit: 1,
      },
    },
  });
  const rowOrder = new Map(pagedIds.map(({ userId }, index) => [userId, index]));
  result.sort(
    (left, right) => (rowOrder.get(left.userId) ?? 0) - (rowOrder.get(right.userId) ?? 0),
  );

  return {
    data: result.map(mapUserToResponse),
    pagination: {
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit),
    },
  };
};

export const getUserProfile = async (userId: string) => {
  const result = await db.query.users.findFirst({
    where: eq(users.userId, userId),
    with: {
      division: {
        with: { department: true }
      },
      roles: {
        with: { role: true },
        orderBy: (roleUser, { asc }) => [asc(roleUser.roleId)],
      },
      loginHistory: {
        orderBy: (history, { desc }) => [desc(history.loginAt)],
        limit: 1,
      }
    }
  });
  
  if (!result) return null;
  return mapUserToResponse(result);
};

// สร้างผู้ใช้งานใหม่
export const createUser = async (data: any, clock: Clock = systemClock) => {
  const { password, ...restData } = data;
  // Public registration always starts with the ordinary USER role. Elevated
  // roles are assigned through the protected role-management endpoint.
  const roleIds = [1];

  const hashedPassword = await Bun.password.hash(password);

  const verificationToken = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = clock.now();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // ใช้ Transaction ควบคุม: ถ้าบันทึก User ผ่าน แต่บันทึกสิทธิ์ Role พัง ระบบจะยกเลิกทั้งหมด (Rollback) เพื่อความปลอดภัย
  return await db.transaction(async (tx) => {
    // 1. บันทึกข้อมูลหลักของผู้ใช้ลงตาราง users
    const newUserId = uuidv7();
    const [newUser] = await tx
      .insert(users)
      .values({
        userId: newUserId,
        username: restData.username,
        firstName: restData.firstName,
        lastName: restData.lastName,
        email: restData.email,
        position: restData.position,
        divisionId: restData.divisionId, // เปลี่ยนมารับค่าเป็น ID ตัวเลขแทนข้อความธรรมดา
        mobilePhone: restData.mobilePhone,
        officePhone: restData.officePhone,
        internalExtension: restData.internalExtension,
        password: hashedPassword,
        verificationToken: verificationToken,
        verificationExpires: expiresAt,
        isVerified: false
      })
      .returning();

    // 2. บันทึกความเชื่อมโยงสิทธิ์ลงตาราง Many-to-Many (role_user)
    if (roleIds && roleIds.length > 0) {
      const roleInserts = roleIds.map((roleId: number) => ({
        userId: newUser.userId,
        roleId: roleId,
      }));
      await tx.insert(roleUsers).values(roleInserts);
    }

    return newUser;
  });
};

export const getAnalystWorkloads = async () => {
  const activeStatuses = [
    PROJECT_STATUS.IN_ANALYSIS,
    PROJECT_STATUS.RETURNED_ANALYST,
    PROJECT_STATUS.PENDING_SMALL_BOARD,
    PROJECT_STATUS.RETURNED_SMALL_BOARD,
    PROJECT_STATUS.PENDING_BIG_BOARD,
    PROJECT_STATUS.RETURNED_BIG_BOARD,
  ];

  const rows = await db
    .select({
      userId: users.userId,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      position: users.position,
      activeTaskCount: countDistinct(projects.id),
    })
    .from(users)
    .innerJoin(roleUsers, eq(roleUsers.userId, users.userId))
    .innerJoin(roles, eq(roles.roleId, roleUsers.roleId))
    .leftJoin(projects, and(
      eq(projects.analystId, users.userId),
      isNull(projects.deletedAt),
      inArray(projects.projectStatusId, activeStatuses),
    ))
    .where(and(
      eq(users.isActive, true),
      sql`lower(${roles.roleName}) = 'analyst'`,
    ))
    .groupBy(users.userId, users.username, users.firstName, users.lastName, users.position)
    .orderBy(
      asc(countDistinct(projects.id)),
      asc(users.firstName),
      asc(users.lastName),
    );

  return {
    data: rows.map((row) => ({
      ...row,
      activeTaskCount: Number(row.activeTaskCount),
    })),
  };
};

export const updateUserRoles = async (
  userId: string,
  roleIds: number[],
  assignedBy: string,
  actorRoles: string[] = [],
) => {
  if (roleIds.length < 1 || new Set(roleIds).size !== roleIds.length) {
    throw new HTTPException(400, { message: "At least one unique role is required" });
  }

  await db.transaction(async (tx) => {
    const [targetUser] = await tx
      .select({ userId: users.userId })
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (!targetUser) {
      throw new HTTPException(404, { message: "User not found" });
    }

    const existingRoles = await tx
      .select({ roleId: roles.roleId, roleName: roles.roleName })
      .from(roles)
      .where(inArray(roles.roleId, roleIds));

    if (existingRoles.length !== roleIds.length) {
      throw new HTTPException(400, { message: "One or more role IDs are invalid" });
    }

    const normalizedActorRoles = actorRoles.map((role) => role.toLowerCase());
    const assignsSuperAdmin = existingRoles.some(
      (role) => role.roleName.toLowerCase() === "super_admin",
    );
    if (assignsSuperAdmin && !normalizedActorRoles.includes("super_admin")) {
      throw new HTTPException(403, {
        message: "Only an existing Super Admin can assign the Super Admin role",
      });
    }

    await tx.delete(roleUsers).where(eq(roleUsers.userId, userId));
    await tx.insert(roleUsers).values(
      roleIds.map((roleId) => ({ userId, roleId, assignedBy })),
    );
  });

  return getUserProfile(userId);
};

export const updateUserStatus = async (userId: string, isActive: boolean) => {
  const [updatedUser] = await db
    .update(users)
    .set({ isActive })
    .where(eq(users.userId, userId))
    .returning({ userId: users.userId });

  if (!updatedUser) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return getUserProfile(userId);
};

export const updateOwnProfile = async (
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    mobilePhone?: string | null;
    officePhone?: string | null;
    internalExtension?: string | null;
  },
) => {
  const [updatedUser] = await db
    .update(users)
    .set(data)
    .where(eq(users.userId, userId))
    .returning({ userId: users.userId });

  if (!updatedUser) {
    throw new HTTPException(404, { message: "User not found" });
  }

  return getUserProfile(userId);
};
