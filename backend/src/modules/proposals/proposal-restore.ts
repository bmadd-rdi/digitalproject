type ProposalRow = Record<string, any>;
import { sumProposalBudgets } from "./proposal-budget.util";

const FOOD_DEFAULTS = [
  { itemName: "PARTIAL_MEAL", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
  { itemName: "FULL_MEAL", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
  { itemName: "SNACK", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
];

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

function canonicalLabel(value: unknown, labels: Record<string, string>, fallback: string) {
  const text = stringValue(value, fallback);
  return labels[text] ?? text;
}

function dateOnlyValue(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") {
    const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (dateOnly) return dateOnly;
  }
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function mapBudget(row: ProposalRow) {
  return {
    year: numberValue(row.year),
    amount: numberValue(row.amount),
    budgetType: stringValue(row.budgetType),
  };
}

function mapRelatedProject(row: ProposalRow) {
  return {
    projectName: stringValue(row.projectName),
    agency: stringValue(row.agency),
    fiscalYear: stringValue(row.fiscalYear),
    relationType: stringValue(row.relationType),
    remark: stringValue(row.remark),
  };
}

function mapManpower(row: ProposalRow) {
  return {
    agencyPart: stringValue(row.agencyPart),
    positionLimit: numberValue(row.positionLimit),
    occupied: numberValue(row.occupied),
    vacant: numberValue(row.vacant),
  };
}

function mapExistingEquipment(row: ProposalRow) {
  return {
    itemName: stringValue(row.itemName),
    ageYears: numberValue(row.ageYears),
    quantity: numberValue(row.quantity),
    user: stringValue(row.user),
    location: stringValue(row.location),
    remark: stringValue(row.remark),
  };
}

function mapCost(row: ProposalRow) {
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

function mapPersonnel(row: ProposalRow) {
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

function mapSpeakerCost(row: ProposalRow) {
  return {
    itemName: stringValue(row.itemName),
    hours: numberValue(row.hours),
    ratePerHour: numberValue(row.ratePerHour),
    days: numberValue(row.days),
  };
}

function mapFoodCost(row: ProposalRow) {
  return {
    itemName: canonicalLabel(row.itemName, FOOD_TYPE_LABELS, "OTHER"),
    mealsCount: numberValue(row.mealsCount),
    ratePerMeal: numberValue(row.ratePerMeal),
    traineesCount: numberValue(row.traineesCount),
    days: numberValue(row.days),
  };
}

function normalizeFoodCosts(rows: ProposalRow[]) {
  const mapped = rows.map(mapFoodCost);
  const byType = new Map(mapped.map((row) => [row.itemName, row]));
  const standardRows = FOOD_DEFAULTS.map((fallback) => byType.get(fallback.itemName) ?? fallback);
  const extraRows = mapped.filter(
    (row) => !FOOD_DEFAULTS.some((fallback) => fallback.itemName === row.itemName),
  );
  return [...standardRows, ...extraRows];
}

function mapTraining(
  row: ProposalRow,
  speakerRows: ProposalRow[],
  foodRows: ProposalRow[],
) {
  return {
    courseName: stringValue(row.courseName),
    trainingMethod: stringValue(row.trainingMethod),
    locationType: canonicalLabel(row.locationType, LOCATION_TYPE_LABELS, "GOVERNMENT"),
    hasSpeakerCost: booleanValue(row.hasSpeakerCost),
    speakerReason: stringValue(row.speakerReason),
    speakerCosts: speakerRows
      .filter((item) => item.trainingId === row.id)
      .map(mapSpeakerCost),
    foodCosts: normalizeFoodCosts(
      foodRows.filter((item) => item.trainingId === row.id),
    ),
  };
}

function mapIctPersonnel(row: ProposalRow) {
  return {
    position: stringValue(row.position),
    level: stringValue(row.level),
    count: numberValue(row.count),
  };
}

function mapCloudVm(row: ProposalRow) {
  return {
    vmDescription: stringValue(row.vmDescription),
    osDatabase: stringValue(row.osDatabase),
    vcpu: numberValue(row.vcpu),
    ramGb: numberValue(row.ramGb),
    gpuGb: numberValue(row.gpuGb),
    storageGb: numberValue(row.storageGb),
    price: numberValue(row.price),
  };
}

export function mapSubmittedProposalToDraftPayload(input: {
  proposal: ProposalRow;
  budgets: ProposalRow[];
  relatedProjects: ProposalRow[];
  manpower: ProposalRow[];
  existingEquipments: ProposalRow[];
  hardwareCosts: ProposalRow[];
  softwareCosts: ProposalRow[];
  personnelCosts: ProposalRow[];
  personnelResponsibilities: ProposalRow[];
  trainings: ProposalRow[];
  trainingSpeakerCosts: ProposalRow[];
  trainingFoodCosts: ProposalRow[];
  otherCosts: ProposalRow[];
  ictPersonnel: ProposalRow[];
  cloudRequests: ProposalRow[];
  cloudVms: ProposalRow[];
}) {
  const { proposal } = input;
  const budgetsByYear = input.budgets.map(mapBudget);
  const calculatedBudget = budgetsByYear.length > 0
    ? Number(sumProposalBudgets(input.budgets))
    : numberValue(proposal.requestedBudgetTotal);

  return {
    projectName: stringValue(proposal.projectName),
    agencyName: stringValue(proposal.agencyName),
    headOfAgency: stringValue(proposal.headOfAgency),
    dcioName: stringValue(proposal.dcioName),
    projectManager: stringValue(proposal.projectManager),
    requestedBudgetTotal: calculatedBudget,
    estimatedCostTotal: numberValue(proposal.estimatedCostTotal),
    budgetsByYear,

    background: stringValue(proposal.background),
    objective: stringValue(proposal.objective),
    target: stringValue(proposal.target),
    scope: stringValue(proposal.scope),
    projectType: canonicalLabel(proposal.projectType, PROJECT_TYPE_LABELS, "NEW"),
    currentSystemStatus: stringValue(proposal.currentSystemStatus),
    currentProblems: stringValue(proposal.currentProblems),
    relatedProjects: input.relatedProjects.map(mapRelatedProject),
    manpower: input.manpower.map(mapManpower),
    existingEquipment: input.existingEquipments.map(mapExistingEquipment),

    isBmaPlan: booleanValue(proposal.isBmaPlan),
    isAgencyPlan: booleanValue(proposal.isAgencyPlan),
    agencyStrategy: stringValue(proposal.agencyStrategy),
    agencyIssue: stringValue(proposal.agencyIssue),
    agencyKpi: stringValue(proposal.agencyKpi),
    isGovernorPolicy: booleanValue(proposal.isGovernorPolicy),
    governorPolicyCode: stringValue(proposal.governorPolicyCode),
    governorPolicyName: stringValue(proposal.governorPolicyName),
    obstacleLaws: stringValue(proposal.obstacleLaws),
    appArchitecture: stringValue(proposal.appArchitecture),
    dataOwner: stringValue(proposal.dataOwner),
    dataExchangePlan: stringValue(proposal.dataExchangePlan),

    hardwareCosts: input.hardwareCosts.map(mapCost),
    softwareCosts: input.softwareCosts.map(mapCost),
    personnelCoreCosts: input.personnelCosts
      .filter((row) => row.personnelType === "CORE")
      .map(mapPersonnel),
    personnelAsstCosts: input.personnelCosts
      .filter((row) => row.personnelType === "ASST")
      .map(mapPersonnel),
    personnelSuppCosts: input.personnelCosts
      .filter((row) => row.personnelType === "SUPP")
      .map(mapPersonnel),
    personnelResponsibilities: input.personnelResponsibilities.map((row) => ({
      position: stringValue(row.position),
      responsibility: stringValue(row.responsibility),
    })),
    trainingCourses: input.trainings.map((training) =>
      mapTraining(training, input.trainingSpeakerCosts, input.trainingFoodCosts),
    ),
    otherCosts: input.otherCosts.map((row) => ({
      itemName: stringValue(row.itemName),
      quantity: numberValue(row.quantity),
      unitPrice: numberValue(row.unitPrice),
      remark: stringValue(row.remark),
      costType: stringValue(row.costType, "IT"),
    })),

    durationDays: numberValue(proposal.durationDays),
    ictPersonnel: input.ictPersonnel.map(mapIctPersonnel),
    cloudRequests: input.cloudRequests.map((request) => ({
      systemName: stringValue(request.systemName),
      requestedServiceDate: dateOnlyValue(request.requestedServiceDate),
      recordedRequestDate: dateOnlyValue(request.recordedRequestDate),
      vms: input.cloudVms
        .filter((vm) => vm.cloudRequestId === request.id)
        .map(mapCloudVm),
    })),
    isReady: booleanValue(proposal.isReady),
    readinessDetails: stringValue(proposal.readinessDetails),
    otherReadiness: stringValue(proposal.otherReadiness),
    expectedBenefits: stringValue(proposal.expectedBenefits),
    isInRoadmap: booleanValue(proposal.isInRoadmap),
  };
}
