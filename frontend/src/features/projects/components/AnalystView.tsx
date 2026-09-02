"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { AlertCircle, ClipboardCheck, Loader2, RotateCcw, Search, UserRound } from "lucide-react";
import { toast } from "sonner";
import { schemas } from "@/types/api-schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProjectPagination } from "./ProjectPagination";
import { useAnalystAssignedProjects, useAnalystDecision, useRequestAnalystReassignment } from "../hooks/useAnalystTasks";

type AnalystProject = z.infer<typeof schemas.AnalystAssignedProject>;
type Decision = "approve" | "return" | "reject";
type DialogMode = "reassign" | "decision" | null;

const statusLabels: Record<number, string> = {
  6: "อยู่ระหว่างการวิเคราะห์",
  7: "ส่งกลับแก้ไขโดยผู้วิเคราะห์",
  9: "รอพิจารณาโดยคณะกรรมการกลั่นกรอง",
  10: "ส่งกลับแก้ไขโดยคณะกรรมการกลั่นกรอง",
  12: "รอพิจารณาโดยคณะกรรมการนโยบาย",
  13: "ส่งกลับแก้ไขโดยคณะกรรมการนโยบาย",
};

function formatDate(value: unknown) {
  if (!value || typeof value !== "string" && !(value instanceof Date)) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function statusClass(statusId: number) {
  if (statusId === 6) return "border-blue-200 bg-blue-50 text-blue-700";
  if ([7, 10, 13].includes(statusId)) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function AnalystView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<AnalystProject | null>(null);
  const [mode, setMode] = useState<DialogMode>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [remark, setRemark] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const projectsQuery = useAnalystAssignedProjects({ page, limit: 20, search: debouncedSearch });
  const reassignmentMutation = useRequestAnalystReassignment();
  const decisionMutation = useAnalystDecision();
  const projects = useMemo(() => projectsQuery.data?.data ?? [], [projectsQuery.data?.data]);
  const pagination = projectsQuery.data?.pagination;
  const analysisCount = useMemo(() => projects.filter((project) => project.projectStatusId === 6).length, [projects]);
  const waitingCount = projects.filter((project) => [7, 10, 13].includes(project.projectStatusId)).length;

  const openDialog = (project: AnalystProject, nextMode: "reassign" | "decision") => {
    setSelectedProject(project);
    setMode(nextMode === "reassign" ? "reassign" : "decision");
    setDecision(null);
    setRemark("");
    setValidationError("");
  };

  const closeDialog = () => {
    if (reassignmentMutation.isPending || decisionMutation.isPending) return;
    setSelectedProject(null);
    setMode(null);
    setDecision(null);
    setRemark("");
    setValidationError("");
  };

  const submitAction = async () => {
    if (!selectedProject || !mode) return;
    const selectedDecision = decision;
    if (mode !== "reassign" && !selectedDecision) {
      setValidationError("กรุณาเลือกผลการวิเคราะห์");
      return;
    }
    const normalizedRemark = remark.trim();
    if (!normalizedRemark) {
      setValidationError("กรุณาระบุเหตุผลก่อนดำเนินการ");
      return;
    }
    setValidationError("");
    try {
      if (mode === "reassign") {
        await reassignmentMutation.mutateAsync({ projectId: selectedProject.id, payload: { reason: normalizedRemark } });
        toast.success("ส่งคำขอเปลี่ยนผู้รับผิดชอบแล้ว");
      } else {
        await decisionMutation.mutateAsync({
          projectId: selectedProject.id,
          payload: { decision: selectedDecision!, remark: normalizedRemark },
        });
        toast.success("บันทึกผลการวิเคราะห์แล้ว");
      }
      closeDialog();
    } catch (error) {
      const message = getErrorMessage(error, "ไม่สามารถบันทึกการดำเนินการได้");
      setValidationError(message);
      toast.error(message);
    }
  };

  const isPending = reassignmentMutation.isPending || decisionMutation.isPending;
  const dialogTitle = mode === "reassign"
    ? "ขอเปลี่ยนผู้รับผิดชอบโครงการ"
    : "ยืนยันผลการวิเคราะห์โครงการ";

  const decisionLabel = decision === "approve"
    ? "อนุมัติ"
    : decision === "return"
      ? "ส่งกลับแก้ไข"
      : decision === "reject"
        ? "ปฏิเสธ"
        : "ยืนยันการดำเนินการ";

  return (
    <main className="flex min-h-full w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">งานวิเคราะห์โครงการ</h1>
        <p className="mt-1 text-sm text-muted-foreground">ตรวจสอบ แก้ไข และพิจารณาโครงการที่ได้รับมอบหมาย</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-blue-200 bg-blue-50/40"><CardContent className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">อยู่ระหว่างการวิเคราะห์</p><p className="mt-1 text-2xl font-bold text-blue-700">{analysisCount} <span className="text-sm font-normal">โครงการ</span></p></div><ClipboardCheck className="size-6 text-blue-600" /></CardContent></Card>
        <Card className="border-amber-200 bg-amber-50/40"><CardContent className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">รอเจ้าของแก้ไข</p><p className="mt-1 text-2xl font-bold text-amber-700">{waitingCount} <span className="text-sm font-normal">โครงการ</span></p></div><RotateCcw className="size-6 text-amber-600" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between gap-4"><div><p className="text-sm text-muted-foreground">โครงการทั้งหมด</p><p className="mt-1 text-2xl font-bold text-primary">{pagination?.total ?? 0} <span className="text-sm font-normal">โครงการ</span></p></div><UserRound className="size-6 text-primary" /></CardContent></Card>
      </section>

      <Card className="min-h-0 flex-1">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>โครงการที่ได้รับมอบหมาย</CardTitle>
          <CardDescription>คลิกชื่อโครงการเพื่อเปิดรายละเอียดและแก้ไขข้อมูลในขอบเขตที่ได้รับอนุญาต</CardDescription>
        </CardHeader>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b p-4 sm:p-6">
            <div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อหรือรหัสโครงการ" className="pl-9" /></div>
            {projectsQuery.isFetching && <Loader2 className="size-4 animate-spin text-primary" />}
          </div>

          {projectsQuery.isError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center"><AlertCircle className="size-8 text-destructive" /><p className="font-semibold">ไม่สามารถโหลดรายการโครงการได้</p><p className="text-sm text-muted-foreground">{getErrorMessage(projectsQuery.error, "เกิดข้อผิดพลาดจากระบบ")}</p><Button variant="outline" onClick={() => projectsQuery.refetch()}>ลองใหม่</Button></div>
          ) : projectsQuery.isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div>
          ) : projects.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-12 text-center text-sm text-muted-foreground">ไม่มีโครงการที่ได้รับมอบหมาย</div>
          ) : (
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background"><TableRow><TableHead className="whitespace-nowrap">รหัสโครงการ</TableHead><TableHead className="min-w-64">ชื่อโครงการ</TableHead><TableHead className="whitespace-nowrap">หน่วยงาน</TableHead><TableHead className="whitespace-nowrap">สถานะ</TableHead><TableHead className="whitespace-nowrap">วันที่มอบหมาย</TableHead><TableHead className="text-right">การดำเนินการ</TableHead></TableRow></TableHeader>
                <TableBody>{projects.map((project) => {
                  const canAct = project.projectStatusId === 6;
                  return <TableRow key={project.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs">{project.projectCode ?? "-"}</TableCell>
                    <TableCell className="max-w-[360px]"><Link href={`/projects/${project.id}`} className="block truncate font-semibold transition-colors hover:text-primary">{project.projectName ?? "-"}</Link><span className="text-xs text-muted-foreground">{project.owner ? `${project.owner.firstName} ${project.owner.lastName}` : "-"}</span></TableCell>
                    <TableCell className="text-sm">{project.division?.departmentName ?? project.division?.name ?? "-"}</TableCell>
                    <TableCell><Badge variant="outline" className={statusClass(project.projectStatusId)}>{statusLabels[project.projectStatusId] ?? "ไม่ทราบสถานะ"}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(project.assignedAt)}</TableCell>
                    <TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" disabled={!canAct} onClick={() => openDialog(project, "reassign")}>ขอเปลี่ยนผู้รับผิดชอบ</Button><Button size="sm" disabled={!canAct} onClick={() => openDialog(project, "decision")}>พิจารณา</Button></div></TableCell>
                  </TableRow>;
                })}</TableBody>
              </Table>
            </div>
          )}
          {!projectsQuery.isLoading && pagination && <ProjectPagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />}
        </div>
      </Card>

      <Dialog open={Boolean(selectedProject)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-lg">
          <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle><DialogDescription>ตรวจสอบข้อมูลและเลือกผลการวิเคราะห์ให้ครบถ้วน</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4 text-sm"><p className="font-mono text-xs text-muted-foreground">{selectedProject?.projectCode ?? "-"}</p><p className="mt-2 font-semibold">{selectedProject?.projectName ?? "-"}</p></div>
            {mode !== "reassign" && (
              <div className="space-y-2">
                <Label>ผลการวิเคราะห์ *</Label>
                <RadioGroup value={decision ?? ""} onValueChange={(value) => setDecision(value as Decision)} aria-label="ผลการวิเคราะห์">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <label className="flex items-center gap-2 rounded-lg border p-3"><RadioGroupItem value="approve" />อนุมัติ</label>
                    <label className="flex items-center gap-2 rounded-lg border p-3"><RadioGroupItem value="return" />ส่งกลับแก้ไข</label>
                    <label className="flex items-center gap-2 rounded-lg border p-3"><RadioGroupItem value="reject" />ปฏิเสธ</label>
                  </div>
                </RadioGroup>
              </div>
            )}
            <div className="space-y-2"><Label htmlFor="analyst-action-remark">เหตุผล/ความคิดเห็น *</Label><Textarea id="analyst-action-remark" value={remark} onChange={(event) => setRemark(event.target.value)} rows={5} placeholder="กรุณาระบุเหตุผลหรือความคิดเห็น" /></div>
            {validationError && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{validationError}</p>}
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row"><Button variant="outline" className="w-full sm:w-auto" disabled={isPending} onClick={closeDialog}>ยกเลิก</Button><Button variant={decision === "reject" ? "destructive" : "default"} className="w-full sm:w-auto" disabled={isPending || mode !== "reassign" && (!decision || !remark.trim())} onClick={() => void submitAction()}>{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}{mode === "reassign" ? "ส่งคำขอ" : decisionLabel}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
