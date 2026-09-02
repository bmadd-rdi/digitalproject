import { expect, test } from "bun:test";
import { v7 as uuidv7 } from "uuid";

test("submit, cancel, edit, and resubmit preserves the complete proposal", async () => {
  if (process.env.RUN_PROPOSAL_FLOW_INTEGRATION !== "1") return;

  const { and, eq } = await import("drizzle-orm");
  const { db } = await import("../../db");
  const { users } = await import("../../db/schema/users");
  const { projects } = await import("../../db/schema/projects");
  const { projectStatusLogs } = await import("../../db/schema/project_status_logs");
  const { proposalDrafts } = await import("../../db/schema/proposal_drafts");
  const {
    proposals,
    proposalBudgets,
    proposalRelatedProjects,
    proposalManpower,
    proposalExistingEquipments,
    proposalHardwareCosts,
    proposalSoftwareCosts,
    proposalPersonnelCosts,
    proposalPersonnelResponsibilities,
    proposalTrainings,
    proposalTrainingSpeakerCosts,
    proposalTrainingFoodCosts,
    proposalOtherCosts,
    proposalIctPersonnel,
    proposalCloudRequests,
    proposalCloudVms,
  } = await import("../../db/schema/proposals");
  const { cancelProjectSubmit } = await import("../projects/project-cancel.service");
  const { proposalService } = await import("./proposal.service");
  const { PROJECT_STATUS } = await import("../projects/project-workflow");

  const [owner] = await db.select().from(users).where(eq(users.username, "test_user")).limit(1);
  if (!owner) throw new Error("test_user must exist before running the integration test");

  const projectId = uuidv7();
  const proposalId = uuidv7();
  const budgetId = uuidv7();
  const relatedId = uuidv7();
  const manpowerId = uuidv7();
  const equipmentId = uuidv7();
  const hardwareId = uuidv7();
  const softwareId = uuidv7();
  const personnelId = uuidv7();
  const responsibilityId = uuidv7();
  const trainingId = uuidv7();
  const speakerId = uuidv7();
  const foodId = uuidv7();
  const otherId = uuidv7();
  const ictId = uuidv7();
  const cloudId = uuidv7();
  const vmId = uuidv7();

  const user = {
    userId: owner.userId,
    roles: ["user"] as ["user"],
    divisionId: owner.divisionId ?? 1,
    departmentId: 1,
  };

  try {
    await db.insert(projects).values({
      id: projectId,
      projectCode: `TEST-${projectId.slice(-12)}`,
      userId: owner.userId,
      divisionId: owner.divisionId ?? 1,
      projectStatusId: PROJECT_STATUS.PENDING_SECRETARY,
      projectTypeId: 1,
      fourQuadrantsId: 1,
      deputyGovernorId: 1,
      projectName: "ชื่อโครงการล่าสุดก่อนยกเลิก",
      projectNameOriginal: "ชื่อโครงการเดิม",
      initialRequestedBudget: "100000",
      latestRequestedBudget: "100000",
      isPublic: false,
    });

    await db.insert(proposals).values({
      id: proposalId,
      projectId,
      userId: owner.userId,
      status: "submitted",
      projectName: "ชื่อโครงการล่าสุดก่อนยกเลิก",
      agencyName: "สำนักดิจิทัล",
      headOfAgency: "หัวหน้าหน่วยงาน",
      dcioName: "ผู้บริหารเทคโนโลยีสารสนเทศ",
      projectManager: "ผู้จัดการโครงการ",
      requestedBudgetTotal: "100000",
      background: "ข้อมูลความเป็นมาของโครงการที่มีรายละเอียดครบถ้วน",
      objective: "วัตถุประสงค์ของโครงการที่มีรายละเอียดครบถ้วน",
      target: "กลุ่มเป้าหมายของโครงการที่มีรายละเอียดครบถ้วน",
      scope: "ขอบเขตการดำเนินงานของโครงการที่มีรายละเอียดครบถ้วน",
      projectType: "REPLACEMENT",
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
    });

    await db.insert(proposalBudgets).values({ id: budgetId, proposalId, year: 2569, amount: "100000", budgetType: "งบประมาณรายจ่าย" });
    await db.insert(proposalRelatedProjects).values({ id: relatedId, proposalId, projectName: "โครงการเดิม", agency: "หน่วยงานเดิม", fiscalYear: "2568", relationType: "ทดแทน", remark: "หมายเหตุ" });
    await db.insert(proposalManpower).values({ id: manpowerId, proposalId, agencyPart: "ฝ่ายระบบ", positionLimit: 5, occupied: 3, vacant: 2 });
    await db.insert(proposalExistingEquipments).values({ id: equipmentId, proposalId, itemName: "เครื่องแม่ข่าย", ageYears: "2.5", quantity: 1, user: "ฝ่ายระบบ", location: "ศาลาว่าการ", remark: "หมายเหตุ" });
    await db.insert(proposalHardwareCosts).values({ id: hardwareId, proposalId, itemName: "เครื่องแม่ข่ายใหม่", quantity: 2, unitPrice: "50000", referenceType: "MARKET", marketCount: 3, marketCompany: "บริษัทตัวอย่าง" });
    await db.insert(proposalSoftwareCosts).values({ id: softwareId, proposalId, itemName: "ระบบจัดการข้อมูล", quantity: 1, unitPrice: "0", referenceType: "OTHER", otherDetail: "พัฒนาระบบเฉพาะ" });
    await db.insert(proposalPersonnelCosts).values({ id: personnelId, proposalId, personnelType: "CORE", position: "นักวิชาการ", degree: "ปริญญาตรี", fieldOfStudy: "คอมพิวเตอร์", experienceYears: "5", baseSalary: "25000", multiplier: "1.5", personCount: 2, durationMonths: 6 });
    await db.insert(proposalPersonnelResponsibilities).values({ id: responsibilityId, proposalId, position: "ผู้จัดการ", responsibility: "กำกับโครงการ" });
    await db.insert(proposalTrainings).values({ id: trainingId, proposalId, courseName: "หลักสูตรระบบใหม่", trainingMethod: "อบรมเชิงปฏิบัติการ", locationType: "PRIVATE", hasSpeakerCost: true, speakerReason: "ต้องใช้ผู้เชี่ยวชาญ" });
    await db.insert(proposalTrainingSpeakerCosts).values({ id: speakerId, trainingId, itemName: "วิทยากรภายนอก", hours: 4, ratePerHour: "1000", days: 2 });
    await db.insert(proposalTrainingFoodCosts).values({ id: foodId, trainingId, itemName: "FULL_MEAL", mealsCount: 1, ratePerMeal: "120", traineesCount: 20, days: 2 });
    await db.insert(proposalOtherCosts).values({ id: otherId, proposalId, itemName: "ค่าใช้จ่ายอื่น", quantity: 1, unitPrice: "500", costType: "IT", remark: "หมายเหตุ" });
    await db.insert(proposalIctPersonnel).values({ id: ictId, proposalId, position: "ผู้ดูแลระบบ", level: "ปฏิบัติการ", count: 2 });
    await db.insert(proposalCloudRequests).values({ id: cloudId, proposalId, systemName: "ระบบประชาชน", requestedServiceDate: new Date("2027-01-02T00:00:00.000Z"), recordedRequestDate: new Date("2027-01-01T00:00:00.000Z") });
    await db.insert(proposalCloudVms).values({ id: vmId, cloudRequestId: cloudId, vmDescription: "เว็บเซิร์ฟเวอร์", osDatabase: "Ubuntu", vcpu: 4, ramGb: 8, gpuGb: 0, storageGb: 100, price: "2500" });

    await cancelProjectSubmit(projectId, user);

    const [draftAfterCancel] = await db.select().from(proposalDrafts).where(eq(proposalDrafts.projectId, projectId));
    expect(draftAfterCancel).toBeDefined();
    const restored = draftAfterCancel?.draftPayload as Record<string, any>;
    expect(restored.trainingCourses[0].foodCosts).toEqual(expect.any(Array));
    expect(restored.cloudRequests[0].requestedServiceDate).toBe("2027-01-02");
    expect(restored.trainingCourses[0]).not.toHaveProperty("id");

    const editedPayload = {
      ...restored,
      projectName: "ชื่อโครงการล่าสุดหลังแก้ไข",
      requestedBudgetTotal: 150000,
      budgetsByYear: [{ ...restored.budgetsByYear[0], amount: 150000 }],
      projectId,
    };
    await proposalService.upsertDraft(projectId, owner.userId, {
      projectName: editedPayload.projectName,
      requestedBudgetTotal: editedPayload.requestedBudgetTotal,
      currentStep: 5,
      draftPayload: editedPayload,
    });
    await proposalService.submitProposal(user, editedPayload);

    const [projectAfterResubmit] = await db.select().from(projects).where(eq(projects.id, projectId));
    const [proposalAfterResubmit] = await db.select().from(proposals).where(eq(proposals.projectId, projectId));
    const budgetsAfterResubmit = await db.select().from(proposalBudgets).where(eq(proposalBudgets.proposalId, proposalAfterResubmit!.id));
    const trainingsAfterResubmit = await db.select().from(proposalTrainings).where(eq(proposalTrainings.proposalId, proposalAfterResubmit!.id));
    const cloudsAfterResubmit = await db.select().from(proposalCloudRequests).where(eq(proposalCloudRequests.proposalId, proposalAfterResubmit!.id));
    const draftAfterResubmit = await db.select().from(proposalDrafts).where(eq(proposalDrafts.projectId, projectId));

    expect(projectAfterResubmit?.projectStatusId).toBe(PROJECT_STATUS.PENDING_SECRETARY);
    expect(projectAfterResubmit?.projectName).toBe("ชื่อโครงการล่าสุดหลังแก้ไข");
    expect(projectAfterResubmit?.projectNameOriginal).toBe("ชื่อโครงการเดิม");
    expect(String(projectAfterResubmit?.initialRequestedBudget)).toBe("100000.00");
    expect(String(projectAfterResubmit?.latestRequestedBudget)).toBe("150000.00");
    expect(proposalAfterResubmit?.projectName).toBe("ชื่อโครงการล่าสุดหลังแก้ไข");
    expect(budgetsAfterResubmit).toHaveLength(1);
    expect(trainingsAfterResubmit).toHaveLength(1);
    expect(cloudsAfterResubmit).toHaveLength(1);
    expect(draftAfterResubmit).toHaveLength(0);
  } finally {
    await db.delete(proposalDrafts).where(eq(proposalDrafts.projectId, projectId));
    const [proposal] = await db.select({ id: proposals.id }).from(proposals).where(eq(proposals.projectId, projectId));
    if (proposal) await db.delete(proposals).where(eq(proposals.id, proposal.id));
    await db.delete(projectStatusLogs).where(eq(projectStatusLogs.projectId, projectId));
    await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, owner.userId)));
  }
});
