import { HTTPException } from "hono/http-exception";

type Row = Record<string, unknown>;

// ตัวคูณเงินเดือนบุคลากรรับทศนิยมได้สูงสุดกี่ตำแหน่ง — ต้องตรงกับ scale ของคอลัมน์
// proposal_personnel_costs.multiplier ในฐานข้อมูล (numeric(7,4)) ถ้าแก้ค่านี้ต้องแก้
// คอลัมน์ (และ MULTIPLIER_SCALE ด้านล่างซึ่งคำนวณจากค่านี้อัตโนมัติ) ให้ตรงกันด้วย
const MULTIPLIER_DECIMALS = 4;
const MULTIPLIER_SCALE = 10n ** BigInt(MULTIPLIER_DECIMALS);

// แปลงตัวเลขทศนิยมเป็นจำนวนเต็มคูณ 10^decimals (fixed-point) โดยไม่ผ่าน floating point
// เพื่อให้ยอดรวมเงินแม่นยำ ปฏิเสธค่าที่ทศนิยมเกิน decimals ตำแหน่ง, ติดลบ หรือเขียนแบบ 1e-7
function toFixedPoint(value: unknown, field: string, decimals: number) {
  if (value === null || value === undefined || value === "") return 0n;
  const raw = typeof value === "number" ? String(value) : String(value).trim();
  const pattern = new RegExp(`^(?:\\+)?\\d+(?:\\.\\d{1,${decimals}})?$`);
  if (!pattern.test(raw)) {
    throw new HTTPException(400, { message: `Invalid decimal value for ${field}` });
  }
  const [whole, fraction = ""] = raw.replace(/^\+/, "").split(".");
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0"));
}

// จำนวนเงิน/จำนวนนับทั่วไป — ทศนิยม 2 ตำแหน่ง (หน่วยสตางค์)
function cents(value: unknown, field: string) {
  return toFixedPoint(value, field, 2);
}

function product(row: Row, left: string, right: string) {
  return (cents(row[left], left) * cents(row[right], right)) / 100n;
}

function sumRows(rows: unknown, left: string, right: string) {
  if (!Array.isArray(rows)) return 0n;
  return rows.reduce((total, value) => total + product((value ?? {}) as Row, left, right), 0n);
}

function formatCents(total: bigint) {
  const whole = total / 100n;
  const fraction = (total % 100n).toString().padStart(2, "0");
  return `${whole}.${fraction}`;
}

export function calculateEstimatedCostTotal(payload: Record<string, unknown>) {
  let total = 0n;
  total += sumRows(payload.hardwareCosts, "quantity", "unitPrice");
  total += sumRows(payload.softwareCosts, "quantity", "unitPrice");
  total += sumRows(payload.otherCosts, "quantity", "unitPrice");

  for (const key of ["personnelCoreCosts", "personnelAsstCosts", "personnelSuppCosts"]) {
    const rows = Array.isArray(payload[key]) ? payload[key] as Row[] : [];
    for (const row of rows) {
      const multiplier = row.multiplier === undefined || row.multiplier === "" ? 1 : row.multiplier;
      // หน่วยของตัวคูณ: baseSalary/personCount/durationMonths เป็น ×100 ส่วน multiplier เป็น
      // ×MULTIPLIER_SCALE (10^4) ผลคูณจึงเป็น ×(100 × 100 × 100 × 10^4) = ×10^10
      // หารด้วย 10^8 เพื่อให้กลับมาเป็นหน่วยสตางค์ (×100) เหมือนเดิม
      total += (cents(row.baseSalary, "baseSalary") *
        toFixedPoint(multiplier, "multiplier", MULTIPLIER_DECIMALS) *
        cents(row.personCount, "personCount") * cents(row.durationMonths, "durationMonths")) /
        (100n * 100n * MULTIPLIER_SCALE);
    }
  }

  const courses = Array.isArray(payload.trainingCourses) ? payload.trainingCourses as Row[] : [];
  for (const course of courses) {
    const speakerRows = Array.isArray(course.speakerCosts) ? course.speakerCosts as Row[] : [];
    for (const row of speakerRows) {
      total += (cents(row.hours, "hours") * cents(row.ratePerHour, "ratePerHour") * cents(row.days, "days")) / 10000n;
    }
    const foodRows = Array.isArray(course.foodCosts) ? course.foodCosts as Row[] : [];
    for (const row of foodRows) {
      total += (cents(row.mealsCount, "mealsCount") * cents(row.ratePerMeal, "ratePerMeal") *
        cents(row.traineesCount, "traineesCount") * cents(row.days, "days")) / 1000000n;
    }
  }

  return formatCents(total);
}
