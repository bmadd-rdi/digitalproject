import { expect, test } from "bun:test";
import { submitProposalSchema } from "./proposal.schema";
import { mapSubmittedProposalToDraftPayload } from "./proposal-restore";

test("restores the complete five-step proposal into the editable form shape", () => {
  const payload = mapSubmittedProposalToDraftPayload({
    proposal: {
      projectName: "ระบบบริการประชาชนรุ่นใหม่",
      agencyName: "สำนักดิจิทัล",
      headOfAgency: "หัวหน้าหน่วยงาน",
      dcioName: "ผู้บริหารเทคโนโลยีสารสนเทศ",
      projectManager: "ผู้จัดการโครงการ",
      requestedBudgetTotal: "123456.50",
      background: "ข้อมูลความเป็นมาของโครงการที่มีรายละเอียดครบถ้วน",
      objective: "วัตถุประสงค์ของโครงการที่มีรายละเอียดครบถ้วน",
      target: "กลุ่มเป้าหมายของโครงการที่มีรายละเอียดครบถ้วน",
      scope: "ขอบเขตการดำเนินงานของโครงการที่มีรายละเอียดครบถ้วน",
      projectType: "ทดแทนระบบเดิม",
      currentSystemStatus: "ระบบเดิมยังใช้งานอยู่",
      currentProblems: "ระบบเดิมมีข้อจำกัดหลายประการ",
      isBmaPlan: true,
      isAgencyPlan: false,
      isGovernorPolicy: false,
      appArchitecture: "สถาปัตยกรรมระบบแบบบริการ",
      dataOwner: "สำนักดิจิทัล",
      dataExchangePlan: "แลกเปลี่ยนข้อมูลผ่าน API",
      isReady: true,
      readinessDetails: "หน่วยงานมีความพร้อม",
      durationDays: 180,
      otherReadiness: "มีบุคลากรพร้อม",
      expectedBenefits: "ประชาชนได้รับบริการที่รวดเร็วขึ้น",
      isInRoadmap: true,
    },
    budgets: [{ id: "budget-old", year: 2569, amount: "123456.50", budgetType: "งบประมาณรายจ่าย" }],
    relatedProjects: [{ id: "related-old", projectName: "โครงการเดิม", agency: "หน่วยงานเดิม", fiscalYear: "2568", relationType: "ทดแทน", remark: null }],
    manpower: [{ id: "manpower-old", agencyPart: "ฝ่ายระบบ", positionLimit: 5, occupied: 3, vacant: 2 }],
    existingEquipments: [{ id: "equipment-old", itemName: "เครื่องแม่ข่าย", ageYears: "2.5", quantity: 1, user: "ฝ่ายระบบ", location: "ศาลาว่าการ", remark: null }],
    hardwareCosts: [{ id: "hardware-old", itemName: "เครื่องแม่ข่ายใหม่", quantity: 2, unitPrice: "50000", referenceType: "MARKET", marketCount: 3, marketCompany: "บริษัทตัวอย่าง" }],
    softwareCosts: [{ id: "software-old", itemName: "ระบบจัดการข้อมูล", quantity: 1, unitPrice: "23456.50", referenceType: "OTHER", otherDetail: "พัฒนาระบบเฉพาะ" }],
    personnelCosts: [{ id: "personnel-old", personnelType: "CORE", position: "นักวิชาการ", degree: "ปริญญาตรี", fieldOfStudy: "คอมพิวเตอร์", experienceYears: "5", baseSalary: "25000", multiplier: "1.5", personCount: 2, durationMonths: 6 }],
    personnelResponsibilities: [{ id: "responsibility-old", position: "ผู้จัดการ", responsibility: "กำกับโครงการ" }],
    trainings: [{ id: "training-old", courseName: "หลักสูตรระบบใหม่", trainingMethod: "อบรมเชิงปฏิบัติการ", locationType: "สถานที่เอกชน", hasSpeakerCost: true, speakerReason: "ต้องใช้ผู้เชี่ยวชาญ" }],
    trainingSpeakerCosts: [{ id: "speaker-old", trainingId: "training-old", itemName: "วิทยากรภายนอก", hours: 4, ratePerHour: "1000", days: 2 }],
    trainingFoodCosts: [{ id: "food-old", trainingId: "training-old", itemName: "ค่าอาหารและเครื่องดื่ม", mealsCount: 1, ratePerMeal: "120", traineesCount: 20, days: 2 }],
    otherCosts: [{ id: "other-old", itemName: "ค่าใช้จ่ายอื่น", quantity: 1, unitPrice: "500", costType: "IT", remark: null }],
    ictPersonnel: [{ id: "ict-old", position: "ผู้ดูแลระบบ", level: "ปฏิบัติการ", count: 2 }],
    cloudRequests: [{ id: "cloud-old", systemName: "ระบบประชาชน", requestedServiceDate: new Date("2027-01-02T00:00:00.000Z"), recordedRequestDate: "2027-01-01T12:00:00.000Z" }],
    cloudVms: [{ id: "vm-old", cloudRequestId: "cloud-old", vmDescription: "เว็บเซิร์ฟเวอร์", osDatabase: "Ubuntu", vcpu: 4, ramGb: 8, gpuGb: 0, storageGb: 100, price: "2500" }],
  });

  expect(payload.projectType).toBe("REPLACEMENT");
  expect(payload.requestedBudgetTotal).toBe(123456.5);
  expect(payload.budgetsByYear[0]).toEqual({ year: 2569, amount: 123456.5, budgetType: "งบประมาณรายจ่าย" });
  expect(payload.existingEquipment[0].ageYears).toBe(2.5);
  expect(payload.personnelCoreCosts[0].baseSalary).toBe(25000);
  expect(payload.trainingCourses[0].locationType).toBe("PRIVATE");
  expect(payload.trainingCourses[0].foodCosts.find((row) => row.itemName === "FULL_MEAL")?.ratePerMeal).toBe(120);
  expect(payload.cloudRequests[0].requestedServiceDate).toBe("2027-01-02");
  expect(payload.cloudRequests[0].recordedRequestDate).toBe("2027-01-01");
  expect(payload.cloudRequests[0].vms[0].price).toBe(2500);
  expect(payload.budgetsByYear[0]).not.toHaveProperty("id");
  expect(payload.trainingCourses[0]).not.toHaveProperty("proposalId");
  expect(payload.cloudRequests[0].vms[0]).not.toHaveProperty("cloudRequestId");

  const parsed = submitProposalSchema.safeParse(payload);
  if (!parsed.success) throw new Error(JSON.stringify(parsed.error.issues));
});

test("rejects non-date-only cloud request dates", () => {
  const result = submitProposalSchema.shape.cloudRequests.safeParse([{
    systemName: "ระบบประชาชน",
    requestedServiceDate: "2027-01-02T00:00:00.000Z",
    recordedRequestDate: "2027-01-01",
    vms: [],
  }]);

  expect(result.success).toBe(false);
});
