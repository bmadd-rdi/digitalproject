// frontend/src/features/proposals/types.ts
import { z } from "zod";

// ---------------------------------------------------------------------------
// Step 1: ข้อมูลเบื้องต้นและภาพรวม (General Information)
// ---------------------------------------------------------------------------
export const proposalStep1Schema = z.object({
  projectName: z.string().min(5, "กรุณาระบุชื่อโครงการอย่างน้อย 5 ตัวอักษร"),
  agencyName: z.string().min(2, "กรุณาระบุชื่อหน่วยงาน"),
  headOfAgency: z.string().min(2, "กรุณาระบุหัวหน้าส่วนราชการ"),
  dcioName: z.string().min(2, "กรุณาระบุ DCIO"),
  projectManager: z.string().min(2, "กรุณาระบุผู้รับผิดชอบโครงการ"),
  totalBudget: z.coerce.number().min(1, "กรุณาเพิ่มรายการงบประมาณรายปีและระบุจำนวนเงิน"),
  // ตารางงบประมาณรายปี
  budgetsByYear: z.array(
    z.object({
      year: z.coerce
        .number({ message: "กรุณาระบุ พ.ศ. เป็นตัวเลข" })
        .int("ปี พ.ศ. ต้องเป็นจำนวนเต็ม")
        .min(2500, "กรุณาระบุปี พ.ศ. ให้ถูกต้อง (เช่น 2567)")
        .max(2600, "กรุณาระบุปี พ.ศ. ให้ถูกต้อง"),
      amount: z.coerce.number().min(1, "ระบุจำนวนเงิน"),
      budgetType: z.string().min(1, "ระบุประเภทงบประมาณ"),
    })
  ).optional().default([]),
});

// ---------------------------------------------------------------------------
// Step 2: สาระสำคัญและขอบเขตโครงการ (Context & Scope)
// ---------------------------------------------------------------------------
export const proposalStep2Schema = z.object({
  background: z.string().min(10, "กรุณาระบุความเป็นมา"),
  objective: z.string().min(10, "กรุณาระบุวัตถุประสงค์"),
  target: z.string().min(10, "กรุณาระบุเป้าหมาย"),
  scope: z.string().min(10, "กรุณาระบุขอบเขตการดำเนินงาน"),
  projectType: z.enum(["NEW", "REPLACEMENT", "CONTINUOUS"], "กรุณาเลือกลักษณะโครงการ"),
  currentSystemStatus: z.string().min(5, "อธิบายสถานภาพระบบงานปัจจุบัน"),
  currentProblems: z.string().min(5, "อธิบายสภาพปัญหาปัจจุบัน"),

  // array ของตารางโครงการที่เกี่ยวข้อง
  relatedProjects: z.array(
    z.object({
      projectName: z.string().min(1, "ระบุชื่อโครงการ"),
      agency: z.string().min(1, "ระบุหน่วยงาน"),
      fiscalYear: z.string().min(4, "ระบุปี พ.ศ."),
      relationType: z.string().min(1, "ระบุความเกี่ยวข้อง"),
      remark: z.string().optional(),
    })
  ).optional().default([]),

  // ตารางอัตรากำลัง (อนุญาตให้ว่างเปล่าได้)
  manpower: z.array(
    z.object({
      agencyPart: z.string().min(1, "ระบุส่วนราชการ"),
      positionLimit: z.coerce.number(),
      occupied: z.coerce.number(),
      vacant: z.coerce.number(),
    })
  ).optional().default([]),

  // ตารางครุภัณฑ์ที่มีอยู่ (อนุญาตให้ว่างเปล่าได้)
  existingEquipment: z.array(
    z.object({
      itemName: z.string().min(1, "ระบุรายการครุภัณฑ์"),
      ageYears: z.coerce.number(),
      quantity: z.coerce.number(),
      user: z.string().min(1, "ระบุผู้ใช้งาน"),
      location: z.string().min(1, "ระบุสถานที่ตั้ง"),
      remark: z.string().optional(),
    })
  ).optional().default([]),
});

// ---------------------------------------------------------------------------
// Step 3: สถาปัตยกรรมองค์กร (Enterprise Architecture)
// ---------------------------------------------------------------------------
const imageWithDescriptionSchema = z.object({
  id: z.string(),
  file: z.any(),
  description: z.string().min(1, "กรุณาระบุคำอธิบายรูปภาพ (บังคับ)"),
});

export const proposalStep3Schema = z.object({
  // ข้อ 1
  isBmaPlan: z.boolean().default(false),

  // ข้อ 2
  isAgencyPlan: z.boolean().default(false),
  agencyStrategy: z.string().optional(),
  agencyIssue: z.string().optional(),
  agencyKpi: z.string().optional(),

  // ข้อ 3
  isGovernorPolicy: z.boolean().default(false),
  governorPolicyCode: z.string().optional(),
  governorPolicyName: z.string().optional(),

  obstacleLaws: z.string().optional(),
  appArchitecture: z.string().min(5, "กรุณาอธิบายด้านระบบสารสนเทศ"),
  dataOwner: z.string().min(2, "กรุณาระบุหน่วยงานเจ้าของข้อมูล"),
  dataExchangePlan: z.string().min(5, "กรุณาอธิบายแนวทางการแลกเปลี่ยนข้อมูล"),

  // for this 4 files, when user uploads a file, it will instantly be saved in the database (projetc_attachments table)
  systemDiagramFile: imageWithDescriptionSchema.optional().nullable(),
  networkDiagramFile: imageWithDescriptionSchema.optional().nullable(),
  useCaseDiagramFile: imageWithDescriptionSchema.optional().nullable(),
  securityDiagramFile: imageWithDescriptionSchema.optional().nullable(),
  systemDiagramUrl: z.string().url().optional().nullable(),
  networkDiagramUrl: z.string().url().optional().nullable(),
  useCaseDiagramUrl: z.string().url().optional().nullable(),
  securityDiagramUrl: z.string().url().optional().nullable(),
}).superRefine((data, ctx) => {
  // ตรวจสอบว่าต้องเลือกอย่างน้อย 1 ข้อ
  if (!data.isBmaPlan && !data.isAgencyPlan && !data.isGovernorPolicy) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "กรุณาเลือกความสอดคล้องเชิงยุทธศาสตร์อย่างน้อย 1 ข้อ",
      path: ["isBmaPlan"], // ชี้ error ไปที่ข้อแรกให้แสดงผล
    });
  }

  // ดักจับถ้าติ๊กข้อ 2 แต่ไม่กรอกข้อมูล
  if (data.isAgencyPlan) {
    if (!data.agencyStrategy?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "กรุณาระบุแผนงาน", path: ["agencyStrategy"] });
    }
    if (!data.agencyIssue?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "กรุณาระบุประเด็น", path: ["agencyIssue"] });
    }
    if (!data.agencyKpi?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "กรุณาระบุตัวชี้วัด", path: ["agencyKpi"] });
    }
  }

  // ดักจับถ้าติ๊กข้อ 3 แต่ไม่กรอกข้อมูล
  if (data.isGovernorPolicy) {
    if (!data.governorPolicyCode?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "กรุณาระบุรหัสนโยบาย", path: ["governorPolicyCode"] });
    }
    if (!data.governorPolicyName?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "กรุณาระบุนโยบาย", path: ["governorPolicyName"] });
    }
  }
});

// ---------------------------------------------------------------------------
// Step 4: แผนงานและรายละเอียดงบประมาณ (Budget Breakdown)
// ---------------------------------------------------------------------------
export const hardwareCostSchema = z.object({
  itemName: z.string().min(1, "กรุณาระบุรายการ"),
  quantity: z.coerce.number().min(1, "กรุณาระบุจำนวน"),
  unitPrice: z.coerce.number().min(0, "ห้ามติดลบ"),

// ตัวแปรหลักสำหรับเก็บว่า User เลือกตัวเลือกไหน
  referenceType: z.enum(["MDES", "MARKET", "PREVIOUS", "OTHER"], {
    message: "กรุณาเลือกที่มาของราคากลาง 1 รายการ",
  }),

  // ฟิลด์ย่อยทั้งหมด (ตั้งเป็น optional ไว้ก่อน เพราะจะถูกดักด้วย superRefine)
  mdesMonth: z.string().optional(),
  mdesYear: z.string().optional(),
  mdesItemNo: z.string().optional(),

  marketCount: z.coerce.number().optional(),
  marketCompany: z.string().optional(),

  prevProject: z.string().optional(),
  prevYear: z.string().optional(),

  otherDetail: z.string().optional(),

}).superRefine((data, ctx) => {
  // ดักจับ Validation ตามตัวเลือกที่ถูกเลือก
  if (data.referenceType === "MDES") {
    if (!data.mdesMonth) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุเดือน", path: ["mdesMonth"] });
    if (!data.mdesYear) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุ พ.ศ.", path: ["mdesYear"] });
    if (!data.mdesItemNo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุรายการที่", path: ["mdesItemNo"] });
  }
  if (data.referenceType === "MARKET") {
    if (!data.marketCount || data.marketCount < 1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุจำนวนราย", path: ["marketCount"] });
    if (!data.marketCompany) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุชื่อบริษัท", path: ["marketCompany"] });
  }
  if (data.referenceType === "PREVIOUS") {
    if (!data.prevProject) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุชื่อโครงการ", path: ["prevProject"] });
    if (!data.prevYear) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุ พ.ศ.", path: ["prevYear"] });
  }
  if (data.referenceType === "OTHER") {
    if (!data.otherDetail) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุรายละเอียด", path: ["otherDetail"] });
  }
});

export const softwareCostSchema = z.object({
  itemName: z.string().min(1, "กรุณาระบุรายการ"),
  quantity: z.coerce.number().min(1, "กรุณาระบุจำนวน"),
  unitPrice: z.coerce.number().min(0, "ห้ามติดลบ"),

  // ตัวแปรหลักสำหรับเก็บว่า User เลือกตัวเลือกไหน
  referenceType: z.enum(["MDES", "MARKET", "PREVIOUS", "OTHER"], {
    message: "กรุณาเลือกที่มาของราคากลาง 1 รายการ",
  }),

  // ฟิลด์ย่อยทั้งหมด (ตั้งเป็น optional ไว้ก่อน เพราะจะถูกดักด้วย superRefine)
  mdesMonth: z.string().optional(),
  mdesYear: z.string().optional(),
  mdesItemNo: z.string().optional(),

  marketCount: z.coerce.number().optional(),
  marketCompany: z.string().optional(),

  prevProject: z.string().optional(),
  prevYear: z.string().optional(),

  otherDetail: z.string().optional(),

}).superRefine((data, ctx) => {
  // ดักจับ Validation ตามตัวเลือกที่ถูกเลือก
  if (data.referenceType === "MDES") {
    if (!data.mdesMonth) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุเดือน", path: ["mdesMonth"] });
    if (!data.mdesYear) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุ พ.ศ.", path: ["mdesYear"] });
    if (!data.mdesItemNo) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุรายการที่", path: ["mdesItemNo"] });
  }
  if (data.referenceType === "MARKET") {
    if (!data.marketCount || data.marketCount < 1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุจำนวนราย", path: ["marketCount"] });
    if (!data.marketCompany) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุชื่อบริษัท", path: ["marketCompany"] });
  }
  if (data.referenceType === "PREVIOUS") {
    if (!data.prevProject) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุชื่อโครงการ", path: ["prevProject"] });
    if (!data.prevYear) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุ พ.ศ.", path: ["prevYear"] });
  }
  if (data.referenceType === "OTHER") {
    if (!data.otherDetail) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ระบุรายละเอียด", path: ["otherDetail"] });
  }
});

// ค่าใช้จ่ายบุคลากรที่ใช้ในการพัฒนาระบบ
// 1. Schema สำหรับ บุคลากรหลัก และ บุคลากรผู้ช่วย (บังคับสาขาและตัวคูณ)
const personnelCoreAndAsstSchema = z.object({
  position: z.string().min(1, "ระบุตำแหน่ง"),
  degree: z.string().min(1, "ระบุวุฒิ"),
  fieldOfStudy: z.string().min(1, "ระบุสาขา"), // บังคับกรอก
  experienceYears: z.coerce.number().min(0, "ระบุปี"),
  baseSalary: z.coerce.number().min(1, "ระบุเงินเดือน"),
  multiplier: z.coerce.number().min(0.1, "ระบุตัวคูณ"), // บังคับตัวเลขที่ > 0
  personCount: z.coerce.number().min(1, "ระบุคน"),
  durationMonths: z.coerce.number().min(1, "ระบุเดือน"),
});

// 2. Schema สำหรับ บุคลากรสนับสนุน (ไม่เอาสาขาและตัวคูณ)
const personnelSuppSchema = z.object({
  position: z.string().min(1, "ระบุตำแหน่ง"),
  degree: z.string().min(1, "ระบุวุฒิ"),
  experienceYears: z.coerce.number().min(0, "ระบุปี"),
  baseSalary: z.coerce.number().min(1, "ระบุเงินเดือน"),
  personCount: z.coerce.number().min(1, "ระบุคน"),
  durationMonths: z.coerce.number().min(1, "ระบุเดือน"),
});

// หน้าที่ความรับผิดชอบของบุคลากร (ใช้ร่วมกันทุกหมวด)
const personnelResponsibilitySchema = z.object({
  position: z.string(), // ไม่ต้องมี min(1) เพราะเราดึงมาอัตโนมัติ
  responsibility: z.string().min(1, "กรุณาระบุหน้าที่ความรับผิดชอบ"),
});

const speakerCostSchema = z.object({
  itemName: z.string().min(1, "ระบุรายการ"),
  hours: z.coerce.number().min(1, "ระบุจำนวนชั่วโมง"),
  ratePerHour: z.coerce.number().min(0, "ระบุอัตรา/ชั่วโมง"),
  days: z.coerce.number().min(1, "ระบุระยะเวลา(วัน)"),
});

const foodCostSchema = z.object({
  itemName: z.enum(["PARTIAL_MEAL", "FULL_MEAL", "SNACK", "OTHER"]),
  mealsCount: z.coerce.number().min(0),
  ratePerMeal: z.coerce.number().min(0),
  traineesCount: z.coerce.number().min(0),
  days: z.coerce.number().min(0),
});

const trainingCourseSchema = z.object({
  courseName: z.string().min(1, "กรุณาระบุหลักสูตร"),
  trainingMethod: z.string().min(1, "กรุณาระบุวิธีการฝึกอบรม"),
  locationType: z.enum(["GOVERNMENT", "PRIVATE"]),

  // ตารางวิทยากร (แสดง/ซ่อน ผ่าน UI แต่ข้อมูลเก็บตรงนี้)
  hasSpeakerCost: z.boolean().default(false),
  speakerReason: z.string().optional(),
  speakerCosts: z.array(speakerCostSchema).default([]),

  // ตารางค่าอาหาร (Fixed 3 รายการเสมอ แต่สร้าง schema ไว้รองรับการเก็บค่า)
  foodCosts: z.array(foodCostSchema).default([
    { itemName: "PARTIAL_MEAL", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
    { itemName: "FULL_MEAL", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
    { itemName: "SNACK", mealsCount: 0, ratePerMeal: 0, traineesCount: 0, days: 0 },
  ]),
}).superRefine((data, ctx) => {
  // ดักว่าถ้าติ๊ก "มีวิทยากร" ต้องกรอกเหตุผล
  if (data.hasSpeakerCost && (!data.speakerReason || data.speakerReason.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "กรุณาระบุเหตุผลความจำเป็น",
      path: ["speakerReason"],
    });
  }
});

const otherCostSchema = z.object({
  itemName: z.string().min(1, "ระบุรายการ"),
  quantity: z.coerce.number().min(1, "ระบุจำนวน"),
  unitPrice: z.coerce.number().min(0, "ห้ามติดลบ"),
  remark: z.string().optional(), // หมายเหตุเป็น Text ธรรมดา

  costType: z.enum(["IT", "NON_IT"], {
    message: "กรุณาเลือกประเภท (IT / Non-IT)",
  }),
});

export const proposalStep4Schema = z.object({
  hardwareCosts: z.array(hardwareCostSchema).default([]),
  softwareCosts: z.array(softwareCostSchema).default([]),
  // ใช้ Schema ที่แยกกันให้ตรงหมวด
  personnelCoreCosts: z.array(personnelCoreAndAsstSchema).default([]),
  personnelAsstCosts: z.array(personnelCoreAndAsstSchema).default([]),
  personnelSuppCosts: z.array(personnelSuppSchema).default([]),
  personnelResponsibilities: z.array(personnelResponsibilitySchema).default([]),
  trainingCourses: z.array(trainingCourseSchema).default([]),
  otherCosts: z.array(otherCostSchema).default([]),
});

// ---------------------------------------------------------------------------
// Step 5: ความพร้อม
// ---------------------------------------------------------------------------
// Schema สำหรับข้อมูล VM 1 แถว
const vmRequirementSchema = z.object({
  id: z.string().optional(), // สำหรับแก้ไข
  vmDescription: z.string().min(1, "ระบุรายละเอียด/หน้าที่ VM"),
  osDatabase: z.string().min(1, "ระบุระบบปฏิบัติการ/ฐานข้อมูล"),
  vcpu: z.coerce.number().min(0, "ห้ามติดลบ"),
  ramGb: z.coerce.number().min(0, "ห้ามติดลบ"),
  gpuGb: z.coerce.number().min(0, "ห้ามติดลบ"),
  storageGb: z.coerce.number().min(0, "ห้ามติดลบ"),
  price: z.coerce.number().min(0, "ห้ามติดลบ"),
});

// Schema สำหรับระบบงาน 1 ระบบ (ประกอบด้วยหลาย VM)
const dateOnlySchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "กรุณาระบุวันที่ในรูปแบบ YYYY-MM-DD")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day;
  }, "วันที่ไม่ถูกต้อง");

const cloudRequestSchema = z.object({
  id: z.string().optional(),
  systemName: z.string().min(1, "ระบุชื่อโครงการ/ระบบงาน"),
  requestedServiceDate: dateOnlySchema,
  recordedRequestDate: dateOnlySchema,
  vms: z.array(vmRequirementSchema).default([]),
});

// Schema รวมของ Step 5 (ต่อจากของเดิมที่คุณมี)
const ictPersonnelSchema = z.object({
  position: z.string().min(1, "ระบุตำแหน่ง"),
  level: z.string().min(1, "ระบุระดับ"),
  count: z.coerce.number().min(1, "ต้องมากกว่า 0"),
});

export const proposalStep5Schema = z.object({
  durationDays: z.coerce.number().min(1, "กรุณาระบุระยะเวลาดำเนินงาน"),
  ictPersonnel: z.array(ictPersonnelSchema).default([]),

  cloudRequests: z.array(cloudRequestSchema).default([]),

  isReady: z.boolean().default(false),
  readinessDetails: z.string().optional(),
  otherReadiness: z.string().optional(),
  expectedBenefits: z.string().min(1, "กรุณาระบุประโยชน์ที่คาดว่าจะได้รับ"),
  isInRoadmap: z.boolean({ message: "กรุณาเลือกสถานะ Roadmap" }),
});

// ---------------------------------------------------------------------------
// Master Schemas & Types
// ---------------------------------------------------------------------------
export const proposalFormSchema = z.object({
  ...proposalStep1Schema.shape,
  ...proposalStep2Schema.shape,
  ...proposalStep3Schema.shape,
  ...proposalStep4Schema.shape,
  ...proposalStep5Schema.shape,
});

export const proposalDraftSchema = proposalFormSchema.partial();

export type ProposalStep1Values = z.infer<typeof proposalStep1Schema>;
export type ProposalStep2Values = z.infer<typeof proposalStep2Schema>;
export type ProposalStep3Values = z.infer<typeof proposalStep3Schema>;
export type ProposalStep4Values = z.infer<typeof proposalStep4Schema>;
export type ProposalStep5Values = z.infer<typeof proposalStep5Schema>;
export type ProposalFormValues = z.infer<typeof proposalFormSchema>;
export type ProposalDraftValues = z.infer<typeof proposalDraftSchema>;
