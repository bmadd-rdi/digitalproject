"use client";
// src/features/meetings/components/ResolutionForm.tsx
// ฟอร์มบันทึกมติ — Resolution status selector, comment textarea, project preview Sheet

import { useCallback } from "react";
import {
  FileSignature,
  Eye,
  Save,
  Loader2,
  FolderOpen,
  Building2,
  Banknote,
  CalendarDays,
  Target,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  type Agenda,
  type Resolution,
  ResolutionStatus,
  RESOLUTION_STATUS_LABELS,
  RESOLUTION_STATUS_COLORS,
  AGENDA_TYPE_LABELS,
} from "../types";
import { useState } from "react";

interface ResolutionFormProps {
  agenda: Agenda | null;
  resolution: Resolution | null;
  isConsideration: boolean;
  onUpdateStatus: (status: ResolutionStatus | null) => void;
  onUpdateComment: (comment: string) => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

const STATUS_ICONS: Record<ResolutionStatus, React.ReactNode> = {
  [ResolutionStatus.APPROVED]: <CheckCircle2 className="w-4 h-4" />,
  [ResolutionStatus.ACKNOWLEDGED]: <CheckCircle2 className="w-4 h-4" />,
  [ResolutionStatus.CONDITIONAL_APPROVAL]: <AlertTriangle className="w-4 h-4" />,
  [ResolutionStatus.RECONSIDER]: <AlertTriangle className="w-4 h-4" />,
  [ResolutionStatus.NOT_APPROVED]: <XCircle className="w-4 h-4" />,
  [ResolutionStatus.NOT_CONSIDERED]: <XCircle className="w-4 h-4" />,
};

export function ResolutionForm({
  agenda,
  resolution,
  isConsideration,
  onUpdateStatus,
  onUpdateComment,
  onSave,
  isSaving,
  hasUnsavedChanges,
}: ResolutionFormProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const requiresRemark = resolution?.resolution_status === ResolutionStatus.CONDITIONAL_APPROVAL ||
    resolution?.resolution_status === ResolutionStatus.RECONSIDER ||
    resolution?.resolution_status === ResolutionStatus.NOT_APPROVED ||
    resolution?.resolution_status === ResolutionStatus.NOT_CONSIDERED;
  const hasRequiredRemark = (resolution?.comment ?? "").trim().length > 0;

  const formatBudget = useCallback((amount: number) => {
    return new Intl.NumberFormat("th-TH").format(amount);
  }, []);

  // ── Empty State ──
  if (!agenda) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
          <FileSignature className="w-10 h-10 text-slate-200" />
        </div>
        <p className="font-bold text-slate-500 text-lg">เลือกวาระเพื่อบันทึกมติ</p>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          คลิกที่วาระการประชุมทางด้านซ้ายเพื่อเริ่มบันทึกมติและข้อเสนอแนะ
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="p-5 border-b border-[#ededf4] bg-[#f9f9ff] space-y-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs text-muted-foreground bg-white px-2 py-0.5 rounded-md font-bold border">
            วาระที่ {agenda.agenda_number}
          </span>
          <Badge variant="outline" className="text-[10px] font-bold">
            {AGENDA_TYPE_LABELS[agenda.agenda_type]}
          </Badge>
        </div>
        <h3 className="font-bold text-[#191c20] text-base leading-snug">
          {agenda.title}
        </h3>
        {agenda.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {agenda.description}
          </p>
        )}

        {/* Project Preview Button */}
        {agenda.project && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-[#00734b] border-[#00734b]/30 hover:bg-[#00734b]/5 hover:text-[#00734b] rounded-lg text-xs"
            onClick={() => setSheetOpen(true)}
          >
            <Eye className="w-3.5 h-3.5" />
            ดูรายละเอียดโครงการ
          </Button>
        )}
      </div>

      {/* ── Form Body ── */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Resolution Status — only for consideration agendas */}
        {isConsideration && (
          <div className="space-y-2">
            <label
              htmlFor="resolution-status"
              className="text-sm font-bold text-[#191c20] flex items-center gap-1.5"
            >
              <FileSignature className="w-4 h-4 text-muted-foreground" />
              มติที่ประชุม
            </label>
            <Select
              value={resolution?.resolution_status ?? "NO_STATUS"}
              onValueChange={(val) =>
                onUpdateStatus(
                  val === "NO_STATUS" ? null : (val as ResolutionStatus)
                )
              }
            >
              <SelectTrigger id="resolution-status" className="bg-white">
                <SelectValue placeholder="เลือกมติ..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NO_STATUS">
                  <span className="text-muted-foreground">— ยังไม่ได้บันทึก —</span>
                </SelectItem>
                {Object.values(ResolutionStatus).map((status) => {
                  const colors = RESOLUTION_STATUS_COLORS[status];
                  return (
                    <SelectItem key={status} value={status}>
                      <span className="flex items-center gap-2">
                        <span className={colors.text}>{STATUS_ICONS[status]}</span>
                        {RESOLUTION_STATUS_LABELS[status]}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Status preview badge */}
            {resolution?.resolution_status && (
              <div className="pt-1">
                <Badge
                  variant="outline"
                  className={`${RESOLUTION_STATUS_COLORS[resolution.resolution_status].bg} ${RESOLUTION_STATUS_COLORS[resolution.resolution_status].text} ${RESOLUTION_STATUS_COLORS[resolution.resolution_status].border} font-bold text-xs px-3 py-1`}
                >
                  {STATUS_ICONS[resolution.resolution_status]}
                  {RESOLUTION_STATUS_LABELS[resolution.resolution_status]}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Comment / Minutes */}
        <div className="space-y-2">
          <label
            htmlFor="resolution-comment"
            className="text-sm font-bold text-[#191c20] flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-muted-foreground" />
            {isConsideration
              ? "ข้อเสนอแนะ / เงื่อนไข"
              : "บันทึกรายงานการประชุม"}
          </label>
          <Textarea
            id="resolution-comment"
            placeholder={
              isConsideration
                ? "บันทึกข้อเสนอแนะ เงื่อนไข หรือรายละเอียดเพิ่มเติมของมติ..."
                : "บันทึกสรุปสาระสำคัญของวาระนี้..."
            }
            value={resolution?.comment ?? ""}
            onChange={(e) => onUpdateComment(e.target.value)}
            className="min-h-[150px] bg-white resize-y leading-relaxed"
          />
          {requiresRemark && !hasRequiredRemark && (
            <p className="text-xs text-red-600">กรุณาระบุเหตุผลสำหรับมติส่งกลับหรือไม่เห็นชอบ</p>
          )}
          <p className="text-[10px] text-muted-foreground text-right">
            {(resolution?.comment ?? "").length} ตัวอักษร
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="p-4 border-t border-[#ededf4] bg-[#f9f9ff] shrink-0 flex items-center justify-between">
        {hasUnsavedChanges && (
          <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
          </span>
        )}
        {!hasUnsavedChanges && <span />}
        <Button
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges || (requiresRemark && !hasRequiredRemark)}
          className="gap-1.5 bg-[#00734b] hover:bg-[#005838] text-white rounded-lg"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "กำลังบันทึก..." : "บันทึกมติ"}
        </Button>
      </div>

      {/* ── Project Preview Sheet (Side Drawer) ── */}
      {agenda.project && (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-base">
                <FolderOpen className="w-5 h-5 text-[#00734b]" />
                รายละเอียดโครงการ
              </SheetTitle>
              <SheetDescription>
                ข้อมูลโครงการที่เชื่อมโยงกับวาระการประชุมนี้
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5 pt-4 px-4 pb-8">
              {/* Project Code */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground bg-slate-100 px-3 py-1 rounded-lg border">
                  {agenda.project.project_code}
                </span>
                <Badge variant="outline" className="text-[11px] font-bold">
                  {agenda.project.status}
                </Badge>
              </div>

              {/* Project Name */}
              <div>
                <h4 className="font-bold text-lg text-[#191c20] leading-snug">
                  {agenda.project.name}
                </h4>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid gap-4">
                <DetailRow
                  icon={<Building2 className="w-4 h-4 text-muted-foreground" />}
                  label="หน่วยงาน"
                  value={agenda.project.agency}
                />
                <DetailRow
                  icon={<Banknote className="w-4 h-4 text-muted-foreground" />}
                  label="งบประมาณ"
                  value={`${formatBudget(agenda.project.budget)} บาท`}
                  highlight
                />
                <DetailRow
                  icon={<CalendarDays className="w-4 h-4 text-muted-foreground" />}
                  label="ระยะเวลา"
                  value={`${agenda.project.start_date} — ${agenda.project.end_date}`}
                />
              </div>

              <Separator />

              {/* Objective */}
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-[#191c20] flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  วัตถุประสงค์
                </h5>
                <p className="text-sm text-[#3f4942] leading-relaxed bg-slate-50 rounded-lg p-3 border">
                  {agenda.project.objective}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-[#191c20] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  รายละเอียดโครงการ
                </h5>
                <p className="text-sm text-[#3f4942] leading-relaxed bg-slate-50 rounded-lg p-3 border">
                  {agenda.project.description}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

// ── Detail Row ──
function DetailRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`text-sm font-semibold ${highlight ? "text-[#00734b]" : "text-[#191c20]"}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
