// src/components/custom/user-menu.tsx
"use client";
import { useTransition } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/auth.actions";

export function UserMenu() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
      // ใช้ startTransition เพื่อครอบการทำงานของ Server Action ใน Client Component
      startTransition(async () => {
        await logoutAction();
      });
    };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* ใช้ Button ครอบเพื่อให้สามารถกดและมีเอฟเฟกต์โฮเวอร์ได้สวยงาม */}
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-10 w-10 border border-border">
            {/* ใส่รูปภาพประจำตัวผู้ใช้ (ในโฟลเดอร์ public/pics มีรูป man.webp อยู่สามารถทดสอบใช้ได้ครับ) */}
            <AvatarImage src="/pics/man.webp" alt="User Profile" />
            <AvatarFallback className="bg-primary-container text-primary-dark font-bold">
              BMA
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* หัวข้อแสดงข้อมูลผู้ใช้เบื้องต้น */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">นายสมชาย ใจดี</p>
            <p className="text-xs leading-none text-muted-foreground">
              somchay.j@bangkok.go.th
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* เมนูเชื่อมโยงไปยังหน้าต่างๆ */}
        <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>โปรไฟล์ของฉัน</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push("/profile/edit")} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>ตั้งค่าระบบ</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* ปุ่มออกจากระบบ (ตกแต่งสีส้มตามดีไซน์ของโครงการ) */}
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isPending}
          className="text-status-orange focus:text-status-orange focus:bg-red-50 cursor-pointer font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isPending ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
