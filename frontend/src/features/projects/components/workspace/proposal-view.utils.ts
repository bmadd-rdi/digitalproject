import { z } from "zod";
import { schemas } from "@/types/api-schemas";
import { formatFileSize } from "../../utils/fileValidation";

export type RawSubmittedProposal = z.infer<typeof schemas.ProposalResponse>;
export type ProposalRow = Record<string, unknown>;

export type NormalizedProposal = ProposalRow & {
  budgets: ProposalRow[];
  relatedProjects: ProposalRow[];
  manpower: ProposalRow[];
  existingEquipments: ProposalRow[];
  hardwareCosts: ProposalRow[];
  softwareCosts: ProposalRow[];
  personnelCoreCosts: ProposalRow[];
  personnelAsstCosts: ProposalRow[];
  personnelSuppCosts: ProposalRow[];
  personnelResponsibilities: ProposalRow[];
  trainingCourses: ProposalRow[];
  otherCosts: ProposalRow[];
  ictPersonnel: ProposalRow[];
  cloudRequests: ProposalRow[];
};

function asObject(value: unknown): ProposalRow {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as ProposalRow)
    : {};
}

function asRows(value: unknown): ProposalRow[] {
  return Array.isArray(value) ? value.map(asObject) : [];
}

function firstRows(source: ProposalRow, ...keys: string[]) {
  for (const key of keys) {
    const rows = asRows(source[key]);
    if (rows.length > 0) return rows;
  }
  return [];
}

export function normalizeSubmittedProposal(
  response: RawSubmittedProposal,
): NormalizedProposal {
  const source = asObject(response);
  const personnelCosts = asRows(source.personnelCosts);

  const personnelByType = (key: string, type: string) => {
    const explicit = asRows(source[key]);
    if (explicit.length > 0) return explicit;
    return personnelCosts.filter(
      (row) => String(row.personnelType ?? "").toUpperCase() === type,
    );
  };

  return {
    ...source,
    budgets: firstRows(source, "budgetsByYear", "budgets"),
    relatedProjects: asRows(source.relatedProjects),
    manpower: asRows(source.manpower),
    existingEquipments: firstRows(source, "existingEquipment", "existingEquipments"),
    hardwareCosts: asRows(source.hardwareCosts),
    softwareCosts: asRows(source.softwareCosts),
    personnelCoreCosts: personnelByType("personnelCoreCosts", "CORE"),
    personnelAsstCosts: personnelByType("personnelAsstCosts", "ASST"),
    personnelSuppCosts: personnelByType("personnelSuppCosts", "SUPP"),
    personnelResponsibilities: asRows(source.personnelResponsibilities),
    trainingCourses: firstRows(source, "trainingCourses", "trainings"),
    otherCosts: asRows(source.otherCosts),
    ictPersonnel: asRows(source.ictPersonnel),
    cloudRequests: asRows(source.cloudRequests),
  };
}

export function displayValue(value: unknown, fallback = "-") {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "boolean") return value ? "ใช่" : "ไม่ใช่";
  return String(value);
}

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatCurrency(value: unknown) {
  const amount = toNumber(value);
  if (amount === null) return "-";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: unknown) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatAttachmentSize(value: unknown) {
  return formatFileSize(toNumber(value));
}
