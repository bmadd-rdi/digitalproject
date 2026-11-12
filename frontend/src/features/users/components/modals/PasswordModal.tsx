"use client";

import React from "react";
import { AlertTriangle, Key, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "../../types";

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  tempPassword: string | null;
  setTempPassword: (pw: string | null) => void;
}

export const PasswordModal = ({ 
  isOpen, 
  onClose, 
  user, 
  tempPassword, 
  setTempPassword 
}: PasswordModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>จัดการรหัสผ่านผู้ใช้งาน</DialogTitle>
          <DialogDescription>
            ระบบความปลอดภัยบัญชีของ: <span className="font-bold text-slate-900">{user?.first_name} {user?.last_name}</span>
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="py-2">
            {tempPassword ? (
              // ส่วนแสดงผลลัพธ์รหัสผ่านชั่วคราว
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex flex-col gap-3 items-center text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-xl">
                  ✓
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800">สร้างรหัสผ่านชั่วคราวสำเร็จ</h4>
                  <p className="text-xs text-emerald-600 mt-1">
                    กรุณาคัดลอกรหัสนี้ส่งให้ผู้ใช้ ระบบจะบังคับให้เปลี่ยนรหัสทันทีเมื่อล็อกอิน
                  </p>
                </div>
                <div className="bg-white px-4 py-2 border border-emerald-200 rounded-lg text-lg font-mono font-black text-slate-800 tracking-wider">
                  {tempPassword}
                </div>
              </div>
            ) : (
              // แผงตัวเลือกการรีเซ็ตรหัสผ่าน
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    การบังคับเปลี่ยนรหัสผ่าน จะมีผลระงับเซสชันการล็อกอินปัจจุบันทั้งหมด 
                    เพื่อป้องกันการเข้าใช้งานที่ไม่ได้รับอนุญาต
                  </span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 h-auto py-3 border-slate-300 hover:bg-slate-50"
                    onClick={() => setTempPassword("BMA-994xK-Reset")}
                  >
                    <Key className="w-5 h-5 text-amber-500 shrink-0" /> 
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-slate-700 text-sm">Force Password Change</span>
                      <span className="text-xs text-slate-500 font-normal mt-0.5">
                        สร้างรหัสผ่านชั่วคราว และบังคับเปลี่ยนเมื่อเข้าสู่ระบบครั้งถัดไป
                      </span>
                    </div>
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-3 h-auto py-3 border-slate-300 hover:bg-slate-50"
                    onClick={onClose}
                  >
                    <Edit2 className="w-5 h-5 text-blue-500 shrink-0" />
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-slate-700 text-sm">Send Reset Email Link</span>
                      <span className="text-xs text-slate-500 font-normal mt-0.5">
                        ส่งลิงก์เปลี่ยนรหัสผ่านอัตโนมัติไปยังอีเมลของบัญชีนี้
                      </span>
                    </div>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>ปิดหน้าต่าง</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};