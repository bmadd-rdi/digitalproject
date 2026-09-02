// src/features/proposals/utils/docx-formatters.ts

// แปลง boolean เป็นสัญลักษณ์ Checkbox สำหรับ Word
export const toCheckbox = (condition: boolean | undefined | null): string => {
  return condition ? "☑" : "☐";
};

// จัดการค่าว่าง ถ้าไม่มีข้อมูลให้ใส่จุดไข่ปลา
export const withPlaceholder = (
  value: string | number | undefined | null,
  placeholder: string = ".........................."
): string => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return placeholder;
  }
  return String(value);
};


// เช็คว่า Array มีข้อมูลหรือไม่ (ใช้สำหรับ Flag เปิด/ปิด ตารางใน Word)
export const hasItems = <T>(arr: T[] | undefined | null): boolean => {
  return Array.isArray(arr) && arr.length > 0;
};