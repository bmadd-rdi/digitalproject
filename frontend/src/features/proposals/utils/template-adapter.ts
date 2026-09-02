// src/features/proposals/utils/template-adapter.ts
import { ProposalDraftValues } from "../types";
import { withPlaceholder, hasItems } from "./docx-formatters";

type TemplateItem = {
  [key: string]: unknown;
  quantity?: number | string | null;
  unitPrice?: number | string | null;
  referenceType?: string;
  baseSalary?: number | string | null;
  multiplier?: number | string | null;
  personCount?: number | string | null;
  durationMonths?: number | string | null;
  speakerCosts?: TemplateItem[];
  foodCosts?: TemplateItem[];
  hasSpeakerCost?: boolean;
  speakerReason?: string;
  locationType?: string;
  vms?: TemplateItem[];
  vcpu?: number | string | null;
  ramGb?: number | string | null;
  gpuGb?: number | string | null;
  storageGb?: number | string | null;
  price?: number | string | null;
  systemName?: string;
  requestedServiceDate?: string | Date | null;
  recordedRequestDate?: string | Date | null;
};

// กำหนดหน้าตาข้อมูล (Type) ให้ตรงกับคีย์แท็กดั้งเดิมในไฟล์ Word (.docx) ของคุณ
type ProposalTemplateBase = Omit<
  Partial<ProposalDraftValues>,
  | "hardwareCosts"
  | "softwareCosts"
  | "personnelCoreCosts"
  | "personnelAsstCosts"
  | "personnelSuppCosts"
  | "personnelResponsibilities"
  | "trainingCourses"
  | "otherCosts"
  | "ictPersonnel"
  | "cloudRequests"
>;

export interface ProposalTemplateData extends ProposalTemplateBase {
  chkNew: string;
  chkReplace: string;
  chkPhase: string;
  hasManpower: boolean;
  hasEquipment: boolean;
  chkBma: string;
  chkAgency: string;
  chkGov: string;
  agencyStrategy?: string;
  agencyIssue?: string;
  agencyKpi?: string;
  governorPolicyCode?: string;
  governorPolicyName?: string;

  hasRelatedProjects: boolean;
  hasHardwareCosts: boolean;
  hasSoftwareCosts: boolean;
  hasPersonnelCoreCosts: boolean;
  hasPersonnelAsstCosts: boolean;
  hasPersonnelSuppCosts: boolean;
  hasPersonnelResponsibilities: boolean;
  hasTrainingCourses: boolean; 
  hasOtherCosts: boolean;

  hardwareCosts: TemplateItem[];
  softwareCosts: TemplateItem[];
  personnelCoreCosts: TemplateItem[];
  personnelAsstCosts: TemplateItem[];
  personnelSuppCosts: TemplateItem[];
  personnelResponsibilities: TemplateItem[];
  trainingCourses: TemplateItem[];
  otherCosts: TemplateItem[];

  // summaty variables for Word template
  totalHwCostStr: string;
  totalSwCostStr: string;
  totalCoreCostStr: string; // sub topic
  totalAsstCostStr: string; // sub topic
  totalSuppCostStr: string; // sub topic
  totalPersonnelCostStr: string;
  totalTrainingCostStr: string;
  totalOtherCostStr: string;
  totalOtherITStr: string;
  totalOtherNonITStr: string;
  grandTotalITOnlyStr: string;
  grandTotalStr: string;

  // Percentage calculations for Word template
  hwPercentStr: string;
  swPercentStr: string;
  personnelPercentStr: string;
  trainingPercentStr: string;
  otherITPercentStr: string;

  // Step 5 
  hasIctPersonnel: boolean;
  ictPersonnel: TemplateItem[];
  chkInRoadmap: string;
  chkNotInRoadmap: string;
  // --- Cloud / VM Requests ---
  hasCloudRequests: boolean;
  cloudRequests: TemplateItem[];
  grandTotalVcpu: number;
  grandTotalRam: number;
  grandTotalGpu: number;
  grandTotalStorage: number;
  grandTotalPriceFormatted: string;
  
  // ปรับเป็นประเภทสติงเพื่อรองรับจุดไข่ปลาหากกรณีไม่มีข้อมูล
  otherReadiness?: string;
}


// ฟังก์ชันช่วยแปลงข้อมูล Array ตารางราคาให้ออกมาเป็นโครงสร้างของ Word ตามที่คุณกำหนด
export const mapCostItemsForWord = (items: TemplateItem[]) => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;

    return {
      ...item,
      index: index + 1, // สามารถนำ {index} ไปใช้เป็นเลขลำดับในตารางได้
      
      // แปลงค่า Enum ให้เป็น Checkbox ☑ / ☐
      chkMdes: item.referenceType === "MDES" ? "☑" : "☐",
      chkMarket: item.referenceType === "MARKET" ? "☑" : "☐",
      chkPrev: item.referenceType === "PREVIOUS" ? "☑" : "☐",
      chkOther: item.referenceType === "OTHER" ? "☑" : "☐",
      
      // เติมจุดไข่ปลาป้องกันค่า undefined โผล่ใน Word กรณีฟิลด์นั้นไม่ได้ถูกกรอก
      mdesMonth: item.mdesMonth || "..........",
      mdesYear: item.mdesYear || "........",
      mdesItemNo: item.mdesItemNo || "........",
      marketCount: item.marketCount || "........",
      marketCompany: item.marketCompany || "................................",
      prevProject: item.prevProject || "................................",
      prevYear: item.prevYear || "........",
      otherDetail: item.otherDetail || "................................",
      
      // คำนวณราคารวมของแถวนั้นๆ ให้ Word นำไปแสดงผลได้ทันที
      rowTotal: (quantity * unitPrice).toLocaleString('th-TH'),
      unitPriceStr: unitPrice.toLocaleString('th-TH'),
    };
  });
};

const mapStandardCosts = (items: TemplateItem[]) => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return {
      ...item,
      index: index + 1,
      chkMdes: item.referenceType === "MDES" ? "☑" : "☐",
      chkMarket: item.referenceType === "MARKET" ? "☑" : "☐",
      chkPrev: item.referenceType === "PREVIOUS" ? "☑" : "☐",
      chkOther: item.referenceType === "OTHER" ? "☑" : "☐",
      mdesMonth: item.mdesMonth || "..........",
      mdesYear: item.mdesYear || "........",
      mdesItemNo: item.mdesItemNo || "........",
      marketCount: item.marketCount || "........",
      marketCompany: item.marketCompany || "................................",
      prevProject: item.prevProject || "................................",
      prevYear: item.prevYear || "........",
      otherDetail: item.otherDetail || "................................",
      rowTotal: (quantity * unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      unitPriceStr: unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    };
  });
};

const mapPersonnelCoreAndAsst = (items: TemplateItem[]) => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => {
    const baseSalary = Number(item.baseSalary) || 0;
    const multiplier = Number(item.multiplier) || 1;
    const calculatedSalary = baseSalary * multiplier;
    const personCount = Number(item.personCount) || 0;
    const durationMonths = Number(item.durationMonths) || 0;
    const total = baseSalary * multiplier * personCount * durationMonths;

    return {
      ...item,
      index: index + 1,
      baseSalaryStr: baseSalary.toLocaleString('th-TH'),
      multiplierStr: multiplier.toFixed(2),
      calculatedSalaryStr: calculatedSalary.toLocaleString('th-TH'),
      rowTotal: total.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    };
  });
};

const mapPersonnelSupport = (items: TemplateItem[]) => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => {
    const baseSalary = Number(item.baseSalary) || 0;
    const personCount = Number(item.personCount) || 0;
    const durationMonths = Number(item.durationMonths) || 0;
    const total = baseSalary * personCount * durationMonths;

    return {
      ...item,
      index: index + 1,
      baseSalaryStr: baseSalary.toLocaleString('th-TH'),
      rowTotal: total.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
    };
  });
};

const mapTrainingCourses = (items: TemplateItem[]) => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => {
    // 4.1 คำนวณตารางวิทยากรย่อยในแต่ละคอร์ส (ชั่วโมง * อัตรา * วัน)
    let courseSpeakerTotal = 0;
    const formattedSpeakerCosts = (item.speakerCosts || []).map((sp, spIndex) => {
      const spTotal = (Number(sp.hours) || 0) * (Number(sp.ratePerHour) || 0) * (Number(sp.days) || 0);
      courseSpeakerTotal += spTotal;
      return {
        ...sp,
        index: spIndex + 1,
        ratePerHourStr: (Number(sp.ratePerHour) || 0).toLocaleString('th-TH'),
        rowTotal: spTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })
      };
    });

    // 4.2 คำนวณตารางค่าอาหารย่อยในแต่ละคอร์ส (มื้อ * อัตรา * คน * วัน)
    let courseFoodTotal = 0;
    const formattedFoodCosts = (item.foodCosts || []).map((fd, fdIndex) => {
      const fdTotal = (Number(fd.mealsCount) || 0) * (Number(fd.ratePerMeal) || 0) * (Number(fd.traineesCount) || 0) * (Number(fd.days) || 0);
      courseFoodTotal += fdTotal;
      return {
        ...fd,
        index: fdIndex + 1,
        ratePerMealStr: (Number(fd.ratePerMeal) || 0).toLocaleString('th-TH'),
        rowTotal: fdTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })
      };
    });

    const grandCourseTotal = courseSpeakerTotal + courseFoodTotal;

    return {
      ...item,
      index: index + 1,
      chkHasSpeaker: item.hasSpeakerCost ? "จำเป็น" : "ไม่จำเป็น",
      speakerReason: item.speakerReason || "................................",
      locationStr: item.locationType === "GOVERNMENT" || item.locationType === "สถานที่ราชการ"
        ? "☑ สถานที่ราชการ \t☐ สถานที่เอกชน"
        : "☐ สถานที่ราชการ \t☑ สถานที่เอกชน",
      speakerCosts: formattedSpeakerCosts,
      foodCosts: formattedFoodCosts,
      // ยอดรวมย่อยแยกของแต่ละตารางในหลักสูตร
      speakerTotalStr: courseSpeakerTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      foodTotalStr: courseFoodTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      // ราคารวมสรุปของคอร์สการอบรมนี้ (วิทยากร + ค่าอาหาร)
      courseTotalStr: grandCourseTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })
    };
  });
};

const mapOtherCosts = (items: TemplateItem[]) => {
  if (!items || items.length === 0) return [];
  return items.map((item, index) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return {
      ...item,
      index: index + 1,
      chkIt: item.costType === "IT" ? "IT" : "",
      chkNonIt: item.costType === "NON_IT" ? "NON-IT" : "",
      unitPriceStr: unitPrice.toLocaleString('th-TH'),
      rowTotal: (quantity * unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 }),
      remark: item.remark || "-"
    };
  });
};

// ฟังก์ชันจัดการตาราง Cloud / VM พร้อมคำนวณผลรวมรายระบบงานและผลรวมทั้งหมด
const mapCloudRequests = (items: TemplateItem[]) => {
  if (!items || items.length === 0) {
    return { formattedRequests: [], grandTotals: { vcpu: 0, ram: 0, gpu: 0, storage: 0, price: 0 } };
  }

  let gVcpu = 0, gRam = 0, gGpu = 0, gStorage = 0, gPrice = 0;

  // ฟังก์ชันช่วยแปลงวันที่ให้แสดงผลสวยงามใน Word
  const formatThaiDate = (dateVal: unknown) => {
    if (!dateVal) return ".........................";
    if (
      typeof dateVal !== "string" &&
      typeof dateVal !== "number" &&
      !(dateVal instanceof Date)
    ) {
      return String(dateVal);
    }
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return String(dateVal); }
  };

  const formattedRequests = items.map((req) => {
    let groupVcpu = 0, groupRam = 0, groupGpu = 0, groupStorage = 0, groupPrice = 0;

    const formattedVms = (req.vms || []).map((vm, vmIndex) => {
      const vcpu = Number(vm.vcpu) || 0;
      const ram = Number(vm.ramGb) || 0;
      const gpu = Number(vm.gpuGb) || 0;
      const storage = Number(vm.storageGb) || 0;
      const price = Number(vm.price) || 0;

      groupVcpu += vcpu;
      groupRam += ram;
      groupGpu += gpu;
      groupStorage += storage;
      groupPrice += price;

      return {
        ...vm,
        index: vmIndex + 1,
        priceFormatted: price.toLocaleString('th-TH', { minimumFractionDigits: 2 })
      };
    });

    gVcpu += groupVcpu;
    gRam += groupRam;
    gGpu += groupGpu;
    gStorage += groupStorage;
    gPrice += groupPrice;

    return {
      ...req,
      systemName: req.systemName || "................................",
      requestedServiceDate: formatThaiDate(req.requestedServiceDate),
      recordedRequestDate: formatThaiDate(req.recordedRequestDate),
      vms: formattedVms,
      groupTotalVcpu: groupVcpu,
      groupTotalRam: groupRam,
      groupTotalGpu: groupGpu,
      groupTotalStorage: groupStorage,
      groupTotalPriceFormatted: groupPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })
    };
  });

  return {
    formattedRequests,
    grandTotals: { vcpu: gVcpu, ram: gRam, gpu: gGpu, storage: gStorage, price: gPrice }
  };
};

// Adapter หลักสำหรับจัดเตรียมข้อมูลเข้าสู่ Word Template
export const prepareTemplateData = (
  rawData: ProposalDraftValues
): ProposalTemplateData => {
  const currentType = rawData.projectType || "";

  // Logic การคำนวณยอดรวมจากหน้า UI
  const hw = rawData.hardwareCosts || [];
  const sw = rawData.softwareCosts || [];
  const core = rawData.personnelCoreCosts || [];
  const asst = rawData.personnelAsstCosts || [];
  const supp = rawData.personnelSuppCosts || [];
  const courses = rawData.trainingCourses || [];
  const other = rawData.otherCosts || [];

  // คำนวณหมวด 1 และ 2
  const totalHw = hw.reduce((acc, row) => acc + ((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0)), 0);
  const totalSw = sw.reduce((acc, row) => acc + ((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0)), 0);

  // คำนวณหมวด 3 (บุคลากร)
  const totalCore = core.reduce((acc, row) => acc + (((Number(row.baseSalary) || 0) * (Number(row.multiplier) || 1)) * (Number(row.personCount) || 0) * (Number(row.durationMonths) || 0)), 0);
  const totalAsst = asst.reduce((acc, row) => acc + (((Number(row.baseSalary) || 0) * (Number(row.multiplier) || 1)) * (Number(row.personCount) || 0) * (Number(row.durationMonths) || 0)), 0);
  const totalSupp = supp.reduce((acc, row) => acc + ((Number(row.baseSalary) || 0) * (Number(row.personCount) || 0) * (Number(row.durationMonths) || 0)), 0);
  const totalPersonnel = totalCore + totalAsst + totalSupp;

  // คำนวณหมวด 4 (ฝึกอบรม)
  const totalTraining = courses.reduce((acc: number, course) => {
    const spkCost = (course.speakerCosts || []).reduce((sum: number, r) => sum + ((Number(r.hours) || 0) * (Number(r.ratePerHour) || 0) * (Number(r.days) || 0)), 0);
    const foodCost = (course.foodCosts || []).reduce((sum: number, r) => sum + ((Number(r.mealsCount) || 0) * (Number(r.ratePerMeal) || 0) * (Number(r.traineesCount) || 0) * (Number(r.days) || 0)), 0);
    return acc + spkCost + foodCost;
  }, 0);

  // คำนวณหมวด 5 (อื่นๆ)
  const totalOtherIT = other.filter(row => row.costType === "IT").reduce((acc, row) => acc + ((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0)), 0);
  const totalOtherNonIT = other.filter(row => row.costType === "NON_IT").reduce((acc, row) => acc + ((Number(row.quantity) || 0) * (Number(row.unitPrice) || 0)), 0);
  const totalOther = totalOtherIT + totalOtherNonIT;

  // คำนวณยอด Grand Total
  const grandTotal = totalHw + totalSw + totalPersonnel + totalTraining + totalOther;
  const grandTotalITOnly = grandTotal - totalOtherNonIT;

  // ฟังก์ชันช่วย Format ตัวเลข
  const formatMoney = (amount: number) => amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ฟังก์ชันช่วยคำนวณเปอร์เซ็นต์ของแต่ละหมวดเทียบกับ Grand Total
  const calculatePercent = (amount: number, total: number) => {
    // ป้องกัน Error (Division by zero) ในกรณีที่ยังไม่ได้กรอกงบประมาณเลย
    if (total === 0) return "0.00"; 
    // สูตร: (ส่วนย่อย / ส่วนรวม) * 100
    const percent = (amount / total) * 100;
    return percent.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // --- จัดการข้อมูล Cloud Requests ---
  const cloudData = mapCloudRequests(rawData.cloudRequests || []);

  return {
    ...rawData, // โยนข้อมูลพื้นฐานไปก่อน

    // --- Step 2: Checkbox ประเภทโครงการ ---
    chkNew: currentType === "NEW" ? "☑" : "☐",
    chkReplace: currentType === "REPLACEMENT" ? "☑" : "☐",
    chkPhase: currentType === "CONTINUOUS" || currentType.includes("ต่อเนื่อง") ? "☑" : "☐",

    // --- Step 2 (ต่อ): เช็กข้อมูล Array สำหรับเปิด/ปิดตารางข้อมูลเดิม ---
    hasManpower: hasItems(rawData.manpower),
    hasEquipment: hasItems(rawData.existingEquipment),

    // --- Step 3: Checkbox ยุทธศาสตร์และความสอดคล้อง ---
    chkBma: rawData.isBmaPlan ? "☑" : "☐",
    chkAgency: rawData.isAgencyPlan ? "☑" : "☐",
    chkGov: rawData.isGovernorPolicy ? "☑" : "☐",

    // --- Step 3 (ต่อ): ป้องกันค่าว่างด้วยจุดไข่ปลาแบบเดิมของคุณ ---
    agencyStrategy: rawData.isAgencyPlan ? withPlaceholder(rawData.agencyStrategy, "..........................") : "..........................",
    agencyIssue: rawData.isAgencyPlan ? withPlaceholder(rawData.agencyIssue, "..........................") : "..........................",
    agencyKpi: rawData.isAgencyPlan ? withPlaceholder(rawData.agencyKpi, "..........................") : "..........................",
    governorPolicyCode: rawData.isGovernorPolicy ? withPlaceholder(rawData.governorPolicyCode, "..........................") : "..........................",
    governorPolicyName: rawData.isGovernorPolicy ? withPlaceholder(rawData.governorPolicyName, "..........................") : "..........................",

    hasRelatedProjects: hasItems(rawData.relatedProjects),

    // --- Step 4 : Boolean Flag เพื่อซ่อน/แสดงตารางราคา ---
    // ตั้งค่า Boolean Flags คุมการแสดงตารางใน Word
    hasHardwareCosts: hasItems(rawData.hardwareCosts),
    hasSoftwareCosts: hasItems(rawData.softwareCosts),
    hasPersonnelCoreCosts: hasItems(rawData.personnelCoreCosts),
    hasPersonnelAsstCosts: hasItems(rawData.personnelAsstCosts),
    hasPersonnelSuppCosts: hasItems(rawData.personnelSuppCosts),
    hasPersonnelResponsibilities: hasItems(rawData.personnelResponsibilities),
    hasTrainingCourses: hasItems(rawData.trainingCourses),
    hasOtherCosts: hasItems(rawData.otherCosts),

    // รันกระบวนการจัดฟอร์แมตข้อมูลส่งออกไปยังคีย์ดั้งเดิมของเทมเพลต
    hardwareCosts: mapStandardCosts(rawData.hardwareCosts || []),
    softwareCosts: mapStandardCosts(rawData.softwareCosts || []),
    personnelCoreCosts: mapPersonnelCoreAndAsst(rawData.personnelCoreCosts || []),
    personnelAsstCosts: mapPersonnelCoreAndAsst(rawData.personnelAsstCosts || []),
    personnelSuppCosts: mapPersonnelSupport(rawData.personnelSuppCosts || []),
    
    personnelResponsibilities: (rawData.personnelResponsibilities || []).map((item, i) => ({
      ...item, index: i + 1
    })),
    
    trainingCourses: mapTrainingCourses(rawData.trainingCourses || []),
    otherCosts: mapOtherCosts(rawData.otherCosts || []),
    // Summary variables for Word template
    totalHwCostStr: formatMoney(totalHw),
    totalSwCostStr: formatMoney(totalSw),
    totalCoreCostStr: formatMoney(totalCore), // sub topic
    totalAsstCostStr: formatMoney(totalAsst), // sub topic
    totalSuppCostStr: formatMoney(totalSupp), // sub topic
    totalPersonnelCostStr: formatMoney(totalPersonnel),
    totalTrainingCostStr: formatMoney(totalTraining),
    totalOtherCostStr: formatMoney(totalOther),
    totalOtherITStr: formatMoney(totalOtherIT),
    totalOtherNonITStr: formatMoney(totalOtherNonIT),
    grandTotalITOnlyStr: formatMoney(grandTotalITOnly),
    grandTotalStr: formatMoney(grandTotal),

    // Percentage calculations for Word template
    hwPercentStr: calculatePercent(totalHw, grandTotalITOnly),
    swPercentStr: calculatePercent(totalSw, grandTotalITOnly),
    personnelPercentStr: calculatePercent(totalPersonnel, grandTotalITOnly),
    trainingPercentStr: calculatePercent(totalTraining, grandTotalITOnly),
    otherITPercentStr: calculatePercent(totalOtherIT, grandTotalITOnly),
    

    // Step 5
    hasIctPersonnel: hasItems(rawData.ictPersonnel),
    ictPersonnel: (rawData.ictPersonnel || []).map((item, index) => ({
      ...item,
      index: index + 1
    })),
    otherReadiness: withPlaceholder(rawData.otherReadiness, "-ไม่มี-"),
    chkInRoadmap: rawData.isInRoadmap === true ? "☑" : "☐",
    chkNotInRoadmap: rawData.isInRoadmap === false ? "☑" : "☐",
    // --- Cloud Requests ---
    hasCloudRequests: hasItems(rawData.cloudRequests),
    cloudRequests: cloudData.formattedRequests,
    grandTotalVcpu: cloudData.grandTotals.vcpu,
    grandTotalRam: cloudData.grandTotals.ram,
    grandTotalGpu: cloudData.grandTotals.gpu,
    grandTotalStorage: cloudData.grandTotals.storage,
    grandTotalPriceFormatted: cloudData.grandTotals.price.toLocaleString('th-TH', { minimumFractionDigits: 2 }),
  };
};
