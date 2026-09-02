import { and, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { projects } from "../../db/schema/projects";
import { projectStatusLogs } from "../../db/schema/project_status_logs";

export const PROJECT_STATUS = {
  DRAFT: 1,
  PENDING_SECRETARY: 2,
  RETURNED_SECRETARY: 3,
  REJECTED_SECRETARY: 4,
  PENDING_ASSIGNMENT: 5,
  IN_ANALYSIS: 6,
  RETURNED_ANALYST: 7,
  REJECTED_ANALYST: 8,
  PENDING_SMALL_BOARD: 9,
  RETURNED_FROM_SMALL_BOARD: 10,
  REJECTED_BY_SMALL_BOARD: 11,
  PENDING_BIG_BOARD: 12,
  RETURNED_FROM_BIG_BOARD: 13,
  REJECTED_BY_BIG_BOARD: 14,
  APPROVED: 15,
  ACKNOWLEDGED: 16,
  // Compatibility aliases while older callers and data are migrated.
  RETURNED_SMALL_BOARD: 10,
  REJECTED_SMALL_BOARD: 11,
  RETURNED_BIG_BOARD: 13,
  REJECTED_BIG_BOARD: 14,
} as const;

export type ProjectReturnStage = "SMALL_BOARD" | "BIG_BOARD";

export const OWNER_EDITABLE_STATUS_IDS = [
  PROJECT_STATUS.DRAFT,
  PROJECT_STATUS.RETURNED_SECRETARY,
  PROJECT_STATUS.RETURNED_ANALYST,
  PROJECT_STATUS.RETURNED_FROM_SMALL_BOARD,
  PROJECT_STATUS.RETURNED_FROM_BIG_BOARD,
] as const;

export const OWNER_LOCKED_STATUS_IDS = [
  PROJECT_STATUS.PENDING_SECRETARY,
  PROJECT_STATUS.PENDING_ASSIGNMENT,
  PROJECT_STATUS.IN_ANALYSIS,
  PROJECT_STATUS.PENDING_SMALL_BOARD,
  PROJECT_STATUS.PENDING_BIG_BOARD,
  PROJECT_STATUS.APPROVED,
  PROJECT_STATUS.ACKNOWLEDGED,
] as const;

const TRANSITIONS: Record<number, number[]> = {
  [PROJECT_STATUS.DRAFT]: [PROJECT_STATUS.PENDING_SECRETARY],
  [PROJECT_STATUS.PENDING_SECRETARY]: [
    PROJECT_STATUS.RETURNED_SECRETARY,
    PROJECT_STATUS.REJECTED_SECRETARY,
    PROJECT_STATUS.PENDING_ASSIGNMENT,
  ],
  [PROJECT_STATUS.PENDING_ASSIGNMENT]: [PROJECT_STATUS.IN_ANALYSIS],
  [PROJECT_STATUS.IN_ANALYSIS]: [
    PROJECT_STATUS.PENDING_ASSIGNMENT,
    PROJECT_STATUS.RETURNED_ANALYST,
    PROJECT_STATUS.REJECTED_ANALYST,
    PROJECT_STATUS.PENDING_SMALL_BOARD,
    PROJECT_STATUS.PENDING_BIG_BOARD,
  ],
  [PROJECT_STATUS.RETURNED_SECRETARY]: [PROJECT_STATUS.PENDING_SECRETARY],
  [PROJECT_STATUS.RETURNED_ANALYST]: [PROJECT_STATUS.IN_ANALYSIS],
  [PROJECT_STATUS.RETURNED_FROM_SMALL_BOARD]: [PROJECT_STATUS.IN_ANALYSIS],
  [PROJECT_STATUS.RETURNED_FROM_BIG_BOARD]: [PROJECT_STATUS.IN_ANALYSIS],
  [PROJECT_STATUS.PENDING_SMALL_BOARD]: [
    PROJECT_STATUS.PENDING_BIG_BOARD,
    PROJECT_STATUS.RETURNED_FROM_SMALL_BOARD,
    PROJECT_STATUS.REJECTED_BY_SMALL_BOARD,
  ],
  [PROJECT_STATUS.PENDING_BIG_BOARD]: [
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.ACKNOWLEDGED,
    PROJECT_STATUS.RETURNED_FROM_BIG_BOARD,
    PROJECT_STATUS.REJECTED_BY_BIG_BOARD,
  ],
  [PROJECT_STATUS.REJECTED_BY_SMALL_BOARD]: [PROJECT_STATUS.RETURNED_FROM_SMALL_BOARD],
  [PROJECT_STATUS.REJECTED_BY_BIG_BOARD]: [PROJECT_STATUS.RETURNED_FROM_BIG_BOARD],
};

const REMARK_REQUIRED_STATUS_IDS: ReadonlySet<number> = new Set([
  PROJECT_STATUS.RETURNED_SECRETARY,
  PROJECT_STATUS.REJECTED_SECRETARY,
  PROJECT_STATUS.RETURNED_ANALYST,
  PROJECT_STATUS.REJECTED_ANALYST,
  PROJECT_STATUS.RETURNED_FROM_SMALL_BOARD,
  PROJECT_STATUS.REJECTED_BY_SMALL_BOARD,
  PROJECT_STATUS.RETURNED_FROM_BIG_BOARD,
  PROJECT_STATUS.REJECTED_BY_BIG_BOARD,
]);

export function assertValidProjectTransition(oldStatusId: number, newStatusId: number, remark?: string | null) {
  if (!TRANSITIONS[oldStatusId]?.includes(newStatusId)) {
    throw new HTTPException(409, {
      message: `Invalid project status transition: ${oldStatusId} -> ${newStatusId}`,
    });
  }

  const normalizedRemark = remark?.trim() || null;
  if (REMARK_REQUIRED_STATUS_IDS.has(newStatusId) && !normalizedRemark) {
    throw new HTTPException(400, { message: "A remark is required for returned or rejected transitions" });
  }
  return normalizedRemark;
}

export async function applyProjectStatusTransition(
  tx: any,
  input: {
    projectId: string;
    userId: string;
    oldStatusId: number;
    newStatusId: number;
    remark?: string | null;
    sourceOperation?: string;
    meetingId?: string | null;
    agendaId?: string | null;
    resolutionId?: string | null;
    returnStage?: ProjectReturnStage | null;
    clearReturnStage?: boolean;
    expectedVersion?: number;
    latestRequestedBudget?: string | null;
    finalApprovedBudget?: string | null;
    finalEstimatedCost?: string | null;
  },
) {
  const remark = assertValidProjectTransition(input.oldStatusId, input.newStatusId, input.remark);
  const now = new Date();
  const updated = await tx
    .update(projects)
    .set({
      projectStatusId: input.newStatusId,
      ...(input.returnStage !== undefined ? { returnStage: input.returnStage } : {}),
      ...(input.clearReturnStage ? { returnStage: null } : {}),
      ...(input.latestRequestedBudget !== undefined
        ? { latestRequestedBudget: input.latestRequestedBudget }
        : {}),
      ...(input.finalApprovedBudget !== undefined ? { finalApprovedBudget: input.finalApprovedBudget } : {}),
      ...(input.finalEstimatedCost !== undefined ? { finalEstimatedCost: input.finalEstimatedCost } : {}),
      workflowVersion: sql`${projects.workflowVersion} + 1`,
      updatedBy: input.userId,
      updatedAt: now,
    })
    .where(and(
      eq(projects.id, input.projectId),
      eq(projects.projectStatusId, input.oldStatusId),
      ...(input.expectedVersion === undefined
        ? []
        : [eq(projects.workflowVersion, input.expectedVersion)]),
    ))
    .returning({ id: projects.id, workflowVersion: projects.workflowVersion });

  if (updated.length === 0) {
    throw new HTTPException(409, { message: "Project status changed before this request completed" });
  }

  await tx.insert(projectStatusLogs).values({
    projectId: input.projectId,
    userId: input.userId,
    oldStatusId: input.oldStatusId,
    newStatusId: input.newStatusId,
    remark,
    sourceOperation: input.sourceOperation ?? null,
    meetingId: input.meetingId ?? null,
    agendaId: input.agendaId ?? null,
    resolutionId: input.resolutionId ?? null,
    createdAt: now,
  });

  return updated[0];
}

export async function applyProjectStatusReconciliation(
  tx: any,
  input: {
    projectId: string;
    userId: string;
    expectedStatusId: number;
    newStatusId: number;
    remark?: string | null;
    sourceOperation: string;
    meetingId?: string | null;
    agendaId?: string | null;
    resolutionId?: string | null;
    returnStage?: ProjectReturnStage | null;
    latestRequestedBudget?: string | null;
    finalApprovedBudget?: string | null;
    finalEstimatedCost?: string | null;
  },
) {
  const now = new Date();
  const [updated] = await tx.update(projects).set({
    projectStatusId: input.newStatusId,
    returnStage: input.returnStage ?? null,
    ...(input.latestRequestedBudget !== undefined
      ? { latestRequestedBudget: input.latestRequestedBudget }
      : {}),
    ...(input.finalApprovedBudget !== undefined ? { finalApprovedBudget: input.finalApprovedBudget } : {}),
    ...(input.finalEstimatedCost !== undefined ? { finalEstimatedCost: input.finalEstimatedCost } : {}),
    workflowVersion: sql`${projects.workflowVersion} + 1`,
    updatedBy: input.userId,
    updatedAt: now,
  }).where(and(
    eq(projects.id, input.projectId),
    eq(projects.projectStatusId, input.expectedStatusId),
  )).returning({ id: projects.id });

  if (!updated) {
    throw new HTTPException(409, { message: "Project workflow changed before reconciliation completed" });
  }

  await tx.insert(projectStatusLogs).values({
    projectId: input.projectId,
    userId: input.userId,
    oldStatusId: input.expectedStatusId,
    newStatusId: input.newStatusId,
    remark: input.remark?.trim() || null,
    sourceOperation: input.sourceOperation,
    meetingId: input.meetingId ?? null,
    agendaId: input.agendaId ?? null,
    resolutionId: input.resolutionId ?? null,
    createdAt: now,
  });
}
