import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export const ipWhitelistMiddleware = async (c: Context, next: Next) => {
  // อ่านค่า IP ที่อนุญาตจาก .env (เช่น ALLOWED_INTERNAL_IPS="192.168.1.10,10.0.0.5")
  const allowedIpsString = process.env.ALLOWED_INTERNAL_IPS || "";
  const allowedIps = allowedIpsString.split(",").map(ip => ip.trim());

  // ดึง IP ของ Client (รองรับกรณีอยู่หลัง Proxy / Docker / Nginx)
  const clientIp = 
    c.req.header("x-forwarded-for")?.split(",")[0] || // กรณีผ่าน Proxy/Load Balancer
    c.req.header("x-real-ip") ||
    c.env?.incoming?.conn?.remote?.address || // IP ตรงๆ (ขึ้นอยู่กับ Runtime เช่น Bun)
    "unknown";

  // ตรวจสอบว่า IP อยู่ใน Whitelist หรือไม่ (ข้ามการเช็คถ้าตั้งเป็น * สำหรับตอน Dev)
  if (allowedIpsString !== "*" && !allowedIps.includes(clientIp)) {
    console.warn(`🚨 Blocked unauthorized IP access attempt from: ${clientIp}`);
    throw new HTTPException(403, { message: "Forbidden: IP Address not allowed" });
  }

  await next();
};