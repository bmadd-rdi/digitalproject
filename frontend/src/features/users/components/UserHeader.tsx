// import { UserPlus } from "lucide-react";
// import { Button } from "@/components/ui/button";

export const UserHeader = () => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">จัดการผู้ใช้งาน (User Management)</h1>
      <p className="text-sm text-slate-500 mt-1">บริหารจัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และตรวจสอบสถานะความปลอดภัยของระบบ</p>
    </div>
    {/* <Button className="gap-2 shadow-sm shrink-0">
      <UserPlus className="w-4 h-4" /> เพิ่มผู้ใช้งานใหม่
    </Button> */}
  </div>
);