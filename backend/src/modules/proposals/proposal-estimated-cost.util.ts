import { HTTPException } from "hono/http-exception";

type Row = Record<string, unknown>;

function cents(value: unknown, field: string) {
  if (value === null || value === undefined || value === "") return 0n;
  const raw = typeof value === "number" ? String(value) : String(value).trim();
  if (!/^(?:\+)?\d+(?:\.\d{1,2})?$/.test(raw)) {
    throw new HTTPException(400, { message: `Invalid decimal value for ${field}` });
  }
  const [whole, fraction = ""] = raw.replace(/^\+/, "").split(".");
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
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
      total += (cents(row.baseSalary, "baseSalary") * cents(multiplier, "multiplier") *
        cents(row.personCount, "personCount") * cents(row.durationMonths, "durationMonths")) / 1000000n;
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
