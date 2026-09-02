"use client"; // มั่นใจว่าเป็น Client Component เพื่อให้ทำงานกับ Toast ได้

import { Badge } from "@/components/ui/badge";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BluetoothIcon } from "lucide-react";
import { toast } from "sonner";

export default function TypographyPage() {
  // ฟังก์ชันจำลองสำหรับการทดสอบ Toast แบบ Promise (Loading -> Success/Error)
  const handlePromiseToast = () => {
    const myPromise = new Promise<{ name: string }>((resolve) => {
      setTimeout(() => resolve({ name: "ข้อมูลโครงการ" }), 2000); // จำลองโหลด 2 วินาที
    });

    toast.promise(myPromise, {
      loading: "กำลังดาวน์โหลดข้อมูล...",
      success: (data: any) => `โหลด ${data.name} สำเร็จเรียบร้อย!`,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
    });
  };

  return (
    <div className="p-8 space-y-6 border">
      <div className="p-8 space-y-6 border">
        <h1 className="text-4xl font-bold">Typography Page</h1>
        <p className="text-lg">
          นี่คือตัวอย่างหน้า Typography ที่ใช้ฟอนต์ Noto Sans Thai
        </p>
        <p className="text-sm text-gray-500">
          ฟอนต์นี้ถูกนำเข้าจาก Google Fonts และตั้งค่าใน RootLayout
        </p>
      </div>

      {/* --- Section: Buttons --- */}
      <section className="space-y-4 flex flex-col border p-8">
        <h2 className="text-2xl font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button className="w-auto">Default</Button>
          <Button className="w-auto" variant="outline">Outline</Button>
          <Button className="w-auto" variant="secondary">Secondary</Button>
          <Button className="w-auto" variant="ghost">Ghost</Button>
          <Button className="w-auto" variant="link">Link</Button>
          <Button className="w-auto" variant="destructive">Destructive</Button>
          <Button className="w-auto" variant="soft">Soft</Button>
        </div>
      </section>

      {/* --- Section: Badges --- */}
      <section className="space-y-4 flex flex-col border p-8">
        <div className="flex flex-row space-x-4 ">
          <Badge variant="default">Default</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      {/* --- Section: Checkbox --- */}
      <section className="space-y-4 flex flex-col border p-8">
        <h2 className="text-2xl font-semibold">Checkbox</h2>
        <div className="flex flex-row space-x-4 ">
          <Checkbox></Checkbox>
          <Checkbox defaultChecked></Checkbox>
          <Checkbox disabled></Checkbox>
          <Checkbox defaultChecked disabled></Checkbox>
        </div>
      </section>

      {/* --- Section: Radio Group --- */}
      <section className="space-y-4 flex flex-col border p-8">
        <h2 className="text-2xl font-semibold">Radio Group</h2>
        <div className="flex flex-row space-x-4 ">
          <RadioGroup defaultValue="comfortable" className="w-fit">
            <div className="flex items-center gap-3">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">Default</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="comfortable" id="r2" />
              <Label htmlFor="r2">Comfortable</Label>
            </div>
            <div className="flex items-center gap-3">
              <RadioGroupItem value="compact" id="r3" />
              <Label htmlFor="r3">Compact</Label>
            </div>
          </RadioGroup>
        </div>
      </section>

      {/* --- Section: Alert Dialogs --- */}
      <section className="space-y-4 flex flex-col border p-8">
        <h2 className="text-2xl font-semibold">Alert Dialogs</h2>
        <div className="flex flex-row space-x-4 ">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Show Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary">Show Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <BluetoothIcon />
                </AlertDialogMedia>
                <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                <AlertDialogDescription>
                  Do you want to allow the USB accessory to connect to this device?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                <AlertDialogAction>Allow</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* ✅ เพิ่ม Section นี้: เคสการทดสอบสีและสถานะของ Toast ทั้งหมด */}
      <section className="space-y-4 flex flex-col border p-8 bg-slate-50/50 rounded-lg">
        <h2 className="text-2xl font-semibold text-foreground">Toast Notifications (Sonner)</h2>
        <p className="text-sm text-muted-foreground">คลิกปุ่มด้านล่างเพื่อทดสอบการแสดงผลสีสันและสไตล์ของข้อความแจ้งเตือนในแต่ละรูปแบบ</p>

        <div className="flex flex-wrap gap-4 mt-2">
          {/* 1. Default Toast */}
          <Button
            variant="outline"
            onClick={() => toast("นี่คือข้อความแจ้งเตือนแบบทั่วไป (Default)")}
          >
            Trigger Default
          </Button>

          {/* 2. Success Toast (สีเขียว) */}
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => toast.success("บันทึกข้อมูลสำเร็จ!", {
              description: "ระบบได้ทำการอัปเดตร่างข้อเสนอโครงการเรียบร้อยแล้ว",
            })}
          >
            Trigger Success
          </Button>

          {/* 3. Error Toast (สีแดง) */}
          <Button
            variant="destructive"
            onClick={() => toast.error("เกิดข้อผิดพลาดในการบันทึก", {
              description: "ตรวจพบรหัสโครงการซ้ำในระบบ กรุณาลองใหมู่อีกครั้ง",
            })}
          >
            Trigger Error
          </Button>

          {/* 4. Warning Toast (สีส้ม/เหลือง) */}
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => toast.warning("คำเตือน: เซสชันใกล้หมดอายุ", {
              description: "กรุณาบันทึกแบบร่างก่อนที่ระบบจะล็อกเอาต์ในอีก 5 นาที",
            })}
          >
            Trigger Warning
          </Button>

          {/* 5. Info Toast (สีฟ้า) */}
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => toast.info("ข้อมูลระบบเพิ่มเติม", {
              description: "ระบบฐานข้อมูลจะทำการปิดปรับปรุงชั่วคราวเวลา 23:00 น.",
            })}
          >
            Trigger Info
          </Button>

          {/* 6. Toast with Action Button (ปุ่มกดทำงานต่อได้) */}
          <Button
            variant="secondary"
            onClick={() => toast("ลบโครงการเรียบร้อยแล้ว", {
              action: {
                label: "เลิกทำ (Undo)",
                onClick: () => console.log("กู้คืนข้อมูลโครงการ..."),
              },
            })}
          >
            Trigger Action Button
          </Button>

          {/* 7. Promise Toast (มีสถานะ Loading หมุนๆ ก่อนเปลี่ยนเป็นความสำเร็จ) */}
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handlePromiseToast}
          >
            Trigger Promise Async
          </Button>
        </div>
      </section>
    </div>
  );
}
