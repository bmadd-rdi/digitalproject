import {
  eq,
  desc,
  sql,
  and,
  or,
  ilike,
  ne,
  not,
  aliasedTable,
  isNull,
  inArray,
  type SQL,
} from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { db } from "../../db";
import { projects, projectAttachments, projectSequences } from "../../db/schema/projects";
import { agendas, meetingAttachments } from "../../db/schema/meetings";
import { proposals } from "../../db/schema/proposals";
import { proposalDrafts } from "../../db/schema/proposal_drafts";
import { projectStatusLogs } from "../../db/schema/project_status_logs";
import { workflowAuditEvents } from "../../db/schema/workflow_audit_events";
import { HTTPException } from "hono/http-exception";
import type {
  AssignProjectDTO,
  CreateProjectDTO,
  UpdateProjectDTO,
  UpdateProjectStatusDTO,
  UpdateProjectTypeDTO,
  SecretaryPendingProjectQueryDTO,
  SecretaryReviewDTO,
  AssignmentProjectQueryDTO,
  BulkAssignProjectDTO,
  AnalystAssignedProjectQueryDTO,
  AnalystReassignmentDTO,
  AnalystReviewDTO,
  ProjectQueryDTO,
  UpdateProjectVisibilityDTO,
  PublicProjectQueryDTO,
  ReopenRejectedProjectDTO,
} from "./project.schema";
import {
  divisions,
  departments,
  projectStatuses,
  projectTypes,
  projectAttachmentTypes,
} from "../../db/schema/lookups";
import { roles, roleUsers, users } from "@/db/schema/users";
import {
  checkPermission,
  isSecretaryOnlyUser,
  UserContext,
} from "@/shared/auth/permission.helper";
import {
  PROJECT_STATUS,
  OWNER_EDITABLE_STATUS_IDS,
  applyProjectStatusTransition,
  assertValidProjectTransition,
} from "./project-workflow";
import { basename, join } from "node:path";
import { unlink } from "node:fs/promises";
import { appEnv } from "@/config/app-env";
import { buildDraftPayload, restoreEditableProposalDraft } from "./project-cancel.service";
import { submitProposalSchema } from "../proposals/proposal.schema";
import { sumProposalBudgets } from "../proposals/proposal-budget.util";
import { calculateEstimatedCostTotal } from "../proposals/proposal-estimated-cost.util";
import { isSameDepartmentUser } from "./project-access.policy";

const UPLOAD_STORAGE_DIR = appEnv.UPLOAD_STORAGE_DIR;

async function assertUserExists(userId: string) {
  const [user] = await db
    .select({ userId: users.userId })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  if (!user)
    throw new HTTPException(401, { message: "Unauthorized: User not found" });
}

// Gen รหัสโครงการ (เช่น BMA-69-0001)
const generateProjectCode = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const thaiYear = currentYear + 543;
  const shortYear = thaiYear.toString().slice(-2);
  const prefix = `BMA-${shortYear}-`;

  // Database จะทำหน้าที่บวก 1 ให้อัตโนมัติ (รับประกันไม่เกิด Race Condition)
  const [sequence] = await db
    .insert(projectSequences)
    .values({ year: thaiYear, lastValue: 1 })
    .onConflictDoUpdate({
      target: projectSequences.year,
      set: { lastValue: sql`${projectSequences.lastValue} + 1` },
    })
    .returning();

  const nextNumberPadded = sequence.lastValue.toString().padStart(4, "0");
  return `${prefix}${nextNumberPadded}`;
};

const analysts = aliasedTable(users, "analysts");
const attachmentUploaders = aliasedTable(users, "attachment_uploaders");

// Helper 1: สร้าง Query กลางสำหรับการ Join เพื่อไม่ให้โค้ดซ้ำซ้อน
const getBaseProjectQuery = () => {
  return db
    .select({
      project: projects,
      division: {
        id: divisions.divisionId,
        code: divisions.divisionCode,
        name: divisions.divisionName,
        departmentId: divisions.departmentId,
        departmentCode: departments.departmentCode,
        departmentName: departments.departmentName,
      },
      status: {
        id: projectStatuses.id,
        name: projectStatuses.statusName,
      },
      projectType: {
        id: projectTypes.id,
        name: projectTypes.typeName,
      },
      owner: {
        userId: users.userId,
        firstName: users.firstName,
        lastName: users.lastName,
      },
      analyst: {
        userId: analysts.userId,
        firstName: analysts.firstName,
        lastName: analysts.lastName,
      },
      latestSubmittedRequestedBudget: sql<string | null>`(
        select p.requested_budget_total
        from proposals p
        where p.project_id = ${projects.id}
          and p.status = 'submitted'
        order by p.submitted_at desc nulls last, p.updated_at desc, p.id desc
        limit 1
      )`,
    })
    .from(projects)
    .leftJoin(divisions, eq(projects.divisionId, divisions.divisionId))
    .leftJoin(departments, eq(divisions.departmentId, departments.departmentId))
    .leftJoin(projectStatuses, eq(projects.projectStatusId, projectStatuses.id))
    .leftJoin(projectTypes, eq(projects.projectTypeId, projectTypes.id))
    .leftJoin(users, eq(projects.userId, users.userId))
    .leftJoin(analysts, eq(projects.analystId, analysts.userId));
};

// Helper 2: Map ข้อมูลที่ Join มาแล้วให้อยู่ใน Format ที่ตรงกับ Zod Schema
const mapJoinedProject = (row: any) => {
  return {
    ...row.project,
    latestSubmittedRequestedBudget: row.latestSubmittedRequestedBudget ?? null,
    latestApprovedBudget: row.project.latestRequestedBudget ?? null,
    assignedAnalystId: row.project.analystId ?? null,
    division: row.division?.id
      ? {
          id: row.division.id,
          code: row.division.code,
          name: row.division.name,
          departmentId: row.division.departmentId,
          departmentCode: row.division.departmentCode,
          departmentName: row.division.departmentName,
        }
      : null,
    status: row.status?.id ? row.status : null,
    projectType: row.projectType?.id ? row.projectType : null,
    owner: row.owner?.userId ? row.owner : null,
    analyst: row.analyst?.userId ? row.analyst : null
  };
};

const assertSecretary = (user: UserContext) => {
  if (!normalizedUserRoles(user).includes("secretary")) {
    throw new HTTPException(403, {
      message: "Only users with the secretary role can perform this action",
    });
  }
};

const assertProjectAssignmentAdmin = (user: UserContext) => {
  const normalizedRoles = user.roles.map((role) => String(role).toLowerCase());
  if (!normalizedRoles.some((role) => role === "admin" || role === "super_admin")) {
    throw new HTTPException(403, {
      message: "Only Admin users can manage project assignments",
    });
  }
};

const normalizedUserRoles = (user: UserContext) =>
  user.roles.map((role) => String(role).toLowerCase());

const normalizeProjectStatusIds = (value: unknown): number[] | undefined => {
  if (value === undefined || value === null) return undefined;

  const tokens = (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item).split(","))
    .map((item) => item.trim())
    .filter(Boolean);

  if (tokens.length === 0) return undefined;

  const statusIds = [...new Set(tokens.map(Number))];
  if (
    statusIds.length > 16 ||
    statusIds.some((statusId) => !Number.isInteger(statusId) || statusId < 1 || statusId > 16)
  ) {
    throw new HTTPException(400, {
      message: "statusIds must contain between 1 and 15 valid status IDs",
    });
  }

  return statusIds;
};

const hasRole = (user: UserContext, role: string) =>
  normalizedUserRoles(user).includes(role);

const assertAnalyst = (user: UserContext) => {
  if (!hasRole(user, "analyst")) {
    throw new HTTPException(403, {
      message: "Only users with the analyst role can perform this action",
    });
  }
};

export const assertAssignedAnalyst = (
  user: UserContext,
  project: { analystId: string | null },
) => {
  assertAnalyst(user);
  if (project.analystId !== user.userId) {
    throw new HTTPException(403, {
      message: "This project is not assigned to the authenticated Analyst",
    });
  }
};

const ANALYST_VISIBLE_STATUS_IDS = [
  PROJECT_STATUS.IN_ANALYSIS,
  PROJECT_STATUS.RETURNED_ANALYST,
  PROJECT_STATUS.PENDING_SMALL_BOARD,
  PROJECT_STATUS.RETURNED_SMALL_BOARD,
  PROJECT_STATUS.PENDING_BIG_BOARD,
  PROJECT_STATUS.RETURNED_BIG_BOARD,
] as const;

const getAnalystForAssignment = async (executor: any, analystId: string) => {
  const [analyst] = await executor
    .select({
      userId: users.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      isActive: users.isActive,
    })
    .from(users)
    .innerJoin(roleUsers, eq(roleUsers.userId, users.userId))
    .innerJoin(roles, eq(roles.roleId, roleUsers.roleId))
    .where(and(
      eq(users.userId, analystId),
      eq(users.isActive, true),
      sql`lower(${roles.roleName}) = 'analyst'`,
    ))
    .limit(1);

  if (!analyst) {
    throw new HTTPException(400, {
      message: "The selected user is not an active Analyst",
    });
  }

  return analyst;
};

const mapAssignmentProject = (row: any) => {
  const project = mapJoinedProject(row);
  return {
    id: project.id,
    projectCode: project.projectCode,
    projectName: project.projectName,
    projectType: project.projectType,
    division: project.division,
    owner: project.owner,
    projectStatusId: project.projectStatusId,
    createdAt: project.createdAt,
    analystId: project.analystId,
  };
};

const mapAnalystAssignedProject = (row: any) => {
  const project = mapJoinedProject(row);
  return {
    id: project.id,
    projectCode: project.projectCode,
    projectName: project.projectName,
    projectType: project.projectType,
    division: project.division,
    owner: project.owner,
    projectStatusId: project.projectStatusId,
    assignedAt: project.assignedAt,
    createdAt: project.createdAt,
    analystId: project.analystId,
  };
};

// export const findAllProjects = async () => {
//   const rows = await getBaseProjectQuery().orderBy(desc(projects.createdAt));
//   return rows.map(mapJoinedProject);
// };

// export const findProjectById = async (id: string) => {
//   const rows = await getBaseProjectQuery().where(eq(projects.id, id));

//   if (!rows || rows.length === 0) {
//     throw new HTTPException(404, { message: "ไม่พบข้อมูลโครงการ" });
//   }

//   return mapJoinedProject(rows[0]);
// };

export const findAllProjects = async (user: UserContext, queryParams: ProjectQueryDTO) => {
  const { page, limit, search, status, statusIds: rawStatusIds, ownership } = queryParams;
  const statusIds = normalizeProjectStatusIds(rawStatusIds);
  const offset = (page - 1) * limit;

  let query = getBaseProjectQuery();
  let countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .leftJoin(divisions, eq(projects.divisionId, divisions.divisionId))
    .leftJoin(users, eq(projects.userId, users.userId)) as any;

  const conditions: SQL[] = [isNull(projects.deletedAt)];
  const normalizedRoles = user.roles.map((role) => String(role).toLowerCase());
  const isAdmin =
    normalizedRoles.includes("super_admin") || normalizedRoles.includes("admin");

  // ==========================================
  // 1. กฎเหล็กความปลอดภัย (Security Baseline)
  // ==========================================
  if (!isAdmin) {
    // คนทั่วไปจะเห็นข้อมูลได้ใน 2 กรณีเท่านั้น:
    // 1. เป็นข้อมูลของแผนกตัวเอง (departmentId ตรงกัน)
    // 2. หรือเป็นข้อมูลที่ไม่ใช่ Draft (สถานะ > 1) ซึ่งสอดคล้องกับหน้า "All Projects"
    conditions.push(
      or(
        eq(divisions.departmentId, user.departmentId),
        ne(projects.projectStatusId, 1),
      )!,
    );
  }

  // ==========================================
  // 2. ตัวกรองความเป็นเจ้าของ (Ownership Filter)
  // ==========================================
  if (ownership === "mine") {
    conditions.push(eq(projects.userId, user.userId));
  } else if (ownership === "team_only") {
    conditions.push(eq(divisions.departmentId, user.departmentId));
    conditions.push(ne(projects.userId, user.userId)); // ของทีม แต่ต้องไม่ใช่ของฉัน
  } else if (ownership === "team_and_mine") {
    conditions.push(eq(divisions.departmentId, user.departmentId));
  }

  // ==========================================
  // 3. ตัวกรองสถานะ (Status Filter)
  // ==========================================
  if (statusIds && statusIds.length > 0) {
    conditions.push(inArray(projects.projectStatusId, statusIds));
  } else if (status === "draft") {
    conditions.push(eq(projects.projectStatusId, 1));
  } else if (status === "submitted" || status === "all_except_draft") {
    conditions.push(ne(projects.projectStatusId, 1));
  }

  // ==========================================
  // 4. ตัวกรองคำค้นหา (Search Filter)
  // ==========================================
  if (search) {
    conditions.push(
      or(
        ilike(projects.projectName, `%${search}%`),
        ilike(projects.projectNameOriginal, `%${search}%`),
        ilike(projects.projectCode, `%${search}%`),
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
      )!,
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
    countQuery = countQuery.where(and(...conditions)) as any;
  }

  const [rows, [{ count }]] = await Promise.all([
    query.orderBy(desc(projects.createdAt)).limit(limit).offset(offset),
    countQuery,
  ]);

  return {
    data: rows.map(mapJoinedProject),
    pagination: {
      total: Number(count),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(count) / Number(limit)),
    },
  };
};

export const findProjectById = async (id: string, user: UserContext) => {
  const rows = await getBaseProjectQuery().where(and(eq(projects.id, id), isNull(projects.deletedAt)));
  if (!rows || rows.length === 0)
    throw new HTTPException(404, { message: "ไม่พบข้อมูลโครงการ" });

  const project = mapJoinedProject(rows[0]);
  const [editableDraft] = await db
    .select({ id: proposalDrafts.id })
    .from(proposalDrafts)
    .where(eq(proposalDrafts.projectId, id))
    .limit(1);

  // เช็คสิทธิ์การอ่าน
  checkPermission(user, "read", "project", {
    departmentId: project.division?.departmentId,
  });
  const rolesForAccess = normalizedUserRoles(user);
  const isGlobalProjectManager = rolesForAccess.some((role) =>
    ["admin", "super_admin", "secretary"].includes(role),
  );
  if (rolesForAccess.includes("analyst") && !isGlobalProjectManager && project.analystId !== user.userId) {
    throw new HTTPException(403, {
      message: "This project is not assigned to the authenticated Analyst",
    });
  }
  const attachments = await db
    .select({
      id: projectAttachments.id,
      projectId: projectAttachments.projectId,
      docTypeId: projectAttachments.docTypeId,
      docTypeName: projectAttachmentTypes.docTypeName,
      uploadedBy: projectAttachments.uploadedBy,
      fileName: projectAttachments.fileName,
      fileUrl: projectAttachments.fileUrl,
      fileType: projectAttachments.fileType,
      fileSize: projectAttachments.fileSize,
      description: projectAttachments.description,
      uploader: {
        userId: attachmentUploaders.userId,
        firstName: attachmentUploaders.firstName,
        lastName: attachmentUploaders.lastName,
      },
      createdAt: projectAttachments.createdAt,
    })
    .from(projectAttachments)
    .leftJoin(projectAttachmentTypes, eq(projectAttachments.docTypeId, projectAttachmentTypes.id))
    .leftJoin(attachmentUploaders, eq(projectAttachments.uploadedBy, attachmentUploaders.userId))
    .where(eq(projectAttachments.projectId, id))
    .orderBy(desc(projectAttachments.createdAt), desc(projectAttachments.id));

  const [latestReturnLog] = await db
    .select({
      remark: projectStatusLogs.remark,
      createdAt: projectStatusLogs.createdAt,
      oldStatusId: projectStatusLogs.oldStatusId,
      newStatusId: projectStatusLogs.newStatusId,
      reviewer: {
        userId: users.userId,
        firstName: users.firstName,
        lastName: users.lastName,
      },
    })
    .from(projectStatusLogs)
    .leftJoin(users, eq(projectStatusLogs.userId, users.userId))
    .where(
      and(
        eq(projectStatusLogs.projectId, id),
        inArray(projectStatusLogs.newStatusId, [
          PROJECT_STATUS.RETURNED_SECRETARY,
          PROJECT_STATUS.RETURNED_ANALYST,
          PROJECT_STATUS.RETURNED_SMALL_BOARD,
          PROJECT_STATUS.RETURNED_BIG_BOARD,
        ]),
      ),
    )
    .orderBy(desc(projectStatusLogs.createdAt))
    .limit(1);

  const isSuperAdmin = rolesForAccess.includes("super_admin");
  const isAdmin = rolesForAccess.includes("admin") || isSuperAdmin;
  const isSecretary = rolesForAccess.includes("secretary");
  const isOwner = project.userId === user.userId;
  const isSameDepartment = isSameDepartmentUser(user, project.division?.departmentId);
  const isAssignedAnalyst = rolesForAccess.includes("analyst") && project.analystId === user.userId;
  const isAnalystEditableStage = isAssignedAnalyst && project.projectStatusId === PROJECT_STATUS.IN_ANALYSIS;
  const hasAttachmentRole = rolesForAccess.some((role) => ["secretary", "admin", "super_admin"].includes(role));
  const isOwnerEditableStage = OWNER_EDITABLE_STATUS_IDS.includes(
    project.projectStatusId as typeof OWNER_EDITABLE_STATUS_IDS[number],
  );

  const isDepartmentCollaborator = isSameDepartmentUser(user, project.division?.departmentId);
  const canEditProject = isSecretary || isSuperAdmin || isAnalystEditableStage ||
    ((isOwner || isDepartmentCollaborator) && isOwnerEditableStage);
  const canEditProposal = isSecretary || isAnalystEditableStage ||
    ((isOwner || isDepartmentCollaborator) && isOwnerEditableStage);
  const canSubmitProposal =
    !isSecretaryOnlyUser(user) &&
    (isOwner || isDepartmentCollaborator) &&
    isOwnerEditableStage &&
    Boolean(editableDraft);
  const canCancelSubmit = isOwner && project.projectStatusId === PROJECT_STATUS.PENDING_SECRETARY;
  const canChangeVisibility = isAdmin;
  const canManageAttachments = isSecretary || isSuperAdmin || isAnalystEditableStage || (
    isOwnerEditableStage && (isOwner || isSameDepartment || hasAttachmentRole)
  );

  const attachmentsWithPermissions = attachments.map((attachment) => ({
    ...attachment,
    canDelete:
      attachment.docTypeName === "approval_document"
        ? isAdmin
        : canManageAttachments && !isAssignedAnalyst,
  }));

  const reviewerRoleByStatus: Record<number, string> = {
    [PROJECT_STATUS.RETURNED_SECRETARY]: "Secretary",
    [PROJECT_STATUS.RETURNED_ANALYST]: "Analyst",
    [PROJECT_STATUS.RETURNED_SMALL_BOARD]: "Small Board",
    [PROJECT_STATUS.RETURNED_BIG_BOARD]: "Big Board",
  };

  return {
    ...project,
    attachments: attachmentsWithPermissions,
    permissions: {
      canDelete: isSuperAdmin || (isOwner && project.projectStatusId === PROJECT_STATUS.DRAFT),
      canManageAttachments,
    canEditProject,
    canUpdateProject: canEditProject,
      canEditProposal,
      canSubmitProposal,
      canCancelSubmit,
      canChangeVisibility,
    },
    latestReturnFeedback: latestReturnLog
      ? {
          remark: latestReturnLog.remark ?? "",
          reviewer: latestReturnLog.reviewer?.userId
            ? latestReturnLog.reviewer
            : null,
          reviewerRole: reviewerRoleByStatus[latestReturnLog.newStatusId] ?? "Reviewer",
          createdAt: latestReturnLog.createdAt,
          oldStatusId: latestReturnLog.oldStatusId,
          newStatusId: latestReturnLog.newStatusId,
        }
      : null,
  };
};

export const getPendingSecretaryProjects = async (
  queryParams: SecretaryPendingProjectQueryDTO,
  user: UserContext,
) => {
  assertSecretary(user);

  const { page, limit, search } = queryParams;
  const offset = (page - 1) * limit;
  const conditions: SQL[] = [
    eq(projects.projectStatusId, PROJECT_STATUS.PENDING_SECRETARY),
    isNull(projects.deletedAt),
  ];

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(projects.projectCode, pattern),
        ilike(projects.projectName, pattern),
        ilike(projects.projectNameOriginal, pattern),
        ilike(users.firstName, pattern),
        ilike(users.lastName, pattern),
      )!,
    );
  }

  const query = getBaseProjectQuery().where(and(...conditions));
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.userId))
    .where(and(...conditions));

  const [rows, [{ count }]] = await Promise.all([
    query.orderBy(desc(projects.createdAt)).limit(limit).offset(offset),
    countQuery,
  ]);

  return {
    data: rows.map(mapJoinedProject),
    pagination: {
      total: Number(count),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(count) / Number(limit)),
    },
  };
};

export const getPendingAssignmentProjects = async (
  queryParams: AssignmentProjectQueryDTO,
  user: UserContext,
) => {
  assertProjectAssignmentAdmin(user);

  const { page, limit, search } = queryParams;
  const offset = (page - 1) * limit;
  const conditions: SQL[] = [
    eq(projects.projectStatusId, PROJECT_STATUS.PENDING_ASSIGNMENT),
    isNull(projects.deletedAt),
  ];

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        ilike(projects.projectCode, pattern),
        ilike(projects.projectName, pattern),
        ilike(projects.projectNameOriginal, pattern),
        ilike(users.firstName, pattern),
        ilike(users.lastName, pattern),
      )!,
    );
  }

  const query = getBaseProjectQuery().where(and(...conditions));
  const countQuery = db
    .select({ count: sql<number>`count(distinct ${projects.id})` })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.userId))
    .where(and(...conditions));

  const [rows, [{ count }]] = await Promise.all([
    query.orderBy(desc(projects.createdAt)).limit(limit).offset(offset),
    countQuery,
  ]);

  return {
    data: rows.map(mapAssignmentProject),
    pagination: {
      total: Number(count),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(count) / Number(limit)),
    },
  };
};

export const getAnalystAssignedProjects = async (
  queryParams: AnalystAssignedProjectQueryDTO,
  user: UserContext,
) => {
  assertAnalyst(user);

  const { page, limit, search } = queryParams;
  const offset = (page - 1) * limit;
  const conditions: SQL[] = [
    eq(projects.analystId, user.userId),
    inArray(projects.projectStatusId, [...ANALYST_VISIBLE_STATUS_IDS]),
    isNull(projects.deletedAt),
  ];

  if (search?.trim()) {
    const pattern = `%${search.trim()}%`;
    conditions.push(or(
      ilike(projects.projectCode, pattern),
      ilike(projects.projectName, pattern),
      ilike(projects.projectNameOriginal, pattern),
      ilike(users.firstName, pattern),
      ilike(users.lastName, pattern),
    )!);
  }

  const query = getBaseProjectQuery().where(and(...conditions));
  const countQuery = db
    .select({ count: sql<number>`count(distinct ${projects.id})` })
    .from(projects)
    .leftJoin(users, eq(projects.userId, users.userId))
    .where(and(...conditions));

  const [rows, [{ count }]] = await Promise.all([
    query.orderBy(desc(projects.createdAt)).limit(limit).offset(offset),
    countQuery,
  ]);

  return {
    data: rows.map(mapAnalystAssignedProject),
    pagination: {
      total: Number(count),
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(Number(count) / Number(limit)),
    },
  };
};

export const requestAnalystReassignment = async (
  id: string,
  data: AnalystReassignmentDTO,
  user: UserContext,
) => {
  const project = await findProjectById(id, user);
  assertAssignedAnalyst(user, project);
  if (project.projectStatusId !== PROJECT_STATUS.IN_ANALYSIS) {
    throw new HTTPException(409, {
      message: "Reassignment can only be requested while the project is in analysis",
    });
  }

  const reason = data.reason.trim();
  await db.transaction(async (tx) => {
    const released = await tx
      .update(projects)
      .set({
        analystId: null,
        assignedBy: null,
        assignedAt: null,
        updatedBy: user.userId,
        updatedAt: new Date(),
      })
      .where(and(
        eq(projects.id, id),
        eq(projects.analystId, user.userId),
        eq(projects.projectStatusId, PROJECT_STATUS.IN_ANALYSIS),
        isNull(projects.deletedAt),
      ))
      .returning({ id: projects.id });

    if (released.length === 0) {
      throw new HTTPException(409, { message: "Project assignment changed before the request completed" });
    }

    await applyProjectStatusTransition(tx, {
      projectId: id,
      userId: user.userId,
      oldStatusId: PROJECT_STATUS.IN_ANALYSIS,
      newStatusId: PROJECT_STATUS.PENDING_ASSIGNMENT,
      remark: reason,
    });
  });

  return {
    message: "Reassignment request submitted successfully",
    project: {
      ...project,
      analystId: null,
      assignedBy: null,
      assignedAt: null,
      projectStatusId: PROJECT_STATUS.PENDING_ASSIGNMENT,
      permissions: {
        canDelete: false,
        canManageAttachments: false,
        canEditProject: false,
        canUpdateProject: false,
        canEditProposal: false,
        canSubmitProposal: false,
      },
    },
  };
};

export const reviewAnalystProject = async (
  id: string,
  data: AnalystReviewDTO,
  user: UserContext,
) => {
  const project = await findProjectById(id, user);
  assertAssignedAnalyst(user, project);
  if (project.projectStatusId !== PROJECT_STATUS.IN_ANALYSIS) {
    throw new HTTPException(409, {
      message: "This project is no longer waiting for Analyst review",
    });
  }

  const newStatusId = data.decision === "approve"
    ? project.returnStage === "BIG_BOARD"
      ? PROJECT_STATUS.PENDING_BIG_BOARD
      : PROJECT_STATUS.PENDING_SMALL_BOARD
    : data.decision === "return"
      ? PROJECT_STATUS.RETURNED_ANALYST
      : PROJECT_STATUS.REJECTED_ANALYST;
  const remark = data.remark.trim();

  await db.transaction(async (tx) => {
    await applyProjectStatusTransition(tx, {
      projectId: id,
      userId: user.userId,
      oldStatusId: PROJECT_STATUS.IN_ANALYSIS,
      newStatusId,
      remark,
      sourceOperation: "ANALYST_REVIEW",
      clearReturnStage: data.decision === "approve" && Boolean(project.returnStage),
    });
  });

  return {
    message: "Analyst review completed successfully",
    project: await findProjectById(id, user),
  };
};

const getSecretaryProjectType = async (projectTypeId: number) => {
  const [projectType] = await db
    .select({ id: projectTypes.id, name: projectTypes.typeName })
    .from(projectTypes)
    .where(eq(projectTypes.id, projectTypeId))
    .limit(1);

  const normalizedName = projectType?.name.trim().toLowerCase();
  if (!projectType || !["hardware", "software"].includes(normalizedName)) {
    throw new HTTPException(400, {
      message: "Secretary approval requires a Hardware or Software project type",
    });
  }

  return projectType;
};

export const reviewSecretaryProject = async (
  id: string,
  data: SecretaryReviewDTO,
  user: UserContext,
) => {
  assertSecretary(user);

  const rows = await getBaseProjectQuery().where(
    and(eq(projects.id, id), isNull(projects.deletedAt)),
  );
  if (rows.length === 0) {
    throw new HTTPException(404, { message: "Project not found" });
  }

  const project = mapJoinedProject(rows[0]);
  if (project.projectStatusId !== PROJECT_STATUS.PENDING_SECRETARY) {
    throw new HTTPException(409, {
      message: "This project is no longer waiting for Secretary review",
    });
  }

  let newStatusId: number;
  let remark: string | undefined;
  let projectTypeId: number | undefined;

  if (data.decision === "approve") {
    await getSecretaryProjectType(data.projectTypeId);
    projectTypeId = data.projectTypeId;
    newStatusId = PROJECT_STATUS.PENDING_ASSIGNMENT;
  } else if (data.decision === "return") {
    remark = data.remark.trim();
    newStatusId = PROJECT_STATUS.RETURNED_SECRETARY;
  } else {
    remark = data.remark.trim();
    newStatusId = PROJECT_STATUS.REJECTED_SECRETARY;
  }

  assertValidProjectTransition(
    PROJECT_STATUS.PENDING_SECRETARY,
    newStatusId,
    remark,
  );

  await db.transaction(async (tx) => {
    const current = await tx
      .select({ id: projects.id, ownerId: projects.userId, projectName: projects.projectName })
      .from(projects)
      .where(
        and(
          eq(projects.id, id),
          eq(projects.projectStatusId, PROJECT_STATUS.PENDING_SECRETARY),
          isNull(projects.deletedAt),
        ),
      )
      .for("update")
      .limit(1);

    if (current.length === 0) {
      throw new HTTPException(409, {
        message: "Project status changed before this review completed",
      });
    }

    if (projectTypeId !== undefined) {
      const updatedType = await tx
        .update(projects)
        .set({ projectTypeId })
        .where(
          and(
            eq(projects.id, id),
            eq(projects.projectStatusId, PROJECT_STATUS.PENDING_SECRETARY),
          ),
        )
        .returning({ id: projects.id });

      if (updatedType.length === 0) {
        throw new HTTPException(409, {
          message: "Project status changed before its category was saved",
        });
      }
    }

    if (data.decision === "return") {
      const [submitted] = await tx
        .select({ id: proposals.id })
        .from(proposals)
        .where(and(eq(proposals.projectId, id), eq(proposals.status, "submitted")))
        .orderBy(desc(proposals.submittedAt), desc(proposals.updatedAt), desc(proposals.id))
        .for("update")
        .limit(1);

      if (!submitted) {
        throw new HTTPException(409, { message: "Submitted proposal history was not found" });
      }

      const restored = await restoreEditableProposalDraft(tx, {
        proposalId: submitted.id,
        projectId: id,
        draftUserId: current[0].ownerId,
        updatedBy: user.userId,
        projectName: current[0].projectName,
      });

      await tx
        .update(projects)
        .set({
          latestRequestedBudget: restored.requestedBudgetTotal,
          latestEstimatedCost: restored.estimatedCostTotal,
        })
        .where(and(eq(projects.id, id), eq(projects.projectStatusId, PROJECT_STATUS.PENDING_SECRETARY)));
    }

    await applyProjectStatusTransition(tx, {
      projectId: id,
      userId: user.userId,
      oldStatusId: PROJECT_STATUS.PENDING_SECRETARY,
      newStatusId,
      remark,
    });
  });

  return {
    decision: data.decision,
    project: await findProjectById(id, user),
  };
};

export const createProject = async (
  user: UserContext,
  data: CreateProjectDTO,
) => {
  await assertUserExists(user.userId);
  checkPermission(user, "create", "project", {
    departmentId: user.departmentId,
  });
  const newId = uuidv7();
  const newProjectCode = await generateProjectCode();

  await db.insert(projects).values({
    id: newId,
    projectCode: newProjectCode,
    ...data,
    projectNameOriginal: data.projectName,
    isPublic: false,
    userId: user.userId,
    divisionId: user.divisionId, // บังคับใช้ Division ID จาก User's Token
  });

  return await findProjectById(newId, user);
};

export const updateProject = async (
  id: string,
  data: UpdateProjectDTO,
  user: UserContext,
) => {
  await assertUserExists(user.userId);
  const project = await findProjectById(id, user);
  const isAnalystEditableStage = hasRole(user, "analyst") &&
    project.analystId === user.userId &&
    project.projectStatusId === PROJECT_STATUS.IN_ANALYSIS;
  const isOwnerEditableStage = OWNER_EDITABLE_STATUS_IDS.includes(
    project.projectStatusId as typeof OWNER_EDITABLE_STATUS_IDS[number],
  );

  if (hasRole(user, "analyst") && !hasRole(user, "admin") && !hasRole(user, "super_admin") && !hasRole(user, "secretary")) {
    assertAssignedAnalyst(user, project);
    if (project.projectStatusId !== PROJECT_STATUS.IN_ANALYSIS) {
      throw new HTTPException(403, {
        message: "Analysts may edit project details only while the project is in analysis",
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call(data as Record<string, unknown>, "projectStatusId")) {
    throw new HTTPException(400, {
      message: "Project status must be changed through the workflow endpoint",
    });
  }

  const isOwner = project.userId === user.userId;
  const isDepartmentCollaborator = isSameDepartmentUser(user, project.division?.departmentId);
  const isCentralReviewer = hasRole(user, "secretary") || hasRole(user, "super_admin");
  if (isOwner && !isCentralReviewer && !isAnalystEditableStage && !isOwnerEditableStage) {
    throw new HTTPException(403, {
      message: "Project details can only be edited during an owner-editable stage",
    });
  }
  if (!isOwner && !isCentralReviewer && !isAnalystEditableStage && !isDepartmentCollaborator) {
    throw new HTTPException(403, { message: "Only the project owner, assigned reviewer, or same-Department USER can edit this project" });
  }
  if (!isOwner && isDepartmentCollaborator && !isOwnerEditableStage) {
    throw new HTTPException(409, { message: "This project is no longer in an editable state" });
  }
  if (Object.prototype.hasOwnProperty.call(data as Record<string, unknown>, "projectName") &&
      !isOwner && !isOwnerEditableStage) {
    throw new HTTPException(403, { message: "The project name is locked during review" });
  }

  // เช็คสิทธิ์การแก้ไข (ป้องกันการยิง API มาแก้โปรเจกต์แผนกอื่น)
  checkPermission(user, "update", "project", {
    departmentId: project.division?.departmentId,
  });

  await db
    .update(projects)
    .set({
      ...data,
      updatedBy: user.userId,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  return await findProjectById(id, user);
};

export const updateProjectType = async (
  id: string,
  data: UpdateProjectTypeDTO,
  user: UserContext,
) => {
  const project = await findProjectById(id, user);
  if (hasRole(user, "analyst") && !hasRole(user, "admin") && !hasRole(user, "super_admin") && !hasRole(user, "secretary")) {
    assertAssignedAnalyst(user, project);
    if (project.projectStatusId !== PROJECT_STATUS.IN_ANALYSIS) {
      throw new HTTPException(403, { message: "Analysts may edit project details only while the project is in analysis" });
    }
  }
  checkPermission(user, "update", "project", {
    departmentId: project.division?.departmentId,
  });

  await db
    .update(projects)
    .set({
      projectTypeId: data.projectTypeId,
      updatedBy: user.userId,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id));

  return await findProjectById(id, user);
};

export const updateProjectStatus = async (
  id: string,
  data: UpdateProjectStatusDTO,
  user: UserContext,
) => {
  const project = await findProjectById(id, user);
  const meetingManagedStatuses = new Set<number>([
    PROJECT_STATUS.PENDING_SMALL_BOARD,
    PROJECT_STATUS.RETURNED_FROM_SMALL_BOARD,
    PROJECT_STATUS.REJECTED_BY_SMALL_BOARD,
    PROJECT_STATUS.PENDING_BIG_BOARD,
    PROJECT_STATUS.RETURNED_FROM_BIG_BOARD,
    PROJECT_STATUS.REJECTED_BY_BIG_BOARD,
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.ACKNOWLEDGED,
  ]);
  if (
    meetingManagedStatuses.has(project.projectStatusId) ||
    meetingManagedStatuses.has(data.projectStatusId)
  ) {
    throw new HTTPException(409, {
      message: "Board-managed statuses must be changed through meeting resolutions or the audited reopening action",
    });
  }

  const normalizedRoles = normalizedUserRoles(user);
  const isPrivileged = normalizedRoles.some((role) => ["admin", "super_admin"].includes(role));
  if (normalizedRoles.includes("analyst") && !isPrivileged) {
    throw new HTTPException(403, {
      message: "Analysts must use the dedicated Analyst review or reassignment action",
    });
  }

  const isSecretaryApproval =
    project.projectStatusId === PROJECT_STATUS.PENDING_SECRETARY &&
    data.projectStatusId === PROJECT_STATUS.PENDING_ASSIGNMENT;

  if (normalizedRoles.includes("secretary") && !isPrivileged) {
    if (project.projectStatusId !== PROJECT_STATUS.PENDING_SECRETARY) {
      throw new HTTPException(403, {
        message: "Secretary status actions are only available during Secretary review",
      });
    }

    if (data.projectStatusId === PROJECT_STATUS.RETURNED_SECRETARY) {
      return reviewSecretaryProject(id, {
        decision: "return",
        remark: data.remark ?? "",
      }, user);
    }

    if (data.projectStatusId === PROJECT_STATUS.REJECTED_SECRETARY) {
      return reviewSecretaryProject(id, {
        decision: "reject",
        remark: data.remark ?? "",
      }, user);
    }

    if (isSecretaryApproval) {
      if (data.projectTypeId === undefined) {
        throw new HTTPException(400, {
          message: "A Hardware or Software project type is required before approval",
        });
      }
      return reviewSecretaryProject(id, {
        decision: "approve",
        projectTypeId: data.projectTypeId,
      }, user);
    }

    throw new HTTPException(409, {
      message: "Invalid Secretary review decision",
    });
  }

  if (!isPrivileged && !normalizedRoles.includes("secretary") && !normalizedRoles.includes("analyst")) {
    throw new HTTPException(403, { message: "You do not have permission to change project status" });
  }
  if (!isPrivileged && normalizedRoles.includes("secretary") && !isSecretaryApproval && project.projectStatusId !== PROJECT_STATUS.PENDING_SECRETARY) {
    throw new HTTPException(403, { message: "Secretary status actions are only available during Secretary review" });
  }
  if (!isPrivileged && normalizedRoles.includes("analyst") && project.projectStatusId !== PROJECT_STATUS.IN_ANALYSIS) {
    throw new HTTPException(403, { message: "Analyst status actions are only available during analysis" });
  }
  if (isSecretaryApproval && data.projectTypeId !== 1 && data.projectTypeId !== 2) {
    throw new HTTPException(400, { message: "A Hardware or Software project type is required before approval" });
  }

  assertValidProjectTransition(project.projectStatusId, data.projectStatusId, data.remark);

  await db.transaction(async (tx) => {
    if (isSecretaryApproval) {
      await tx
        .update(projects)
        .set({ projectTypeId: data.projectTypeId })
        .where(eq(projects.id, id));
    }
    await applyProjectStatusTransition(tx, {
      projectId: id,
      userId: user.userId,
      oldStatusId: project.projectStatusId,
      newStatusId: data.projectStatusId,
      remark: data.remark,
    });
  });

  return await findProjectById(id, user);
};

export const assignProject = async (
  id: string,
  data: AssignProjectDTO,
  user: UserContext,
) => {
  const project = await findProjectById(id, user);
  assertProjectAssignmentAdmin(user);

  if (!user.roles.includes("admin") && !user.roles.includes("super_admin")) {
    throw new HTTPException(403, { message: "ไม่มีสิทธิ์มอบหมายงาน" });
  }

  await db.transaction(async (tx) => {
    await getAnalystForAssignment(tx, data.analystId);

    const updated = await tx
      .update(projects)
      .set({
        analystId: data.analystId,
        assignedBy: user.userId,
        assignedAt: new Date(),
        updatedBy: user.userId,
        updatedAt: new Date(),
      })
      .where(and(
        eq(projects.id, id),
        eq(projects.projectStatusId, PROJECT_STATUS.PENDING_ASSIGNMENT),
        isNull(projects.deletedAt),
      ))
      .returning({ id: projects.id });

    if (updated.length === 0) {
      throw new HTTPException(409, {
        message: "Project is no longer waiting for Analyst assignment",
      });
    }

    await applyProjectStatusTransition(tx, {
      projectId: id,
      userId: user.userId,
      oldStatusId: PROJECT_STATUS.PENDING_ASSIGNMENT,
      newStatusId: PROJECT_STATUS.IN_ANALYSIS,
    });
  });

  return await findProjectById(id, user);
};

export const bulkAssignProjects = async (
  data: BulkAssignProjectDTO,
  user: UserContext,
) => {
  assertProjectAssignmentAdmin(user);

  const result = await db.transaction(async (tx) => {
    const analyst = await getAnalystForAssignment(tx, data.analystId);
    const pendingProjects = await tx
      .select({ id: projects.id, projectCode: projects.projectCode })
      .from(projects)
      .where(and(
        inArray(projects.id, data.projectIds),
        eq(projects.projectStatusId, PROJECT_STATUS.PENDING_ASSIGNMENT),
        isNull(projects.deletedAt),
      ));

    if (pendingProjects.length !== data.projectIds.length) {
      throw new HTTPException(409, {
        message: "One or more selected projects are no longer waiting for assignment",
      });
    }

    const assignedProjects: Array<{
      id: string;
      projectCode: string | null;
      projectStatusId: number;
      analystId: string;
    }> = [];

    for (const project of pendingProjects) {
      const updated = await tx
        .update(projects)
        .set({
          analystId: data.analystId,
          assignedBy: user.userId,
          assignedAt: new Date(),
          updatedBy: user.userId,
          updatedAt: new Date(),
        })
        .where(and(
          eq(projects.id, project.id),
          eq(projects.projectStatusId, PROJECT_STATUS.PENDING_ASSIGNMENT),
          isNull(projects.deletedAt),
        ))
        .returning({ id: projects.id, projectCode: projects.projectCode });

      if (updated.length === 0) {
        throw new HTTPException(409, {
          message: "A selected project changed before assignment completed",
        });
      }

      await applyProjectStatusTransition(tx, {
        projectId: project.id,
        userId: user.userId,
        oldStatusId: PROJECT_STATUS.PENDING_ASSIGNMENT,
        newStatusId: PROJECT_STATUS.IN_ANALYSIS,
      });

      assignedProjects.push({
        id: project.id,
        projectCode: project.projectCode,
        projectStatusId: PROJECT_STATUS.IN_ANALYSIS,
        analystId: data.analystId,
      });
    }

    return { analyst, projects: assignedProjects };
  });

  return {
    count: result.projects.length,
    analyst: {
      userId: result.analyst.userId,
      firstName: result.analyst.firstName,
      lastName: result.analyst.lastName,
    },
    projects: result.projects,
  };
};

export const removeProject = async (id: string, user: UserContext) => {
  const project = await findProjectById(id, user); // จะ Throw 404/403 หากหาไม่เจอหรือไม่มีสิทธิ์อ่าน

  // เช็คสิทธิ์ก่อนลบ
  const isSuperAdmin = user.roles.includes("super_admin");
  const isOwnerDraft = project.userId === user.userId && project.projectStatusId === PROJECT_STATUS.DRAFT;
  if (!isSuperAdmin && !isOwnerDraft) {
    throw new HTTPException(403, { message: "Only the project owner can delete a draft project" });
  }

  if (project.projectStatusId === PROJECT_STATUS.DRAFT) {
    const attachmentFileUrls: string[] = project.attachments.map(
      (attachment: { fileUrl: string }) => attachment.fileUrl,
    );

    await db.transaction(async (tx) => {
      // Drafts are disposable. Remove explicit non-cascading project children
      // first, then let the project foreign keys cascade attachments/logs.
      const projectAgendas = await tx
        .select({ id: agendas.id })
        .from(agendas)
        .where(eq(agendas.projectId, id));
      const agendaIds = projectAgendas.map((agenda) => agenda.id);
      if (agendaIds.length > 0) {
        await tx.delete(meetingAttachments).where(inArray(meetingAttachments.agendaId, agendaIds));
        await tx.delete(agendas).where(inArray(agendas.id, agendaIds));
      }

      await tx.delete(proposalDrafts).where(eq(proposalDrafts.projectId, id));
      await tx.delete(proposals).where(eq(proposals.projectId, id));

      const deleted = await tx
        .delete(projects)
        .where(and(eq(projects.id, id), eq(projects.projectStatusId, PROJECT_STATUS.DRAFT)))
        .returning({ id: projects.id });
      if (deleted.length === 0) {
        throw new HTTPException(409, { message: "Project status changed before deletion completed" });
      }
    });

    // Database rows are already gone; clean the corresponding local files too.
    await Promise.all(attachmentFileUrls.map(async (fileUrl: string) => {
      const fileName = decodeURIComponent(fileUrl.split("/").pop() || "");
      if (fileName && basename(fileName) === fileName) {
        await unlink(join(UPLOAD_STORAGE_DIR, fileName)).catch(() => undefined);
      }
    }));
    return { mode: "hard" as const };
  }

  // Only Super Admin can delete a progressed project, and it remains available
  // for audit/history queries through its soft-delete timestamp.
  await db.update(projects).set({
    deletedAt: new Date(),
    updatedBy: user.userId,
    updatedAt: new Date(),
  }).where(and(eq(projects.id, id), isNull(projects.deletedAt)));
  return { mode: "soft" as const };
};

export const updateProjectVisibility = async (
  id: string,
  data: UpdateProjectVisibilityDTO,
  user: UserContext,
) => {
  const roles = normalizedUserRoles(user);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new HTTPException(403, { message: "Only Admin users can change project visibility" });
  }

  const [updated] = await db
    .update(projects)
    .set({
      isPublic: data.isPublic,
      updatedBy: user.userId,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
    .returning({ id: projects.id, isPublic: projects.isPublic });

  if (!updated) throw new HTTPException(404, { message: "Project not found" });

  return {
    message: data.isPublic ? "Project published successfully" : "Project unpublished successfully",
    projectId: updated.id,
    isPublic: updated.isPublic,
  };
};

const mapPublicProject = (row: any) => ({
  id: row.project.id,
  projectCode: row.project.projectCode,
  projectName: row.project.projectName,
  projectNameOriginal: row.project.projectNameOriginal,
  projectStatus: row.status?.id ? row.status : null,
  projectType: row.projectType?.id ? row.projectType : null,
});

export const getPublicProjects = async (queryParams: PublicProjectQueryDTO) => {
  const { page, limit, search } = queryParams;
  const offset = (page - 1) * limit;
  const conditions: SQL[] = [
    eq(projects.isPublic, true),
    inArray(projects.projectStatusId, [PROJECT_STATUS.APPROVED, PROJECT_STATUS.ACKNOWLEDGED]),
    isNull(projects.deletedAt),
  ];

  if (search) {
    const pattern = `%${search}%`;
    conditions.push(or(
      ilike(projects.projectCode, pattern),
      ilike(projects.projectName, pattern),
      ilike(projects.projectNameOriginal, pattern),
    )!);
  }

  const query = db
    .select({
      project: {
        id: projects.id,
        projectCode: projects.projectCode,
        projectName: projects.projectName,
        projectNameOriginal: projects.projectNameOriginal,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      },
      status: { id: projectStatuses.id, name: projectStatuses.statusName },
      projectType: { id: projectTypes.id, name: projectTypes.typeName },
    })
    .from(projects)
    .leftJoin(projectStatuses, eq(projects.projectStatusId, projectStatuses.id))
    .leftJoin(projectTypes, eq(projects.projectTypeId, projectTypes.id))
    .where(and(...conditions));
  const countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(projects)
    .where(and(...conditions));

  const [rows, [{ count }]] = await Promise.all([
    query.orderBy(desc(projects.updatedAt), desc(projects.id)).limit(limit).offset(offset),
    countQuery,
  ]);

  return {
    data: rows.map(mapPublicProject),
    pagination: {
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    },
  };
};

export const getPublicProjectById = async (id: string) => {
  const [row] = await db
    .select({
      project: {
        id: projects.id,
        projectCode: projects.projectCode,
        projectName: projects.projectName,
        projectNameOriginal: projects.projectNameOriginal,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      },
      status: { id: projectStatuses.id, name: projectStatuses.statusName },
      projectType: { id: projectTypes.id, name: projectTypes.typeName },
    })
    .from(projects)
    .leftJoin(projectStatuses, eq(projects.projectStatusId, projectStatuses.id))
    .leftJoin(projectTypes, eq(projects.projectTypeId, projectTypes.id))
    .where(and(
      eq(projects.id, id),
      eq(projects.isPublic, true),
      inArray(projects.projectStatusId, [PROJECT_STATUS.APPROVED, PROJECT_STATUS.ACKNOWLEDGED]),
      isNull(projects.deletedAt),
    ))
    .limit(1);

  if (!row) throw new HTTPException(404, { message: "Public project not found" });
  return mapPublicProject(row);
};

export const reopenRejectedProject = async (
  id: string,
  data: ReopenRejectedProjectDTO,
  user: UserContext,
) => {
  if (!hasRole(user, "super_admin")) {
    throw new HTTPException(403, { message: "Only Super Admin may reopen a board-rejected project" });
  }

  await db.transaction(async (tx) => {
    const [project] = await tx.select({
      id: projects.id,
      ownerId: projects.userId,
      statusId: projects.projectStatusId,
      analystId: projects.analystId,
      projectName: projects.projectName,
    }).from(projects).where(and(eq(projects.id, id), isNull(projects.deletedAt))).for("update").limit(1);
    if (!project) throw new HTTPException(404, { message: "Project not found" });

    const isSmall = project.statusId === PROJECT_STATUS.REJECTED_BY_SMALL_BOARD;
    const isBig = project.statusId === PROJECT_STATUS.REJECTED_BY_BIG_BOARD;
    if (!isSmall && !isBig) {
      throw new HTTPException(409, { message: "Only projects rejected by a board can be reopened" });
    }
    if (!project.analystId) {
      throw new HTTPException(409, { message: "Rejected project has no assigned Analyst to preserve" });
    }

    const [proposal] = await tx.select({ id: proposals.id }).from(proposals)
      .where(and(eq(proposals.projectId, id), eq(proposals.status, "submitted")))
      .orderBy(desc(proposals.updatedAt), desc(proposals.id)).for("update").limit(1);
    if (!proposal) throw new HTTPException(409, { message: "Submitted proposal history was not found" });

    const restored = await buildDraftPayload(tx, proposal.id);
    const payload = { ...restored, projectName: project.projectName ?? restored.projectName };
    const validated = submitProposalSchema.safeParse(payload);
    if (!validated.success) {
      throw new HTTPException(409, { message: "Historical proposal cannot be restored as an editable draft" });
    }
    const budget = sumProposalBudgets(validated.data.budgetsByYear);
    const now = new Date();
    const [draft] = await tx.insert(proposalDrafts).values({
      id: uuidv7(), projectId: id, userId: project.ownerId,
      projectName: payload.projectName, objective: payload.objective,
      requestedBudgetTotal: budget,
      estimatedCostTotal: calculateEstimatedCostTotal(validated.data),
      currentStep: 1, draftPayload: validated.data,
      updatedBy: user.userId, updatedAt: now,
    }).onConflictDoUpdate({
      target: proposalDrafts.projectId,
      set: {
        userId: project.ownerId, projectName: payload.projectName,
        objective: payload.objective, requestedBudgetTotal: budget,
        estimatedCostTotal: calculateEstimatedCostTotal(validated.data), currentStep: 1,
        draftPayload: validated.data, updatedBy: user.userId, updatedAt: now,
      },
    }).returning({ id: proposalDrafts.id, draftPayload: proposalDrafts.draftPayload });
    if (!draft || !submitProposalSchema.safeParse(draft.draftPayload).success) {
      throw new HTTPException(409, { message: "Restored proposal draft failed verification" });
    }

    const targetStatus = isSmall
      ? PROJECT_STATUS.RETURNED_FROM_SMALL_BOARD
      : PROJECT_STATUS.RETURNED_FROM_BIG_BOARD;
    const returnStage = isSmall ? "SMALL_BOARD" as const : "BIG_BOARD" as const;
    await applyProjectStatusTransition(tx, {
      projectId: id, userId: user.userId, oldStatusId: project.statusId,
      newStatusId: targetStatus, remark: data.reason,
      sourceOperation: "SUPER_ADMIN_REOPEN_REJECTED",
      returnStage,
    });
    await tx.insert(workflowAuditEvents).values({
      actorId: user.userId, action: "PROJECT_REOPENED_AFTER_BOARD_REJECTION",
      entityType: "PROJECT", entityId: id, reason: data.reason,
      metadata: { previousStatusId: project.statusId, newStatusId: targetStatus, returnStage, analystId: project.analystId },
      createdAt: now,
    });
  });

  return findProjectById(id, user);
};
