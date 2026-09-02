import { eq, sql } from "drizzle-orm";
import { db } from "../index";
import {
  agendaTypes,
  deputyGovernors,
  fourQuadrants,
  meetingAttachmentTypes,
  meetingStatuses,
  meetingTypes,
  projectAttachmentTypes,
  projectStatuses,
  projectTypes,
  resolutionStatuses,
} from "../schema/lookups";
import { agendaTypeSeedData, seedData } from "./seed-data";
import { roles } from "../schema/users";
import {
  departmentSeedData,
  derivedDepartmentSeedData,
  divisionSeedData,
  legacyDepartmentMappings,
  legacyDivisionMappings,
} from "./data/organization-lookup-data";
import { departments, divisions } from "../schema/lookups";

async function seedOrganizationLookups() {
  await db.transaction(async (tx) => {
    // Existing databases may have serial sequences left behind by explicit
    // legacy/demo inserts. Align them before any generated ID is requested.
    await tx.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('departments', 'department_id'),
        COALESCE((SELECT MAX(department_id) FROM departments), 1),
        (SELECT COUNT(*) > 0 FROM departments)
      )
    `);
    await tx.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('divisions', 'division_id'),
        COALESCE((SELECT MAX(division_id) FROM divisions), 1),
        (SELECT COUNT(*) > 0 FROM divisions)
      )
    `);

    // Apply only explicit legacy mappings. A row is mapped only when its
    // current name identifies the previous mock seed; all other legacy rows
    // remain untouched and keep their generated legacy code.
    for (const mapping of legacyDepartmentMappings) {
      const existing = (await tx
        .select()
        .from(departments)
        .where(eq(departments.departmentId, mapping.departmentId)))[0];
      const owner = (await tx
        .select()
        .from(departments)
        .where(eq(departments.departmentCode, mapping.departmentCode)))[0];

      if (
        existing &&
        existing.departmentName === mapping.fromDepartmentName &&
        (!owner || owner.departmentId === existing.departmentId)
      ) {
        await tx
          .update(departments)
          .set({
            departmentCode: mapping.departmentCode,
            departmentName: mapping.departmentName,
          })
          .where(eq(departments.departmentId, existing.departmentId));
      }
    }

    for (const item of [...departmentSeedData, ...derivedDepartmentSeedData]) {
      const existing = (await tx
        .select()
        .from(departments)
        .where(eq(departments.departmentCode, item.code)))[0];

      if (!existing) {
        await tx.insert(departments).values({
          departmentCode: item.code,
          departmentName: item.name,
        });
      } else if (existing.departmentName !== item.name) {
        await tx
          .update(departments)
          .set({ departmentName: item.name })
          .where(eq(departments.departmentId, existing.departmentId));
      }
    }

    const departmentRows = await tx
      .select({ id: departments.departmentId, code: departments.departmentCode })
      .from(departments);
    const departmentIdByCode = new Map(
      departmentRows.map((item) => [item.code, item.id]),
    );

    for (const mapping of legacyDivisionMappings) {
      const existing = (await tx
        .select()
        .from(divisions)
        .where(eq(divisions.divisionId, mapping.divisionId)))[0];
      const owner = (await tx
        .select()
        .from(divisions)
        .where(eq(divisions.divisionCode, mapping.divisionCode)))[0];
      const departmentId = departmentIdByCode.get(mapping.departmentCode);

      if (!departmentId) {
        throw new Error(
          `ไม่พบ Department สำหรับ legacy division mapping: ${mapping.departmentCode}`,
        );
      }

      if (
        existing &&
        existing.divisionName === mapping.fromDivisionName &&
        (!owner || owner.divisionId === existing.divisionId)
      ) {
        await tx
          .update(divisions)
          .set({
            divisionCode: mapping.divisionCode,
            divisionName: mapping.divisionName,
            departmentId,
          })
          .where(eq(divisions.divisionId, existing.divisionId));
      }
    }

    const preserveSourceIds = process.env.NODE_ENV === "development";

    for (const item of divisionSeedData) {
      const departmentId = departmentIdByCode.get(item.departmentCode);
      if (!departmentId) {
        throw new Error(
          `ไม่พบ Department code ${item.departmentCode} สำหรับ Division ${item.code}`,
        );
      }

      const existingByCode = (await tx
        .select()
        .from(divisions)
        .where(eq(divisions.divisionCode, item.code)))[0];

      if (existingByCode) {
        if (
          existingByCode.divisionName !== item.name ||
          existingByCode.departmentId !== departmentId
        ) {
          await tx
            .update(divisions)
            .set({ divisionName: item.name, departmentId })
            .where(eq(divisions.divisionId, existingByCode.divisionId));
        }
        continue;
      }

      const existingBySourceId = preserveSourceIds
        ? (await tx
            .select()
            .from(divisions)
            .where(eq(divisions.divisionId, item.sourceId)))[0]
        : undefined;

      await tx.insert(divisions).values(
        preserveSourceIds && !existingBySourceId
          ? {
              divisionId: item.sourceId,
              divisionCode: item.code,
              divisionName: item.name,
              departmentId,
            }
          : {
              divisionCode: item.code,
              divisionName: item.name,
              departmentId,
            },
      );
    }

    if (preserveSourceIds) {
      await tx.execute(sql`
        SELECT setval(
          pg_get_serial_sequence('divisions', 'division_id'),
          GREATEST(COALESCE((SELECT MAX(division_id) FROM divisions), 1), 1),
          true
        )
      `);
    }

    await tx.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('departments', 'department_id'),
        GREATEST(COALESCE((SELECT MAX(department_id) FROM departments), 1), 1),
        true
      )
    `);
  });
}

async function seedRequiredData() {
  await seedOrganizationLookups();

  for (const item of seedData.roles) {
    const existingByCode = await db.query.roles.findFirst({
      where: eq(roles.code, item.code),
    });
    const existingById = await db.query.roles.findFirst({
      where: eq(roles.roleId, item.roleId),
    });
    const existing = existingByCode ?? existingById;
    if (!existing) {
      await db.insert(roles).values(item);
    } else if (existing.roleName !== item.roleName || existing.code !== item.code) {
      await db.update(roles)
        .set({ code: item.code, roleName: item.roleName })
        .where(eq(roles.roleId, existing.roleId));
    }
  }

  for (const item of seedData.projectTypes) {
    const existingByCode = await db.query.projectTypes.findFirst({
      where: eq(projectTypes.code, item.code),
    });
    const existingById = await db.query.projectTypes.findFirst({
      where: eq(projectTypes.id, item.id),
    });
    const existing = existingByCode ?? existingById;
    if (!existing) await db.insert(projectTypes).values(item);
    else if (existing.typeName !== item.typeName || existing.code !== item.code) {
      await db.update(projectTypes)
        .set({ code: item.code, typeName: item.typeName })
        .where(eq(projectTypes.id, existing.id));
    }
  }

  for (const item of seedData.fourQuadrants) {
    const existing = await db.query.fourQuadrants.findFirst({
      where: eq(fourQuadrants.id, item.id),
    });
    if (!existing) await db.insert(fourQuadrants).values(item);
    else if (existing.name !== item.name) {
      await db.update(fourQuadrants)
        .set({ name: item.name })
        .where(eq(fourQuadrants.id, item.id));
    }
  }

  for (const item of seedData.deputyGovernors) {
    const existing = await db.query.deputyGovernors.findFirst({
      where: eq(deputyGovernors.id, item.id),
    });
    if (!existing) await db.insert(deputyGovernors).values(item);
    else if (existing.name !== item.name) {
      await db.update(deputyGovernors)
        .set({ name: item.name })
        .where(eq(deputyGovernors.id, item.id));
    }
  }

  for (const item of seedData.projectStatuses) {
    const existingByCode = await db.query.projectStatuses.findFirst({
      where: eq(projectStatuses.code, item.code),
    });
    const existingById = await db.query.projectStatuses.findFirst({
      where: eq(projectStatuses.id, item.id),
    });
    const existing = existingByCode ?? existingById;
    if (!existing) await db.insert(projectStatuses).values(item);
    else if (existing.statusName !== item.statusName || existing.code !== item.code) {
      await db.update(projectStatuses)
        .set({ code: item.code, statusName: item.statusName })
        .where(eq(projectStatuses.id, existing.id));
    }
  }

  for (const item of seedData.projectAttachmentTypes) {
    const existingByCode = await db.query.projectAttachmentTypes.findFirst({
      where: eq(projectAttachmentTypes.code, item.code),
    });
    const existingByName = await db.query.projectAttachmentTypes.findFirst({
      where: eq(projectAttachmentTypes.docTypeName, item.docTypeName),
    });
    const existing = existingByCode ?? existingByName;
    if (!existing) {
      await db.insert(projectAttachmentTypes)
        .values({ code: item.code, docTypeName: item.docTypeName })
        .onConflictDoNothing({ target: projectAttachmentTypes.docTypeName });
    } else if (existing.code !== item.code || existing.docTypeName !== item.docTypeName) {
      await db.update(projectAttachmentTypes)
        .set({ code: item.code, docTypeName: item.docTypeName })
        .where(eq(projectAttachmentTypes.id, existing.id));
    }
  }

  for (const item of seedData.meetingStatuses) {
    const existing = await db.query.meetingStatuses.findFirst({
      where: eq(meetingStatuses.id, item.id),
    });
    if (!existing) await db.insert(meetingStatuses).values(item);
    else if (existing.name !== item.name || existing.code !== item.code) {
      await db.update(meetingStatuses).set({ name: item.name, code: item.code }).where(eq(meetingStatuses.id, item.id));
    }
  }

  for (const item of seedData.meetingTypes) {
    const existing = await db.query.meetingTypes.findFirst({
      where: eq(meetingTypes.id, item.id),
    });
    if (!existing) await db.insert(meetingTypes).values(item);
    else if (existing.name !== item.name || existing.code !== item.code) {
      await db.update(meetingTypes).set({ name: item.name, code: item.code }).where(eq(meetingTypes.id, item.id));
    }
  }

  for (const item of seedData.meetingAttachmentTypes) {
    const existing = await db.query.meetingAttachmentTypes.findFirst({
      where: eq(meetingAttachmentTypes.id, item.id),
    });
    if (!existing) await db.insert(meetingAttachmentTypes).values(item);
    else if (existing.name !== item.name || existing.code !== item.code) {
      await db.update(meetingAttachmentTypes).set({ name: item.name, code: item.code }).where(eq(meetingAttachmentTypes.id, item.id));
    }
  }

  for (const item of agendaTypeSeedData) {
    const existing = await db.query.agendaTypes.findFirst({
      where: eq(agendaTypes.id, item.id),
    });
    if (!existing) await db.insert(agendaTypes).values(item);
    else if (existing.name !== item.name || existing.code !== item.code) {
      await db.update(agendaTypes).set({ name: item.name, code: item.code }).where(eq(agendaTypes.id, item.id));
    }
  }

  for (const item of seedData.resolutionStatuses) {
    const existing = await db.query.resolutionStatuses.findFirst({
      where: eq(resolutionStatuses.id, item.id),
    });
    if (!existing) await db.insert(resolutionStatuses).values(item);
    else if (existing.name !== item.name || existing.code !== item.code) {
      await db.update(resolutionStatuses).set({ name: item.name, code: item.code }).where(eq(resolutionStatuses.id, item.id));
    }
  }
}

async function main() {
  try {
    console.log("Starting required database seed...");
    await seedRequiredData();
    console.log("Required database seed completed.");
  } catch (error) {
    console.error("Required database seed failed:", error);
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  void main();
}

export { seedRequiredData };
