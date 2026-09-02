import { describe, expect, test } from "bun:test";
import {
  departmentSeedData,
  derivedDepartmentSeedData,
  divisionDepartmentCodeOverrides,
  divisionSeedData,
  deputyGovernorSeedData,
  fourQuadrantSeedData,
} from "./organization-lookup-data";

const unique = (values: string[]) => new Set(values).size;

describe("ข้อมูล Lookup องค์กรจาก SQL ต้นทาง", () => {
  test("มีจำนวนและรหัสตรงกับชุดข้อมูลที่ติดตามใน Repository", () => {
    expect(departmentSeedData).toHaveLength(24);
    expect(divisionSeedData).toHaveLength(371);
    expect(deputyGovernorSeedData).toHaveLength(5);
    expect(fourQuadrantSeedData).toHaveLength(4);
    expect(unique(departmentSeedData.map((item) => item.code))).toBe(24);
    expect(unique(divisionSeedData.map((item) => item.code))).toBe(371);
    expect(unique(divisionSeedData.map((item) => String(item.sourceId)))).toBe(371);
  });

  test("ทุก Division มี Department code ที่ resolve ได้โดยไม่ใช้ชื่อเป็น FK", () => {
    const departmentCodes = new Set([
      ...departmentSeedData.map((item) => item.code),
      ...derivedDepartmentSeedData.map((item) => item.code),
    ]);

    for (const division of divisionSeedData) {
      expect(division.departmentCode).toMatch(/^\d{8}$/);
      expect(departmentCodes.has(division.departmentCode)).toBe(true);
    }
    expect(divisionDepartmentCodeOverrides).toEqual([
      { divisionCode: "23100000", departmentCode: "23000000" },
    ]);
  });

  test("รองรับชื่อ Division ซ้ำกันได้", () => {
    const counts = new Map<string, number>();
    for (const division of divisionSeedData) {
      counts.set(division.name, (counts.get(division.name) ?? 0) + 1);
    }
    expect([...counts.values()].some((count) => count > 1)).toBe(true);
  });
});
