import { expect, test } from "bun:test";
import { submitProposalSchema } from "../../src/modules/proposals/proposal.schema";
import { mapSubmittedProposalToDraftPayload } from "../../src/modules/proposals/proposal-restore";

test("maps the submitted graph into a complete canonical draft", () => {
  const payload = mapSubmittedProposalToDraftPayload({
    proposal: {
      projectName: "ระบบบริการประชาชนดิจิทัล",
      agencyName: "สำนักดิจิทัล",
      headOfAgency: "หัวหน้าหน่วยงาน",
      dcioName: "ผู้บริหารเทคโนโลยี",
      projectManager: "ผู้จัดการโครงการ",
      requestedBudgetTotal: "100000.50",
      background: "ข้อมูลความเป็นมาของโครงการที่มีรายละเอียดเพียงพอ",
      objective: "วัตถุประสงค์ของโครงการที่มีรายละเอียดเพียงพอ",
      target: "กลุ่มเป้าหมายของโครงการที่มีรายละเอียดเพียงพอ",
      scope: "ขอบเขตการดำเนินงานของโครงการที่มีรายละเอียดเพียงพอ",
      projectType: "REPLACEMENT",
      currentSystemStatus: "ระบบเดิมยังใช้งานอยู่",
      currentProblems: "ระบบเดิมมีข้อจำกัดหลายประการ",
      appArchitecture: "สถาปัตยกรรมระบบแบบบริการ",
      dataOwner: "สำนักดิจิทัล",
      dataExchangePlan: "แลกเปลี่ยนข้อมูลผ่าน API",
      durationDays: "30",
      expectedBenefits: "ประชาชนได้รับบริการที่ดีขึ้น",
      isInRoadmap: null,
    },
    budgets: [{ id: "old-budget", year: 2569, amount: "100000.50", budgetType: "รายจ่าย" }],
    relatedProjects: [],
    manpower: [],
    existingEquipments: [],
    hardwareCosts: [{ id: "old-hardware", itemName: "เครื่องแม่ข่าย", quantity: 1, unitPrice: "0", referenceType: "OTHER" }],
    softwareCosts: [],
    personnelCosts: [],
    personnelResponsibilities: [],
    trainings: [{ id: "old-training", courseName: "หลักสูตรระบบ", trainingMethod: "อบรม", locationType: "PRIVATE", hasSpeakerCost: false }],
    trainingSpeakerCosts: [],
    trainingFoodCosts: [],
    otherCosts: [],
    ictPersonnel: [],
    cloudRequests: [{ id: "old-cloud", systemName: "ระบบกลาง", requestedServiceDate: new Date("2027-01-02"), recordedRequestDate: "2027-01-01T00:00:00.000Z" }],
    cloudVms: [{ id: "old-vm", cloudRequestId: "old-cloud", vmDescription: "VM", osDatabase: "Linux", vcpu: 1, ramGb: 1, gpuGb: 0, storageGb: 10, price: "0" }],
  });

  expect(payload.requestedBudgetTotal).toBe(100000.5);
  expect(payload.projectType).toBe("REPLACEMENT");
  expect(payload.budgetsByYear[0]).not.toHaveProperty("id");
  expect(payload.cloudRequests[0].requestedServiceDate).toBe("2027-01-02");
  expect(payload.cloudRequests[0].vms[0].price).toBe(0);
  expect(payload.trainingCourses[0].foodCosts.length).toBeGreaterThan(0);
  expect(submitProposalSchema.safeParse(payload).success).toBe(true);
});

test("rejects timestamps instead of date-only values", () => {
  const result = submitProposalSchema.shape.cloudRequests.safeParse([{
    systemName: "ระบบ",
    requestedServiceDate: "2027-01-02T00:00:00.000Z",
    recordedRequestDate: "2027-01-01",
    vms: [],
  }]);
  expect(result.success).toBe(false);
});
