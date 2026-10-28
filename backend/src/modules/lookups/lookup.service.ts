// src/modules/lookups/lookup.service.ts
import { db } from "../../db";
import { divisions, fourQuadrants, deputyGovernors, projectStatuses, projectTypes, projectAttachmentTypes, departments, roles } from "../../db/schema";
import { proposalBudgets } from "../../db/schema/proposals";
import { users, roleUsers } from "../../db/schema/users";
import { and, asc, eq, isNotNull, sql } from "drizzle-orm";
import { appCache } from "../../shared/cache/memory-cache";
import { getProjectAttachmentTypeLabel } from "./project-attachment-types";

// ตั้งเวลาให้ Cache จำข้อมูล Lookup นาน 24 ชั่วโมง (86400 วินาที)
const LOOKUP_TTL = 86400;

export const getDivisionsLookup = async (departmentId?: number) => {
  // 1. ดึงข้อมูล Divisions ทั้งหมด (จาก Cache ก่อน ถ้าไม่มีค่อยลง DB)
  const allDivisions = await appCache.getOrSet(
    "lookup:divisions",
    async () => {
      console.log("Fetching divisions from DB...");
      const result = await db.select().from(divisions);

      // แปลง Key เป็น id และ name เพื่อให้ FormCombobox ใน Frontend เอาไปใช้ได้ทันที
      return result.map(div => ({
        id: div.divisionId,
        code: div.divisionCode,
        name: div.divisionName,
        departmentId: div.departmentId
      }));
    },
    LOOKUP_TTL
  );

  // 2. ถ้ามีการส่ง departmentId มา ให้กรองเฉพาะส่วนราชการที่อยู่ในหน่วยงานนั้น
  if (departmentId) {
    return allDivisions.filter(div => div.departmentId === departmentId);
  }

  // 3. ถ้าไม่มีการส่งมา (เช่น ตอนโหลดครั้งแรก) ให้คืนค่าทั้งหมด
  return allDivisions;
};

export const getDepartmentsLookup = async () => {
  return appCache.getOrSet(
    "lookup:departments",
    async () => {
      console.log("Fetching departments from DB...");
      const result = await db.select().from(departments);

      // แปลง Key ให้เป็น id และ name เพื่อให้ตรงกับ LookupItemSchema
      // และตรงกับที่ Frontend (FormCombobox) คาดหวังว่าจะได้รับ
      return result.map(dept => ({
        id: dept.departmentId,
        code: dept.departmentCode,
        name: dept.departmentName
      }));
    },
    LOOKUP_TTL
  );
};

export const getRolesLookup = async () => {
  return appCache.getOrSet(
    "lookup:roles",
    async () => {
      console.log("Fetching roles from DB...");
      const result = await db.select({ id: roles.roleId, name: roles.roleName })
        .from(roles)
        .orderBy(asc(roles.roleName));

      return result;
    },
    LOOKUP_TTL,
  );
};

export const getFourQuadrantsLookup = async () => {
  return appCache.getOrSet(
    "lookup:fourQuadrants",
    async () => {
      console.log("Fetching fourQuadrants from DB...");
      return await db.select().from(fourQuadrants);
    },
    LOOKUP_TTL
  );
};

export const getDeputyGovernorsLookup = async () => {
  return appCache.getOrSet(
    "lookup:deputyGovernors",
    async () => {
       console.log("Fetching deputyGovernors from DB...");
      return await db.select().from(deputyGovernors);    },
    LOOKUP_TTL
  );
};

export const getProjectStatusesLookup = async () => {
  return appCache.getOrSet(
    "lookup:projectStatuses",
    async () => {
      return await db.select().from(projectStatuses);
    },
    LOOKUP_TTL
  );
};

export const getProjectTypesLookup = async () => {
  return appCache.getOrSet(
    "lookup:projectTypes",
    async () => {
      const result = await db
        .select({ id: projectTypes.id, name: projectTypes.typeName })
        .from(projectTypes)
        .orderBy(asc(projectTypes.typeName));

      return result;
    },
    LOOKUP_TTL,
  );
};

export const getProjectAttachmentTypesLookup = async () => {
  return appCache.getOrSet(
    "lookup:projectAttachmentTypes",
    async () => {
      const result = await db
        .select({ id: projectAttachmentTypes.id, name: projectAttachmentTypes.docTypeName })
        .from(projectAttachmentTypes)
        .orderBy(asc(projectAttachmentTypes.docTypeName));

      return result.map((type) => ({
        ...type,
        label: getProjectAttachmentTypeLabel(type.name),
      }));
    },
    LOOKUP_TTL,
  );
};

export const getBudgetTypesLookup = async () => {
  return appCache.getOrSet(
    "lookup:budgetTypes",
    async () => {
      const result = await db
        .selectDistinct({ budgetType: proposalBudgets.budgetType })
        .from(proposalBudgets)
        .where(isNotNull(proposalBudgets.budgetType))
        .orderBy(asc(proposalBudgets.budgetType));

      return result.map((row) => row.budgetType).filter((value): value is string => Boolean(value?.trim()));
    },
    LOOKUP_TTL,
  );
};


// อายุ cache สั้นกว่า lookup อื่น เพราะการกำหนด/ถอดบทบาทผู้วิเคราะห์เกิดขึ้นได้ตลอด
const ANALYST_LOOKUP_TTL = 300;

export const getAnalystsLookup = async () => {
  return appCache.getOrSet(
    "lookup:analysts",
    async () => {
      const rows = await db
        .selectDistinct({
          userId: users.userId,
          firstName: users.firstName,
          lastName: users.lastName,
        })
        .from(users)
        .innerJoin(roleUsers, eq(roleUsers.userId, users.userId))
        .innerJoin(roles, eq(roles.roleId, roleUsers.roleId))
        .where(and(
          eq(users.isActive, true),
          sql`lower(${roles.roleName}) = 'analyst'`,
        ))
        .orderBy(asc(users.firstName), asc(users.lastName));

      return rows.map((row) => ({
        userId: row.userId,
        name: `${row.firstName} ${row.lastName}`.trim(),
      }));
    },
    ANALYST_LOOKUP_TTL,
  );
};
