import { expect, test } from "bun:test";
import {
  normalizeProposalForForm,
  proposalSubmitPayloadSchema,
  toProposalSubmitPayload,
} from "./proposal-payload";

type TestPayload = Record<string, unknown> & {
  budgetsByYear: Array<Record<string, unknown>>;
  trainingCourses: Array<Record<string, unknown> & { foodCosts: Array<Record<string, unknown>> }>;
  cloudRequests: Array<Record<string, unknown>>;
};

const completeResponse = {
  projectName: "ระบบบริการประชาชนรุ่นใหม่",
  agencyName: "สำนักดิจิทัล",
  headOfAgency: "หัวหน้าหน่วยงาน",
  dcioName: "ผู้บริหารเทคโนโลยีสารสนเทศ",
  projectManager: "ผู้จัดการโครงการ",
  totalBudget: "100000",
  budgets: [{ id: "018f3a3b-1b2c-7d3e-8f4b-5c6d7e8f9a0b", year: 2569, amount: "100000", budgetType: "งบประมาณรายจ่าย" }],
  background: "ข้อมูลความเป็นมาของโครงการที่มีรายละเอียดครบถ้วน",
  objective: "วัตถุประสงค์ของโครงการที่มีรายละเอียดครบถ้วน",
  target: "กลุ่มเป้าหมายของโครงการที่มีรายละเอียดครบถ้วน",
  scope: "ขอบเขตการดำเนินงานของโครงการที่มีรายละเอียดครบถ้วน",
  projectType: "จัดหาใหม่",
  currentSystemStatus: "ระบบเดิมยังใช้งานอยู่",
  currentProblems: "ระบบเดิมมีข้อจำกัดหลายประการ",
  isBmaPlan: true,
  isAgencyPlan: "false",
  isGovernorPolicy: "0",
  appArchitecture: "สถาปัตยกรรมระบบแบบบริการ",
  dataOwner: "สำนักดิจิทัล",
  dataExchangePlan: "แลกเปลี่ยนข้อมูลผ่าน API",
  personnelCosts: [],
  trainings: [{
    id: "018f3a3b-1b2c-7d3e-8f4b-5c6d7e8f9a0c",
    courseName: "หลักสูตรระบบใหม่",
    trainingMethod: "อบรมเชิงปฏิบัติการ",
    locationType: "สถานที่ราชการ",
    hasSpeakerCost: false,
    speakerCosts: [],
    foodCosts: [{ itemName: "ค่าอาหารว่าง", mealsCount: 1, ratePerMeal: "50", traineesCount: 10, days: 1 }],
  }],
  durationDays: "180",
  ictPersonnel: [],
  cloudRequests: [{
    id: "018f3a3b-1b2c-7d3e-8f4b-5c6d7e8f9a0d",
    systemName: "ระบบประชาชน",
    requestedServiceDate: "2027-01-02T00:00:00.000Z",
    recordedRequestDate: "2027-01-01T00:00:00.000Z",
    vms: [],
  }],
  expectedBenefits: "ประชาชนได้รับบริการที่รวดเร็วขึ้น",
  isInRoadmap: true,
};

test("normalizes response fields into canonical form state", () => {
  const form = normalizeProposalForForm(completeResponse) as TestPayload;

  expect(form.projectType).toBe("NEW");
  expect(form.isAgencyPlan).toBe(false);
  expect(form.isGovernorPolicy).toBe(false);
  expect(form.budgetsByYear).toEqual([{ year: 2569, amount: 100000, budgetType: "งบประมาณรายจ่าย" }]);
  expect(form.trainingCourses).toHaveLength(1);
  expect(form.trainingCourses[0].locationType).toBe("GOVERNMENT");
  expect(form.trainingCourses[0].foodCosts.find((row) => row.itemName === "SNACK")?.ratePerMeal).toBe(50);
  expect(form.cloudRequests[0].requestedServiceDate).toBe("2027-01-02");
});

test("creates a backend-compatible payload without stale relational IDs", () => {
  const payload = toProposalSubmitPayload(completeResponse) as TestPayload;
  const parsed = proposalSubmitPayloadSchema.safeParse(payload);

  expect(parsed.success).toBe(true);
  expect(payload.budgetsByYear[0]).not.toHaveProperty("id");
  expect(payload.trainingCourses[0]).not.toHaveProperty("id");
  expect(payload.cloudRequests[0]).not.toHaveProperty("id");
  expect(payload.cloudRequests[0].requestedServiceDate).toBe("2027-01-02");
});

test("does not leak submitted-proposal response metadata into form or submit payload", () => {
  const response = {
    ...completeResponse,
    id: "018f3a3b-1b2c-7d3e-8f4b-5c6d7e8f9a0b",
    status: "submitted",
    projectId: "018f3a3b-1b2c-7d3e-8f4b-5c6d7e8f9a0c",
    userId: "018f3a3b-1b2c-7d3e-8f4b-5c6d7e8f9a0d",
    updatedBy: "018f3a3b-1b2c-7d3e-8f4b-5c6d7e8f9a0e",
    version: 1,
    requestedBudgetTotal: "100000",
    estimatedCostTotal: "25000",
    submittedAt: "2027-01-03T00:00:00.000Z",
    createdAt: "2027-01-03T00:00:00.000Z",
    updatedAt: "2027-01-03T00:00:00.000Z",
  };

  const form = normalizeProposalForForm(response);
  const payload = toProposalSubmitPayload(form);

  expect(form).not.toHaveProperty("status");
  expect(form).not.toHaveProperty("projectId");
  expect(form).not.toHaveProperty("submittedAt");
  expect(form).not.toHaveProperty("createdAt");
  expect(payload).not.toHaveProperty("requestedBudgetTotal");
  expect(payload).not.toHaveProperty("estimatedCostTotal");
  expect(payload).not.toHaveProperty("status");
  expect(proposalSubmitPayloadSchema.safeParse(payload).success).toBe(true);
});
