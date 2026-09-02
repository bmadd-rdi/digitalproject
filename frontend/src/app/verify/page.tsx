"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { CLIENT_API_BASE } from "@/lib/client-api";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // กำหนดสถานะเริ่มต้นจากตัวแปร token ทันทีเพื่อเลี่ยงการใช้ setState ใน effect
  const [status, setStatus] = useState<"loading" | "success" | "error">(() => token ? "loading" : "error");

  // กำหนดข้อความเริ่มต้นตามเงื่อนไขการมีอยู่ของ token
  const [message, setMessage] = useState(() => token ? "กำลังตรวจสอบข้อมูลและเปิดใช้งานบัญชี..." : "ลิงก์ไม่ถูกต้อง หรือไม่มีรหัสยืนยันตัวตนส่งมา");

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const res = await fetch(`${CLIENT_API_BASE}/auth/verify?token=${encodeURIComponent(token)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "ยืนยันอีเมลสำเร็จ! บัญชีของคุณพร้อมใช้งานแล้ว");
        } else {
          setStatus("error");
          setMessage(data.error || "ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่อีกครั้ง");
        }
      } catch (error) {
        console.error("🔴 Connection Error on Frontend:", error);
        setStatus("error");
        setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ (CORS หรือ URL ไม่ถูกต้อง)");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low p-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-xl shadow-sm border border-border text-center flex flex-col items-center">

        {status === "loading" && <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />}
        {status === "success" && <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />}
        {status === "error" && <XCircle className="w-16 h-16 text-status-orange mb-4" />}

        <h1 className="text-2xl font-bold text-foreground mb-2">ระบบยืนยันอีเมล</h1>
        <p className="text-muted-foreground text-sm mb-8 px-4">{message}</p>

        {status === "success" && (
          <Button onClick={() => router.push("/login")} className="w-full font-medium">
            ไปหน้าเข้าสู่ระบบ
          </Button>
        )}
        {status === "error" && (
          <Button variant="outline" onClick={() => router.push("/register")} className="w-full font-medium">
            กลับไปหน้าสมัครสมาชิก
          </Button>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">กำลังโหลดหน้าต่างยืนยัน...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
