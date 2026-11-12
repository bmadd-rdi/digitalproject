import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TimelineTabContent() {
  return (
    <Card className="rounded-md border-[#D1CDC7] shadow-sm bg-white">
      <CardContent className="p-12 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 bg-slate-50 rounded-md flex items-center justify-center mb-4 border border-slate-200">
          <History className="w-7 h-7 text-slate-300" />
        </div>
        <h3 className="text-base font-bold text-slate-700">
          ประวัติการดำเนินงานและมติที่ประชุม
        </h3>
        <p className="text-sm text-slate-500 mt-1 max-w-md">
          ประวัติการดำเนินงานและมติที่ประชุมจะแสดงที่นี่
          เมื่อโครงการเข้าสู่ขั้นตอนการพิจารณา
        </p>
      </CardContent>
    </Card>
  );
}
