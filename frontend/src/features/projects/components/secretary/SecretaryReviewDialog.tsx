"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { schemas } from "@/types/api-schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useReviewSecretaryProject,
  useSecretaryProjectTypes,
} from "../../hooks/useSecretaryVerification";
import type { SecretaryReviewPayload } from "../../actions/project.actions";

type Project = z.infer<typeof schemas.Project>;
type ReviewMode = "approve" | "return" | "reject" | null;

type SecretaryReviewDialogProps = {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function SecretaryReviewDialog({
  project,
  open,
  onOpenChange,
}: SecretaryReviewDialogProps) {
  const [mode, setMode] = useState<ReviewMode>(null);
  const [projectTypeId, setProjectTypeId] = useState("");
  const [remark, setRemark] = useState("");
  const [validationError, setValidationError] = useState("");
  const reviewMutation = useReviewSecretaryProject();
  const projectTypesQuery = useSecretaryProjectTypes();

  const allowedProjectTypes = useMemo(
    () => (projectTypesQuery.data?.data ?? []).filter((type) => {
      const name = type.name.trim().toLowerCase();
      return name === "hardware" || name === "software";
    }),
    [projectTypesQuery.data],
  );

  const chooseMode = (nextMode: Exclude<ReviewMode, null>) => {
    setMode(nextMode);
    setValidationError("");
  };

  const submitReview = async () => {
    if (!project || !mode) return;

    let payload: SecretaryReviewPayload;
    if (mode === "approve") {
      const parsedTypeId = Number(projectTypeId);
      if (!Number.isInteger(parsedTypeId) || parsedTypeId <= 0) {
        setValidationError("กรุณาเลือกประเภทโครงการก่อนอนุมัติ");
        return;
      }
      payload = { decision: "approve", projectTypeId: parsedTypeId };
    } else {
      const normalizedRemark = remark.trim();
      if (!normalizedRemark) {
        setValidationError("กรุณาระบุเหตุผลก่อนดำเนินการ");
        return;
      }
      payload = { decision: mode, remark: normalizedRemark };
    }

    setValidationError("");
    try {
      await reviewMutation.mutateAsync({ projectId: project.id, payload });
      onOpenChange(false);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "ไม่สามารถบันทึกผลการตรวจสอบได้");
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setMode(null);
      setProjectTypeId("");
      setRemark("");
      setValidationError("");
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] max-w-[calc(100%-1rem)] overflow-y-auto p-4 sm:max-w-lg sm:p-6 md:max-w-2xl">
        <DialogHeader>
          <div className="flex min-w-0 items-start gap-3 pr-8">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-xl">ตรวจสอบโครงการ</DialogTitle>
              <DialogDescription className="mt-1">
                ตรวจสอบข้อมูลและเลือกผลการดำเนินการสำหรับโครงการนี้
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {project && (
          <div className="space-y-5">
            <section className="min-w-0 rounded-md border bg-muted/30 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="break-all font-mono text-xs font-semibold text-muted-foreground">
                  {project.projectCode ?? "ไม่มีรหัสโครงการ"}
                </span>
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                  รอตรวจสอบโดยเลขานุการ
                </Badge>
              </div>
              <h3 className="mt-3 break-words text-lg font-semibold text-foreground">
                {project.projectName ?? "ไม่ระบุชื่อโครงการ"}
              </h3>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">ผู้เสนอโครงการ</p>
                  <p className="break-words font-medium">
                    {project.owner
                      ? `${project.owner.firstName} ${project.owner.lastName}`.trim()
                      : "-"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">หน่วยงาน</p>
                  <p className="break-words font-medium">{project.division?.departmentName ?? "-"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">ส่วนงาน</p>
                  <p className="break-words font-medium">{project.division?.name ?? "-"}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">วันที่ส่งโครงการ</p>
                  <p className="font-medium">{formatDate(project.createdAt)}</p>
                </div>
              </div>
              <Button asChild variant="link" className="mt-3 h-auto px-0 text-primary">
                <Link href={`/projects/${project.id}`} target="_blank" rel="noreferrer">
                  <span className="text-primary hover:text-green-900">เปิดรายละเอียดโครงการฉบับเต็ม</span>
                </Link>
              </Button>
            </section>

            <section className="space-y-1">
              <p className="mb-3 text-sm font-semibold">เลือกการดำเนินการ</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Button
                  type="button"
                  variant={mode === "approve" ? "default" : "outline"}
                  className="h-auto justify-start gap-2 py-3 sm:flex-col sm:justify-center"
                  onClick={() => chooseMode("approve")}
                >
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <span>อนุมัติและจัดประเภท</span>
                </Button>
                <Button
                  type="button"
                  variant={mode === "return" ? "default" : "outline"}
                  className="h-auto justify-start gap-2 py-3 sm:flex-col sm:justify-center"
                  onClick={() => chooseMode("return")}
                >
                  <RotateCcw className="size-5 text-amber-600" />
                  <span>ส่งกลับแก้ไข</span>
                </Button>
                <Button
                  type="button"
                  variant={mode === "reject" ? "destructive" : "outline"}
                  className="h-auto justify-start gap-2 py-3 sm:flex-col sm:justify-center"
                  onClick={() => chooseMode("reject")}
                >
                  <XCircle className="size-5" />
                  <span>ไม่อนุมัติ</span>
                </Button>
              </div>
            </section>

            {mode === "approve" && (
              <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50/50 p-4">
                <Label htmlFor="secretary-project-type">ประเภทโครงการ *</Label>
                <Select value={projectTypeId} onValueChange={setProjectTypeId}>
                  <SelectTrigger id="secretary-project-type" className="bg-background">
                    <SelectValue placeholder="เลือกฮาร์ดแวร์หรือซอฟต์แวร์" />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedProjectTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name.trim().toLowerCase() === "hardware" ? "ฮาร์ดแวร์" : "ซอฟต์แวร์"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {projectTypesQuery.isLoading && (
                  <p className="text-xs text-muted-foreground">กำลังโหลดประเภทโครงการ...</p>
                )}
                {!projectTypesQuery.isLoading && allowedProjectTypes.length === 0 && (
                  <p className="text-xs text-destructive">ไม่พบประเภทฮาร์ดแวร์หรือซอฟต์แวร์ในระบบ</p>
                )}
              </div>
            )}

            {(mode === "return" || mode === "reject") && (
              <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                <Label htmlFor="secretary-review-remark">
                  {mode === "return" ? "เหตุผลการส่งกลับแก้ไข" : "เหตุผลการไม่อนุมัติ"} *
                </Label>
                <Textarea
                  id="secretary-review-remark"
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  placeholder="กรุณาระบุเหตุผล"
                  rows={4}
                  className="bg-background"
                />
              </div>
            )}

            {validationError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="w-full border-t pt-4 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleOpenChange(false)}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            variant={mode === "reject" ? "destructive" : "default"}
            className="w-full sm:w-auto"
            disabled={!project || !mode || reviewMutation.isPending}
            onClick={submitReview}
          >
            {reviewMutation.isPending ? "กำลังบันทึก..." : "ยืนยันการดำเนินการ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
