import { proposalFormSchema } from "../types";

type JsonRecord = Record<string, unknown>;

const PROJECT_TYPE_LABELS: Record<string, string> = {
  "จัดหาใหม่": "NEW",
  "ทดแทนระบบเดิม": "REPLACEMENT",
  "โครงการต่อเนื่อง": "CONTINUOUS",
};

const LOCATION_TYPE_LABELS: Record<string, string> = {
  "สถานที่ราชการ": "GOVERNMENT",
  "สถานที่เอกชน": "PRIVATE",
};

const FOOD_TYPE_LABELS: Record<string, string> = {
  "ค่าอาหาร (ไม่ครบมื้อ)": "PARTIAL_MEAL",
  "ค่าอาหารและเครื่องดื่ม": "FULL_MEAL",
  "ค่าอาหารว่าง": "SNACK",
};

const FOOD_DEFAULTS = [
  { itemName: "PARTIAL_MEAL", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
  { itemName: "FULL_MEAL", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
  { itemName: "SNACK", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
];

const UI_ONLY_FIELDS = [
  "systemDiagramFile",
  "networkDiagramFile",
  "useCaseDiagramFile",
  "securityDiagramFile",
  "systemDiagramUrl",
  "networkDiagramUrl",
  "useCaseDiagramUrl",
  "securityDiagramUrl",
] as const;

// The submitted-proposal API response contains persistence metadata and
// response-shaped collection names in addition to the editable form values.
// Keep one explicit allow-list so those fields can never leak into React Hook
// Form state, draft autosaves, or the strict submit payload.
const FORM_FIELD_KEYS = [
  "projectName",
  "agencyName",
  "headOfAgency",
  "dcioName",
  "projectManager",
  "totalBudget",
  "budgetsByYear",
  "background",
  "objective",
  "target",
  "scope",
  "projectType",
  "currentSystemStatus",
  "currentProblems",
  "relatedProjects",
  "manpower",
  "existingEquipment",
  "isBmaPlan",
  "isAgencyPlan",
  "agencyStrategy",
  "agencyIssue",
  "agencyKpi",
  "isGovernorPolicy",
  "governorPolicyCode",
  "governorPolicyName",
  "obstacleLaws",
  "appArchitecture",
  "dataOwner",
  "dataExchangePlan",
  "systemDiagramFile",
  "networkDiagramFile",
  "useCaseDiagramFile",
  "securityDiagramFile",
  "systemDiagramUrl",
  "networkDiagramUrl",
  "useCaseDiagramUrl",
  "securityDiagramUrl",
  "hardwareCosts",
  "softwareCosts",
  "personnelCoreCosts",
  "personnelAsstCosts",
  "personnelSuppCosts",
  "personnelResponsibilities",
  "trainingCourses",
  "otherCosts",
  "durationDays",
  "ictPersonnel",
  "cloudRequests",
  "isReady",
  "readinessDetails",
  "otherReadiness",
  "expectedBenefits",
  "isInRoadmap",
] as const;

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function rows(value: unknown): JsonRecord[] {
  return Array.isArray(value) ? value.map(record) : [];
}

function numberValue(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringValue(value: unknown, fallback = "") {
  return value === null || value === undefined ? fallback : String(value);
}

function booleanValue(value: unknown, fallback = false) {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "no"].includes(normalized)) return false;
    if (["true", "1", "yes"].includes(normalized)) return true;
  }
  return Boolean(value);
}

export function toDateOnly(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") {
    const match = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (match) return match[0];
  }
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function mapBudget(row: JsonRecord) {
  return {
    year: numberValue(row.year),
    amount: numberValue(row.amount),
    budgetType: stringValue(row.budgetType),
  };
}

function mapRelatedProject(row: JsonRecord) {
  return {
    projectName: stringValue(row.projectName),
    agency: stringValue(row.agency),
    fiscalYear: stringValue(row.fiscalYear),
    relationType: stringValue(row.relationType),
    remark: stringValue(row.remark),
  };
}

function mapManpower(row: JsonRecord) {
  return {
    agencyPart: stringValue(row.agencyPart),
    positionLimit: numberValue(row.positionLimit),
    occupied: numberValue(row.occupied),
    vacant: numberValue(row.vacant),
  };
}

function mapEquipment(row: JsonRecord) {
  return {
    itemName: stringValue(row.itemName),
    ageYears: numberValue(row.ageYears),
    quantity: numberValue(row.quantity),
    user: stringValue(row.user),
    location: stringValue(row.location),
    remark: stringValue(row.remark),
  };
}

function mapCost(row: JsonRecord) {
  return {
    itemName: stringValue(row.itemName),
    quantity: numberValue(row.quantity),
    unitPrice: numberValue(row.unitPrice),
    referenceType: stringValue(row.referenceType, "OTHER"),
    mdesMonth: stringValue(row.mdesMonth),
    mdesYear: stringValue(row.mdesYear),
    mdesItemNo: stringValue(row.mdesItemNo),
    marketCount: numberValue(row.marketCount),
    marketCompany: stringValue(row.marketCompany),
    prevProject: stringValue(row.prevProject),
    prevYear: stringValue(row.prevYear),
    otherDetail: stringValue(row.otherDetail),
  };
}

function mapPersonnel(row: JsonRecord) {
  return {
    position: stringValue(row.position),
    degree: stringValue(row.degree),
    fieldOfStudy: stringValue(row.fieldOfStudy),
    experienceYears: numberValue(row.experienceYears),
    baseSalary: numberValue(row.baseSalary),
    multiplier: numberValue(row.multiplier, 1),
    personCount: numberValue(row.personCount),
    durationMonths: numberValue(row.durationMonths),
  };
}

function mapFood(row: JsonRecord) {
  const itemName = stringValue(row.itemName, "OTHER");
  return {
    itemName: FOOD_TYPE_LABELS[itemName] ?? itemName,
    mealsCount: numberValue(row.mealsCount),
    ratePerMeal: numberValue(row.ratePerMeal),
    traineesCount: numberValue(row.traineesCount),
    days: numberValue(row.days),
  };
}

function normalizeFoodRows(input: unknown) {
  const mapped = rows(input).map(mapFood);
  const byType = new Map(mapped.map((row) => [row.itemName, row]));
  const standardRows = FOOD_DEFAULTS.map((fallback) => byType.get(fallback.itemName) ?? fallback);
  const extraRows = mapped.filter(
    (row) => !FOOD_DEFAULTS.some((fallback) => fallback.itemName === row.itemName),
  );
  return [...standardRows, ...extraRows];
}

export function normalizeProposalForForm(source: unknown): JsonRecord {
  const input = record(source);
  const nestedDraft = record(input.draftPayload);
  const value = Object.keys(nestedDraft).length > 0 ? nestedDraft : input;
  const personnelRows = rows(value.personnelCosts);
  const trainingRows = rows(value.trainingCourses ?? value.trainings);
  const existingEquipments = value.existingEquipment ?? value.existingEquipments;

  const normalized: JsonRecord = {
    projectName: stringValue(value.projectName),
    agencyName: stringValue(value.agencyName),
    headOfAgency: stringValue(value.headOfAgency),
    dcioName: stringValue(value.dcioName),
    projectManager: stringValue(value.projectManager),
    // totalBudget remains a UI-only derived field. The API source is the
    // canonical requestedBudgetTotal snapshot (or the legacy response alias
    // during the compatibility window).
    totalBudget: numberValue(value.requestedBudgetTotal ?? value.totalBudget),
    budgetsByYear: rows(value.budgetsByYear ?? value.budgets).map(mapBudget),

    background: stringValue(value.background),
    objective: stringValue(value.objective),
    target: stringValue(value.target),
    scope: stringValue(value.scope),
    projectType: PROJECT_TYPE_LABELS[stringValue(value.projectType)] ?? stringValue(value.projectType, "NEW"),
    currentSystemStatus: stringValue(value.currentSystemStatus),
    currentProblems: stringValue(value.currentProblems),
    relatedProjects: rows(value.relatedProjects).map(mapRelatedProject),
    manpower: rows(value.manpower).map(mapManpower),
    existingEquipment: rows(existingEquipments).map(mapEquipment),

    isBmaPlan: booleanValue(value.isBmaPlan),
    isAgencyPlan: booleanValue(value.isAgencyPlan),
    agencyStrategy: stringValue(value.agencyStrategy),
    agencyIssue: stringValue(value.agencyIssue),
    agencyKpi: stringValue(value.agencyKpi),
    isGovernorPolicy: booleanValue(value.isGovernorPolicy),
    governorPolicyCode: stringValue(value.governorPolicyCode),
    governorPolicyName: stringValue(value.governorPolicyName),
    obstacleLaws: stringValue(value.obstacleLaws),
    appArchitecture: stringValue(value.appArchitecture),
    dataOwner: stringValue(value.dataOwner),
    dataExchangePlan: stringValue(value.dataExchangePlan),

    hardwareCosts: rows(value.hardwareCosts).map(mapCost),
    softwareCosts: rows(value.softwareCosts).map(mapCost),
    personnelCoreCosts: rows(value.personnelCoreCosts).length > 0
      ? rows(value.personnelCoreCosts).map(mapPersonnel)
      : personnelRows.filter((row) => row.personnelType === "CORE").map(mapPersonnel),
    personnelAsstCosts: rows(value.personnelAsstCosts).length > 0
      ? rows(value.personnelAsstCosts).map(mapPersonnel)
      : personnelRows.filter((row) => row.personnelType === "ASST").map(mapPersonnel),
    personnelSuppCosts: rows(value.personnelSuppCosts).length > 0
      ? rows(value.personnelSuppCosts).map(mapPersonnel)
      : personnelRows.filter((row) => row.personnelType === "SUPP").map(mapPersonnel),
    personnelResponsibilities: rows(value.personnelResponsibilities).map((row) => ({
      position: stringValue(row.position),
      responsibility: stringValue(row.responsibility),
    })),
    trainingCourses: trainingRows.map((course) => ({
      courseName: stringValue(course.courseName),
      trainingMethod: stringValue(course.trainingMethod),
      locationType: LOCATION_TYPE_LABELS[stringValue(course.locationType)] ?? stringValue(course.locationType, "GOVERNMENT"),
      hasSpeakerCost: booleanValue(course.hasSpeakerCost),
      speakerReason: stringValue(course.speakerReason),
      speakerCosts: rows(course.speakerCosts).map((row) => ({
        itemName: stringValue(row.itemName),
        hours: numberValue(row.hours),
        ratePerHour: numberValue(row.ratePerHour),
        days: numberValue(row.days),
      })),
      foodCosts: normalizeFoodRows(course.foodCosts),
    })),
    otherCosts: rows(value.otherCosts).map((row) => ({
      itemName: stringValue(row.itemName),
      quantity: numberValue(row.quantity),
      unitPrice: numberValue(row.unitPrice),
      remark: stringValue(row.remark),
      costType: stringValue(row.costType, "IT"),
    })),

    isReady: booleanValue(value.isReady),
    readinessDetails: stringValue(value.readinessDetails),
    durationDays: numberValue(value.durationDays),
    ictPersonnel: rows(value.ictPersonnel).map((row) => ({
      position: stringValue(row.position),
      level: stringValue(row.level),
      count: numberValue(row.count),
    })),
    cloudRequests: rows(value.cloudRequests).map((request) => ({
      systemName: stringValue(request.systemName),
      requestedServiceDate: toDateOnly(request.requestedServiceDate),
      recordedRequestDate: toDateOnly(request.recordedRequestDate),
      vms: rows(request.vms).map((vm) => ({
        vmDescription: stringValue(vm.vmDescription),
        osDatabase: stringValue(vm.osDatabase),
        vcpu: numberValue(vm.vcpu),
        ramGb: numberValue(vm.ramGb),
        gpuGb: numberValue(vm.gpuGb),
        storageGb: numberValue(vm.storageGb),
        price: numberValue(vm.price),
      })),
    })),
    otherReadiness: stringValue(value.otherReadiness),
    expectedBenefits: stringValue(value.expectedBenefits),
    isInRoadmap: booleanValue(value.isInRoadmap),
  };

  for (const field of UI_ONLY_FIELDS) {
    if (field in value) normalized[field] = value[field];
  }

  return Object.fromEntries(
    FORM_FIELD_KEYS.flatMap((key) => key in normalized ? [[key, normalized[key]]] : []),
  );
}

function stripMetadata(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripMetadata);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as JsonRecord).flatMap(([key, child]) => {
      if (["id", "proposalId", "trainingId", "cloudRequestId"].includes(key)) return [];
      return [[key, stripMetadata(child)]];
    }),
  );
}

export const proposalSubmitPayloadSchema = proposalFormSchema.omit({
  totalBudget: true,
  systemDiagramFile: true,
  networkDiagramFile: true,
  useCaseDiagramFile: true,
  securityDiagramFile: true,
  systemDiagramUrl: true,
  networkDiagramUrl: true,
  useCaseDiagramUrl: true,
  securityDiagramUrl: true,
});

export function toProposalSubmitPayload(source: Record<string, unknown>) {
  const normalized = normalizeProposalForForm(source);
  delete normalized.totalBudget;
  for (const field of UI_ONLY_FIELDS) delete normalized[field];
  return stripMetadata(normalized) as Record<string, unknown>;
}

export function normalizeProposalPatchPayload(source: Record<string, unknown>) {
  const input = record(source);
  const normalized = normalizeProposalForForm(source);
  const aliases: Record<string, string> = {
    budgets: "budgetsByYear",
    existingEquipments: "existingEquipment",
    trainings: "trainingCourses",
  };
  const result: JsonRecord = {};

  for (const key of Object.keys(input)) {
    if (UI_ONLY_FIELDS.includes(key as typeof UI_ONLY_FIELDS[number])) continue;
    if (key === "totalBudget" || key === "latestApprovedBudget") continue;
    const canonicalKey = aliases[key] ?? key;
    if (!(FORM_FIELD_KEYS as readonly string[]).includes(canonicalKey)) continue;
    result[canonicalKey] = canonicalKey in normalized
      ? normalized[canonicalKey]
      : input[key];
  }

  return stripMetadata(result) as Record<string, unknown>;
}
