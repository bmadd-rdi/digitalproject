// src/db/schema/proposals.ts
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  numeric, 
  boolean, 
  timestamp, 
  uuid,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";

// ---------------------------------------------------------------------------
// ENUMS
// ---------------------------------------------------------------------------
export const projectTypeEnum = pgEnum("project_type", ["NEW", "REPLACEMENT", "CONTINUOUS"]);

// Workflow Status
export const proposalStatusEnum = pgEnum("proposal_status", [
  "draft", "submitted", "passed_1", "rejected_1", "fix_1", 
  "admin_assigned", "passed_2", "rejected_2", "fix_2", 
  "meeting_scheduled", "meeting_passed", "fix_3", "fix_4", "meeting_rejected"
]);

export const referenceTypeEnum = pgEnum("reference_type", ["MDES", "MARKET", "PREVIOUS", "OTHER"]);
export const personnelTypeEnum = pgEnum("personnel_type", ["CORE", "ASST", "SUPP"]);
export const locationTypeEnum = pgEnum("location_type", ["GOVERNMENT", "PRIVATE"]);
export const costTypeEnum = pgEnum("cost_type", ["IT", "NON_IT"]);
export const foodTypeEnum = pgEnum("food_type", ["PARTIAL_MEAL", "FULL_MEAL", "SNACK", "OTHER"]);

// ---------------------------------------------------------------------------
// MAIN TABLE: Proposal
// ---------------------------------------------------------------------------
export const proposals = pgTable("proposals", {
  id: uuid("id").primaryKey(),
  status: proposalStatusEnum("status").default("draft").notNull(),
  
  projectId: uuid("project_id").references(() => projects.id),
  userId: uuid("user_id").references(() => users.userId).notNull(),
  updatedBy: uuid("updated_by").references(() => users.userId),
  version: integer("version").default(1), 

  // --- Step 1: ข้อมูลเบื้องต้น ---
  projectName: text("project_name"),
  agencyName: varchar("agency_name", { length: 255 }),
  headOfAgency: varchar("head_of_agency", { length: 255 }),
  dcioName: varchar("dcio_name", { length: 255 }),
  projectManager: varchar("project_manager", { length: 255 }),
  requestedBudgetTotal: numeric("requested_budget_total", { precision: 15, scale: 2 }),
  estimatedCostTotal: numeric("estimated_cost_total", { precision: 15, scale: 2 }),
  submittedAt: timestamp("submitted_at"),

  // --- Step 2: สาระสำคัญและขอบเขตโครงการ ---
  background: text("background"),
  objective: text("objective"),
  target: text("target"),
  scope: text("scope"),
  projectType: projectTypeEnum("project_type"),
  currentSystemStatus: text("current_system_status"),
  currentProblems: text("current_problems"),

  // --- Step 3: สถาปัตยกรรมองค์กร ---
  isBmaPlan: boolean("is_bma_plan").default(false),
  isAgencyPlan: boolean("is_agency_plan").default(false),
  agencyStrategy: text("agency_strategy"),
  agencyIssue: text("agency_issue"),
  agencyKpi: text("agency_kpi"),

  isGovernorPolicy: boolean("is_governor_policy").default(false),
  governorPolicyCode: varchar("governor_policy_code", { length: 100 }),
  governorPolicyName: text("governor_policy_name"),

  obstacleLaws: text("obstacle_laws"),
  appArchitecture: text("app_architecture"),
  dataOwner: varchar("data_owner", { length: 255 }),
  dataExchangePlan: text("data_exchange_plan"),

  // --- Step 5: ความพร้อมของโครงการ ---
  isReady: boolean("is_ready").default(false),
  readinessDetails: text("readiness_details"),
  durationDays: integer("duration_days"),
  otherReadiness: text("other_readiness"),
  expectedBenefits: text("expected_benefits"),
  isInRoadmap: boolean("is_in_roadmap").default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  proposalVersionIdx: index("proposals_project_status_submitted_idx").on(table.projectId, table.status, table.submittedAt, table.id),
}));

// ---------------------------------------------------------------------------
// SUB TABLES (Child of Proposals)
// ---------------------------------------------------------------------------
export const proposalBudgets = pgTable("proposal_budgets", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  year: integer("year"), // varchar
  amount: numeric("amount", { precision: 15, scale: 2 }),
  budgetType: varchar("budget_type", { length: 255 }),
});

export const proposalRelatedProjects = pgTable("proposal_related_projects", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  projectName: text("project_name"),
  agency: varchar("agency", { length: 255 }),
  fiscalYear: varchar("fiscal_year", { length: 10 }),
  relationType: varchar("relation_type", { length: 255 }),
  remark: text("remark"),
});

export const proposalManpower = pgTable("proposal_manpower", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  agencyPart: varchar("agency_part", { length: 255 }),
  positionLimit: integer("position_limit"),
  occupied: integer("occupied"),
  vacant: integer("vacant"),
});

export const proposalExistingEquipments = pgTable("proposal_existing_equipments", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  itemName: varchar("item_name", { length: 255 }),
  ageYears: numeric("age_years", { precision: 5, scale: 2 }),
  quantity: integer("quantity"),
  user: varchar("user_name", { length: 255 }),
  location: text("location"),
  remark: text("remark"),
});

export const proposalHardwareCosts = pgTable("proposal_hardware_costs", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  itemName: text("item_name"),
  quantity: integer("quantity"),
  unitPrice: numeric("unit_price", { precision: 15, scale: 2 }),
  referenceType: referenceTypeEnum("reference_type"),
  mdesMonth: varchar("mdes_month", { length: 50 }),
  mdesYear: varchar("mdes_year", { length: 10 }),
  mdesItemNo: varchar("mdes_item_no", { length: 100 }),
  marketCount: integer("market_count"),
  marketCompany: text("market_company"),
  prevProject: text("prev_project"),
  prevYear: varchar("prev_year", { length: 10 }),
  otherDetail: text("other_detail"),
});

export const proposalSoftwareCosts = pgTable("proposal_software_costs", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  itemName: text("item_name"),
  quantity: integer("quantity"),
  unitPrice: numeric("unit_price", { precision: 15, scale: 2 }),
  referenceType: referenceTypeEnum("reference_type"),
  mdesMonth: varchar("mdes_month", { length: 50 }),
  mdesYear: varchar("mdes_year", { length: 10 }),
  mdesItemNo: varchar("mdes_item_no", { length: 100 }),
  marketCount: integer("market_count"),
  marketCompany: text("market_company"),
  prevProject: text("prev_project"),
  prevYear: varchar("prev_year", { length: 10 }),
  otherDetail: text("other_detail"),
});

export const proposalPersonnelCosts = pgTable("proposal_personnel_costs", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  personnelType: personnelTypeEnum("personnel_type").notNull(), 
  position: varchar("position", { length: 255 }),
  degree: varchar("degree", { length: 255 }),
  fieldOfStudy: varchar("field_of_study", { length: 255 }), 
  experienceYears: numeric("experience_years", { precision: 4, scale: 1 }),
  baseSalary: numeric("base_salary", { precision: 15, scale: 2 }),
  multiplier: numeric("multiplier", { precision: 5, scale: 2 }), 
  personCount: integer("person_count"),
  durationMonths: integer("duration_months"),
});

export const proposalPersonnelResponsibilities = pgTable("proposal_personnel_responsibilities", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  position: varchar("position", { length: 255 }),
  responsibility: text("responsibility"),
});

export const proposalOtherCosts = pgTable("proposal_other_costs", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  itemName: text("item_name"),
  quantity: integer("quantity"),
  unitPrice: numeric("unit_price", { precision: 15, scale: 2 }),
  remark: text("remark"),
  costType: costTypeEnum("cost_type"), 
});

export const proposalIctPersonnel = pgTable("proposal_ict_personnel", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  position: varchar("position", { length: 255 }),
  level: varchar("level", { length: 255 }),
  count: integer("count"),
});

// --- Trainings (Parent of Speaker & Food) ---
export const proposalTrainings = pgTable("proposal_trainings", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  courseName: text("course_name"),
  trainingMethod: varchar("training_method", { length: 255 }),
  locationType: locationTypeEnum("location_type"),
  hasSpeakerCost: boolean("has_speaker_cost").default(false),
  speakerReason: text("speaker_reason"),
});

export const proposalTrainingSpeakerCosts = pgTable("proposal_training_speaker_costs", {
  id: uuid("id").primaryKey(),
  trainingId: uuid("training_id").references(() => proposalTrainings.id, { onDelete: "cascade" }).notNull(),
  itemName: text("item_name").notNull(),
  hours: integer("hours").notNull(),
  ratePerHour: numeric("rate_per_hour", { precision: 10, scale: 2 }).notNull(),
  days: integer("days").notNull(),
});

export const proposalTrainingFoodCosts = pgTable("proposal_training_food_costs", {
  id: uuid("id").primaryKey(),
  trainingId: uuid("training_id").references(() => proposalTrainings.id, { onDelete: "cascade" }).notNull(),
  itemName: foodTypeEnum("item_name").notNull(),
  mealsCount: integer("meals_count").notNull(),
  ratePerMeal: numeric("rate_per_meal", { precision: 10, scale: 2 }).notNull(),
  traineesCount: integer("trainees_count").notNull(),
  days: integer("days").notNull(),
});

// --- Cloud Requests (Parent of VMs) ---
export const proposalCloudRequests = pgTable("proposal_cloud_requests", {
  id: uuid("id").primaryKey(),
  proposalId: uuid("proposal_id").references(() => proposals.id, { onDelete: "cascade" }).notNull(),
  systemName: text("system_name").notNull(),
  requestedServiceDate: timestamp("requested_service_date"),
  recordedRequestDate: timestamp("recorded_request_date"),
});

export const proposalCloudVms = pgTable("proposal_cloud_vms", {
  id: uuid("id").primaryKey(),
  cloudRequestId: uuid("cloud_request_id").references(() => proposalCloudRequests.id, { onDelete: "cascade" }).notNull(),
  vmDescription: text("vm_description").notNull(),
  osDatabase: varchar("os_database", { length: 255 }),
  vcpu: integer("vcpu").default(0),
  ramGb: integer("ram_gb").default(0),
  gpuGb: integer("gpu_gb").default(0),
  storageGb: integer("storage_gb").default(0),
  price: numeric("price", { precision: 15, scale: 2 }).default("0"),
});

// ---------------------------------------------------------------------------
// RELATIONS (Drizzle ORM)
// ---------------------------------------------------------------------------

// 1. Relations ของตารางหลัก (Proposals) ไปยังตารางลูก
export const proposalsRelations = relations(proposals, ({ many }) => ({
  budgets: many(proposalBudgets),
  relatedProjects: many(proposalRelatedProjects),
  manpower: many(proposalManpower),
  existingEquipments: many(proposalExistingEquipments),
  hardwareCosts: many(proposalHardwareCosts),
  softwareCosts: many(proposalSoftwareCosts),
  personnelCosts: many(proposalPersonnelCosts),
  personnelResponsibilities: many(proposalPersonnelResponsibilities),
  trainings: many(proposalTrainings),
  otherCosts: many(proposalOtherCosts),
  ictPersonnel: many(proposalIctPersonnel),
  cloudRequests: many(proposalCloudRequests),
}));

// 2. Relations ของตารางลูก ชี้กลับมาที่ตารางแม่ (Proposals)
export const proposalBudgetsRelations = relations(proposalBudgets, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalBudgets.proposalId], references: [proposals.id] }),
}));

export const proposalRelatedProjectsRelations = relations(proposalRelatedProjects, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalRelatedProjects.proposalId], references: [proposals.id] }),
}));

export const proposalManpowerRelations = relations(proposalManpower, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalManpower.proposalId], references: [proposals.id] }),
}));

export const proposalExistingEquipmentsRelations = relations(proposalExistingEquipments, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalExistingEquipments.proposalId], references: [proposals.id] }),
}));

export const proposalHardwareCostsRelations = relations(proposalHardwareCosts, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalHardwareCosts.proposalId], references: [proposals.id] }),
}));

export const proposalSoftwareCostsRelations = relations(proposalSoftwareCosts, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalSoftwareCosts.proposalId], references: [proposals.id] }),
}));

export const proposalPersonnelCostsRelations = relations(proposalPersonnelCosts, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalPersonnelCosts.proposalId], references: [proposals.id] }),
}));

export const proposalPersonnelResponsibilitiesRelations = relations(proposalPersonnelResponsibilities, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalPersonnelResponsibilities.proposalId], references: [proposals.id] }),
}));

export const proposalOtherCostsRelations = relations(proposalOtherCosts, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalOtherCosts.proposalId], references: [proposals.id] }),
}));

export const proposalIctPersonnelRelations = relations(proposalIctPersonnel, ({ one }) => ({
  proposal: one(proposals, { fields: [proposalIctPersonnel.proposalId], references: [proposals.id] }),
}));

// 3. Relations ของ Trainings (1 แม่ -> หลายลูก)
export const proposalTrainingsRelations = relations(proposalTrainings, ({ one, many }) => ({
  proposal: one(proposals, { fields: [proposalTrainings.proposalId], references: [proposals.id] }),
  speakerCosts: many(proposalTrainingSpeakerCosts),
  foodCosts: many(proposalTrainingFoodCosts),
}));

export const proposalTrainingSpeakerCostsRelations = relations(proposalTrainingSpeakerCosts, ({ one }) => ({
  training: one(proposalTrainings, { fields: [proposalTrainingSpeakerCosts.trainingId], references: [proposalTrainings.id] }),
}));

export const proposalTrainingFoodCostsRelations = relations(proposalTrainingFoodCosts, ({ one }) => ({
  training: one(proposalTrainings, { fields: [proposalTrainingFoodCosts.trainingId], references: [proposalTrainings.id] }),
}));

// 4. Relations ของ Cloud Requests (1 แม่ -> หลายลูก)
export const proposalCloudRequestsRelations = relations(proposalCloudRequests, ({ one, many }) => ({
  proposal: one(proposals, { fields: [proposalCloudRequests.proposalId], references: [proposals.id] }),
  vms: many(proposalCloudVms),
}));

export const proposalCloudVmsRelations = relations(proposalCloudVms, ({ one }) => ({
  cloudRequest: one(proposalCloudRequests, { fields: [proposalCloudVms.cloudRequestId], references: [proposalCloudRequests.id] }),
}));
