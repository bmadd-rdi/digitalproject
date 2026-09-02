// src/modules/proposals/proposal.service.ts
import { db } from "../../db";
import { and, desc, eq, isNull, lt, sql } from "drizzle-orm";
import {
  proposals,
  proposalBudgets,
} from "../../db/schema/proposals";
import { proposalDrafts } from "../../db/schema/proposal_drafts";
import { projects } from "../../db/schema/projects";
import { divisions } from "../../db/schema/lookups";
import { users } from "../../db/schema/users";
import { HTTPException } from "hono/http-exception";
import { v7 as uuidv7 } from "uuid";
import type { UserContext } from "../../shared/auth/permission.helper";
import {
  checkPermission,
  isSecretaryOnlyUser,
} from "../../shared/auth/permission.helper";
import {
  PROJECT_STATUS,
  OWNER_EDITABLE_STATUS_IDS,
  applyProjectStatusTransition,
} from "../projects/project-workflow";
import { syncProposalCollections } from "./proposal.persistence";
import { sumProposalBudgets } from "./proposal-budget.util";
import { calculateEstimatedCostTotal } from "./proposal-estimated-cost.util";
import { submitProposalSchema } from "./proposal.schema";
import { isSameDepartmentUser } from "../projects/project-access.policy";

async function assertUserExists(userId: string) {
  const [user] = await db.select({ userId: users.userId }).from(users).where(eq(users.userId, userId)).limit(1);
  if (!user) throw new HTTPException(401, { message: "Invalid authentication token: user not found" });
}

type ProposalActor = UserContext | string;

function actorId(actor: ProposalActor) {
  return typeof actor === "string" ? actor : actor.userId;
}

async function assertOwnerOrDepartmentCanEditProject(projectId: string, actor: ProposalActor) {
  const [project] = await db
    .select({ id: projects.id, ownerId: projects.userId, statusId: projects.projectStatusId, departmentId: divisions.departmentId })
    .from(projects)
    .innerJoin(divisions, eq(projects.divisionId, divisions.divisionId))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new HTTPException(404, { message: "Project not found" });
  if (typeof actor === "string" && project.ownerId !== actor) {
    throw new HTTPException(403, { message: "Only the project owner can edit this proposal" });
  }
  if (typeof actor !== "string" && project.ownerId !== actor.userId) {
    const roles = actor.roles.map((role) => String(role).toLowerCase());
    if (!roles.includes("user") || actor.departmentId !== project.departmentId) {
      throw new HTTPException(403, { message: "Only an eligible user in the same Department can edit this proposal" });
    }
  }
  if (!OWNER_EDITABLE_STATUS_IDS.includes(project.statusId as typeof OWNER_EDITABLE_STATUS_IDS[number])) {
    throw new HTTPException(409, { message: "This project is currently outside the owner's editing stage" });
  }

  return project;
}

async function getProposalProjectAccess(projectId: string, user: UserContext) {
  const [project] = await db
    .select({
      id: projects.id,
      ownerId: projects.userId,
      analystId: projects.analystId,
      statusId: projects.projectStatusId,
      departmentId: divisions.departmentId,
    })
    .from(projects)
    .innerJoin(divisions, eq(projects.divisionId, divisions.divisionId))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new HTTPException(404, { message: "Project not found" });

  const roles = user.roles.map((role) => String(role).toLowerCase());
  const isGlobalProjectManager = roles.some((role) =>
    ["admin", "super_admin", "secretary"].includes(role),
  );
  const isSameDepartmentUser = roles.includes("user") && project.departmentId === user.departmentId;
  if (!isGlobalProjectManager && !roles.includes("analyst") && project.ownerId !== user.userId && !isSameDepartmentUser) {
    throw new HTTPException(403, {
      message: "Users may access proposal data only for their own projects",
    });
  }
  if (roles.includes("analyst") && !isGlobalProjectManager && project.analystId !== user.userId) {
    throw new HTTPException(403, {
      message: "This project is not assigned to the authenticated Analyst",
    });
  }

  return { project, roles };
}

const submittedProposalScalarColumns = {
  agencyName: proposals.agencyName,
  headOfAgency: proposals.headOfAgency,
  dcioName: proposals.dcioName,
  projectManager: proposals.projectManager,
  requestedBudgetTotal: proposals.requestedBudgetTotal,
  estimatedCostTotal: proposals.estimatedCostTotal,
  submittedAt: proposals.submittedAt,
  background: proposals.background,
  objective: proposals.objective,
  target: proposals.target,
  scope: proposals.scope,
  projectType: proposals.projectType,
  currentSystemStatus: proposals.currentSystemStatus,
  currentProblems: proposals.currentProblems,
  isBmaPlan: proposals.isBmaPlan,
  isAgencyPlan: proposals.isAgencyPlan,
  agencyStrategy: proposals.agencyStrategy,
  agencyIssue: proposals.agencyIssue,
  agencyKpi: proposals.agencyKpi,
  isGovernorPolicy: proposals.isGovernorPolicy,
  governorPolicyCode: proposals.governorPolicyCode,
  governorPolicyName: proposals.governorPolicyName,
  obstacleLaws: proposals.obstacleLaws,
  appArchitecture: proposals.appArchitecture,
  dataOwner: proposals.dataOwner,
  dataExchangePlan: proposals.dataExchangePlan,
  isReady: proposals.isReady,
  readinessDetails: proposals.readinessDetails,
  durationDays: proposals.durationDays,
  otherReadiness: proposals.otherReadiness,
  expectedBenefits: proposals.expectedBenefits,
  isInRoadmap: proposals.isInRoadmap,
} as const;

const hasOwn = (payload: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(payload, key);

const SUBMIT_PROPOSAL_FIELD_NAMES = new Set(Object.keys(submitProposalSchema.shape));

function sanitizeDraftFormData(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => SUBMIT_PROPOSAL_FIELD_NAMES.has(key)),
  );
}

export const proposalService = {

  // ============================================================================
  // 1. ระบบแบบร่าง (DRAFTS)
  // ============================================================================

  async initializeDraft(projectId: string, actor: ProposalActor) {
    await assertUserExists(actorId(actor));
    await assertOwnerOrDepartmentCanEditProject(projectId, actor);
    const userId = actorId(actor);

    const existing = await db.query.proposalDrafts.findFirst({
      where: eq(proposalDrafts.projectId, projectId)
    });
    if (existing) return existing;

    const [newDraft] = await db.insert(proposalDrafts).values({
      id: uuidv7(),
      projectId,
      userId,
      currentStep: 1,
      draftPayload: {},
    }).returning();

    return newDraft;
  },

  async getDraftByProjectId(projectId: string, user: UserContext) {
    checkPermission(user, "read", "proposal_form");
    await getProposalProjectAccess(projectId, user);
    return await db.query.proposalDrafts.findFirst({
      where: eq(proposalDrafts.projectId, projectId)
    });
  },

  async getMyDrafts(userId: string) {
    return await db.query.proposalDrafts.findMany({
      where: eq(proposalDrafts.userId, userId),
      orderBy: (drafts, { desc }) => [desc(drafts.updatedAt)],
    });
  },

  // บันทึกแบบร่างอัตโนมัติ (Upsert) -> ถ้าไม่มีให้ Insert, ถ้ามีให้ Update
  async upsertDraft(projectId: string, actor: ProposalActor, payload: any) {
    await assertUserExists(actorId(actor));
    await assertOwnerOrDepartmentCanEditProject(projectId, actor);
    const userId = actorId(actor);

    const existingDraft = await db.query.proposalDrafts.findFirst({
      where: eq(proposalDrafts.projectId, projectId),
    });
    const existingFormData = sanitizeDraftFormData(existingDraft?.draftPayload);
    const incomingFormData = payload.draftPayload || payload;
    const formData = {
      ...existingFormData,
      ...sanitizeDraftFormData(incomingFormData),
    };
    // Deprecated budget aliases are response-only compatibility fields. Never
    // persist them in the editable draft payload or accept them as write input.
    delete formData.totalBudget;
    delete formData.latestApprovedBudget;
    const summaryData = {
      projectName: payload.projectName !== undefined
        ? payload.projectName || null
        : existingDraft?.projectName ?? null,
      objective: payload.objective !== undefined
        ? payload.objective || null
        : existingDraft?.objective ?? null,
      requestedBudgetTotal: existingDraft?.requestedBudgetTotal ?? null,
      estimatedCostTotal: existingDraft?.estimatedCostTotal ?? null,
      currentStep: payload.currentStep !== undefined
        ? payload.currentStep || 1
        : existingDraft?.currentStep ?? 1,
      draftPayload: formData,
      updatedAt: new Date(),
      updatedBy: userId,
    };

    // ใช้ Upsert ประหยัด Query และกันชน
    const budgetRows = formData.budgetsByYear ?? formData.budgets;
    const hasBudgetRows = Array.isArray(budgetRows);
    const requestedBudgetTotal = hasBudgetRows
      ? sumProposalBudgets(budgetRows)
      : summaryData.requestedBudgetTotal;
    const estimatedCostTotal = calculateEstimatedCostTotal(formData);
    summaryData.requestedBudgetTotal = requestedBudgetTotal;
    summaryData.estimatedCostTotal = estimatedCostTotal;

    return await db.transaction(async (tx) => {
      const [upsertedDraft] = await tx.insert(proposalDrafts).values({
      id: uuidv7(),
      projectId,
      userId,
      ...summaryData,
      }).onConflictDoUpdate({
      target: proposalDrafts.projectId,
      set: summaryData
      }).returning();

      const projectUpdate: Record<string, unknown> = {
        updatedBy: userId,
        updatedAt: new Date(),
      };
      if (typeof formData.projectName === "string" && formData.projectName.trim()) {
        projectUpdate.projectName = formData.projectName.trim();
      }
      if (hasBudgetRows) projectUpdate.latestRequestedBudget = requestedBudgetTotal;
      projectUpdate.latestEstimatedCost = estimatedCostTotal;
      await tx.update(projects).set(projectUpdate as any).where(and(
        eq(projects.id, projectId),
        isNull(projects.deletedAt),
      ));

      return upsertedDraft;
    });
  },

  // ============================================================================
  // 2. ระบบข้อเสนอโครงการตัวจริง (PROPOSALS)
  // ============================================================================

  async getProposalByProjectId(projectId: string, user: UserContext) {
    checkPermission(user, "read", "proposal_form");
    await getProposalProjectAccess(projectId, user);
    try {
      const proposal = await db.query.proposals.findFirst({
        where: and(eq(proposals.projectId, projectId), eq(proposals.status, "submitted")),
        orderBy: (proposal, { desc }) => [desc(proposal.submittedAt), desc(proposal.updatedAt), desc(proposal.id)],
        with: {
          budgets: true,
          relatedProjects: true,
          manpower: true,
          existingEquipments: true,
          hardwareCosts: true,
          softwareCosts: true,
          personnelCosts: true,
          personnelResponsibilities: true,
          trainings: { with: { speakerCosts: true, foodCosts: true } },
          otherCosts: true,
          ictPersonnel: true,
          cloudRequests: { with: { vms: true } },
        }
      });

      if (process.env.NODE_ENV !== "production" && proposal) {
        console.debug("[proposals] nested collections loaded", {
          proposalId: proposal.id,
          collections: {
            budgets: proposal.budgets.length,
            relatedProjects: proposal.relatedProjects.length,
            manpower: proposal.manpower.length,
            existingEquipments: proposal.existingEquipments.length,
            hardwareCosts: proposal.hardwareCosts.length,
            softwareCosts: proposal.softwareCosts.length,
            personnelCosts: proposal.personnelCosts.length,
            personnelResponsibilities: proposal.personnelResponsibilities.length,
            trainings: proposal.trainings.length,
            otherCosts: proposal.otherCosts.length,
            ictPersonnel: proposal.ictPersonnel.length,
            cloudRequests: proposal.cloudRequests.length,
          },
        });
      }

      return proposal
        ? { ...proposal, totalBudget: proposal.requestedBudgetTotal }
        : proposal;
    } catch (error) {
      console.error("❌ Error in getProposalByProjectId:", error);
      throw error;
    }
  },

  async patchSubmittedProposal(
    projectId: string,
    user: UserContext,
    payload: Record<string, any>,
  ) {
    throw new HTTPException(409, {
      message: "Submitted Proposal versions are immutable; edit the current Draft instead",
    });
    const { project, roles } = await getProposalProjectAccess(projectId, user);
    const isSecretary = roles.includes("secretary");
    const isAssignedAnalyst = roles.includes("analyst") && project.analystId === user.userId;
    if (!isSecretary && !isAssignedAnalyst) {
      throw new HTTPException(403, {
        message: "Only a Secretary or the assigned Analyst can update submitted proposals",
      });
    }
    if (isAssignedAnalyst && project.statusId !== PROJECT_STATUS.IN_ANALYSIS) {
      throw new HTTPException(403, {
        message: "Analysts may update submitted proposals only while the project is in analysis",
      });
    }
    if (hasOwn(payload, "projectName")) {
      throw new HTTPException(403, {
        message: "Project name can only be changed by the project owner during an editable stage",
      });
    }
    checkPermission(user, "update", "proposal_form");

    const [existing] = await db
      .select({ id: proposals.id, projectId: proposals.projectId })
      .from(proposals)
      .where(and(eq(proposals.projectId, projectId), eq(proposals.status, "submitted")))
      .orderBy(desc(proposals.updatedAt), desc(proposals.id))
      .limit(1);

    if (!existing) {
      throw new HTTPException(404, { message: "Submitted proposal not found" });
    }

    await db.transaction(async (tx) => {
      const scalarUpdates: Record<string, unknown> = {};

      for (const [field, column] of Object.entries(submittedProposalScalarColumns)) {
        if (!hasOwn(payload, field) || payload[field] === undefined) continue;
        scalarUpdates[column.name] = field === "requestedBudgetTotal" && payload[field] !== null
          ? String(payload[field])
          : payload[field];
      }

      if (Object.keys(scalarUpdates).length > 0) {
        await tx
          .update(proposals)
          .set({
            ...(scalarUpdates as any),
            updatedBy: user.userId,
            updatedAt: new Date(),
          })
          .where(eq(proposals.id, existing.id));
      }

      await syncProposalCollections(tx, existing.id, payload);

      const budgetRows = hasOwn(payload, "budgetsByYear")
        ? payload.budgetsByYear
        : hasOwn(payload, "budgets")
          ? payload.budgets
          : await tx.select().from(proposalBudgets).where(eq(proposalBudgets.proposalId, existing.id));
      await tx.update(projects).set({
        latestRequestedBudget: sumProposalBudgets(Array.isArray(budgetRows) ? budgetRows : []),
        updatedBy: user.userId,
        updatedAt: new Date(),
      }).where(and(eq(projects.id, projectId), isNull(projects.deletedAt)));
    });

    return await this.getProposalByProjectId(projectId, user);
  },

  async submitProposal(user: UserContext, data: any) {
    await assertUserExists(user.userId);

    if (isSecretaryOnlyUser(user)) {
      throw new HTTPException(403, {
        message: "Secretary-only users cannot submit projects as the project owner",
      });
    }

    const parsedPayload = submitProposalSchema.safeParse(data);
    if (!parsedPayload.success) {
      throw new HTTPException(400, {
        message: `Invalid proposal payload: ${parsedPayload.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`).join(", ")}`,
      });
    }
    const projectId = typeof data.projectId === "string" ? data.projectId : "";
    if (!projectId) throw new HTTPException(400, { message: "Project ID is required" });
    // Use the parsed/defaulted payload for both the root row and every child collection.
    data = { ...parsedPayload.data, projectId };

    return await db.transaction(async (tx) => {
      const [lockedProject] = await tx
        .select({
          id: projects.id,
          ownerId: projects.userId,
          statusId: projects.projectStatusId,
          analystId: projects.analystId,
          returnStage: projects.returnStage,
          departmentId: divisions.departmentId,
        })
        .from(projects)
        .innerJoin(divisions, eq(divisions.divisionId, projects.divisionId))
        .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
        .for("update")
        .limit(1);

      if (!lockedProject) throw new HTTPException(404, { message: "Project not found" });
      if (lockedProject.ownerId !== user.userId && !isSameDepartmentUser(user, lockedProject.departmentId)) {
        throw new HTTPException(403, { message: "Only the project owner can edit this proposal" });
      }
      if (!OWNER_EDITABLE_STATUS_IDS.includes(lockedProject.statusId as typeof OWNER_EDITABLE_STATUS_IDS[number])) {
        throw new HTTPException(409, { message: "This project is currently outside the owner's editing stage" });
      }

      const targetStatus = lockedProject.statusId === PROJECT_STATUS.DRAFT || lockedProject.statusId === PROJECT_STATUS.RETURNED_SECRETARY
        ? PROJECT_STATUS.PENDING_SECRETARY
        : PROJECT_STATUS.IN_ANALYSIS;
      const budgetRows = data.budgetsByYear;
      if (!Array.isArray(budgetRows) || budgetRows.length === 0) {
        throw new HTTPException(400, { message: "At least one requested-budget row is required" });
      }
      // Keep the exact decimal representation used by the budget utility for
      // the proposal root, project summary, and every nested persistence path.
      // Passing the returned string through Number.isFinite previously turned
      // a valid decimal total into null during resubmission.
      const budgetTotal = sumProposalBudgets(
        budgetRows,
      );
      const estimatedCostTotal = calculateEstimatedCostTotal(data);
      const submittedAt = new Date();

      // 1. จัดการตารางแม่ (Proposals) ด้วย Upsert -> ตัดปัญหา Race Condition 
      const mainProposalData = {
        userId: user.userId,
        status: "submitted" as const,
        projectName: data.projectName,
        agencyName: data.agencyName,
        headOfAgency: data.headOfAgency,
        dcioName: data.dcioName,
        projectManager: data.projectManager,
        requestedBudgetTotal: budgetTotal,
        estimatedCostTotal,
        submittedAt,
        background: data.background,
        objective: data.objective,
        target: data.target,
        scope: data.scope,
        projectType: data.projectType,
        currentSystemStatus: data.currentSystemStatus,
        currentProblems: data.currentProblems,
        isBmaPlan: data.isBmaPlan,
        isAgencyPlan: data.isAgencyPlan,
        agencyStrategy: data.agencyStrategy,
        agencyIssue: data.agencyIssue,
        agencyKpi: data.agencyKpi,
        isGovernorPolicy: data.isGovernorPolicy,
        governorPolicyCode: data.governorPolicyCode,
        governorPolicyName: data.governorPolicyName,
        obstacleLaws: data.obstacleLaws,
        appArchitecture: data.appArchitecture,
        dataOwner: data.dataOwner,
        dataExchangePlan: data.dataExchangePlan,
        isReady: data.isReady,
        readinessDetails: data.readinessDetails,
        durationDays: data.durationDays,
        otherReadiness: data.otherReadiness,
        expectedBenefits: data.expectedBenefits,
        isInRoadmap: data.isInRoadmap,
        updatedAt: new Date(),
        updatedBy: user.userId,
      };

      const [upsertedProposal] = await tx.insert(proposals).values({
        id: uuidv7(),
        projectId: data.projectId,
        ...mainProposalData
      }).returning({ id: proposals.id });

      const proposalId = upsertedProposal.id;

      // เตรียมรวม Personnel Costs 3 ประเภทยัดตารางเดียว


      // ============================================================================
      // 2. จัดการตารางลูกระดับที่ 1 (ยิงขนานกันด้วย Promise.all)
      // ============================================================================


      // ============================================================================
      // 3. 🚀 จัดการตารางลูก 2 ชั้น (Trainings -> Speaker/Food) (Concurrent ระดับ Array)
      // ============================================================================
        // ยิง Sync หลาน (Speaker & Food) พร้อมกัน


      // ============================================================================
      // 4. 🚀 จัดการตารางลูก 2 ชั้น (Cloud Requests -> VMs) (Concurrent ระดับ Array)
      // ============================================================================


      await syncProposalCollections(tx, proposalId, {
        ...data,
        requestedBudgetTotal: budgetTotal,
        estimatedCostTotal,
        budgetsByYear: data.budgetsByYear ?? data.budgets ?? [],
      });

      await tx.update(projects).set({
        projectName: data.projectName,
        latestRequestedBudget: String(budgetTotal),
        latestEstimatedCost: estimatedCostTotal,
        initialRequestedBudget: sql`coalesce(${projects.initialRequestedBudget}, ${budgetTotal})`,
        initialEstimatedCost: sql`coalesce(${projects.initialEstimatedCost}, ${estimatedCostTotal})`,
        updatedBy: user.userId,
        updatedAt: new Date(),
      }).where(and(
        eq(projects.id, data.projectId),
        isNull(projects.deletedAt),
      ));

      await applyProjectStatusTransition(tx, {
        projectId: data.projectId,
        userId: user.userId,
        oldStatusId: lockedProject.statusId,
        newStatusId: targetStatus,
      });

      // ============================================================================
      // 5. ปิดท้าย: ลบ Draft ออกเมื่อ Submit ข้อมูลจริงเรียบร้อยแล้ว
      // ============================================================================
      await tx.delete(proposalDrafts).where(eq(proposalDrafts.projectId, data.projectId));

      return { id: proposalId };
    });
  },

  async deleteStaleDrafts(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    return await db.delete(proposalDrafts).where(lt(proposalDrafts.updatedAt, cutoffDate));
  }
};
