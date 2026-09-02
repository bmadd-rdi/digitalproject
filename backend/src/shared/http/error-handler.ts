import { Context } from "hono";

export const handleRegisterError = (c: Context, error: any) => {
  // 1. แกะกล่อง Drizzle: ถ้ามี error.cause ให้ใช้ตัวในสุด เพราะนั่นคือ Error จริงจาก Postgres
  const dbErr = error?.cause || error;

  // 2. ดึงข้อมูลทุกซอกทุกมุมมาต่อกัน (message, detail, constraint) จะได้ไม่พลาดฟิลด์ที่ซ้ำ
  const errorCode = dbErr?.code;
  const errorString =
    `${dbErr?.message || ""} ${dbErr?.detail || ""} ${dbErr?.constraint || ""}`.toLowerCase();

  // 3. ตรวจสอบรหัส 23505 ของ Postgres : "ข้อมูลซ้ำ"
  if (
    errorCode === "23505" ||
    errorString.includes("unique") ||
    errorString.includes("duplicate")
  ) {
    // ตรวจสอบจากชื่อคอลัมน์ หรือ ชื่อ Constraint (เช่น users_email_unique)
    if (errorString.includes("email")) {
      return c.json({ error: "อีเมลนี้มีผู้ใช้งานแล้ว", field: "email" }, 409);
    }

    if (errorString.includes("username")) {
      return c.json(
        { error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว", field: "username" },
        409,
      );
    }

    // กรณีมีข้อมูลซ้ำที่ฟิลด์อื่นที่เราไม่ได้ดักชื่อไว้
    return c.json({ error: "ข้อมูลนี้มีอยู่ในระบบแล้ว" }, 409);
  }

  // 4. ถ้าเป็น Error อื่นๆ ค่อยพ่น 500
  console.error("🔥 Error ทั่วไป:", error);
  return c.json({ error: "เกิดข้อผิดพลาดภายในระบบ" }, 500);
};
