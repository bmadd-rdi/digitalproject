"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Building2, CalendarDays, Send, Briefcase, Target, Pencil, Eye, EyeOff, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectDetail } from "../../types/workspace";
import { useFourQuadrants, useDeputyGovernors } from "@/features/lookups/hooks/useLookups";
import { useProposalState } from "@/features/proposals/hooks/useProposalState";
import { useGetDraft } from "@/features/proposals/hooks/useProposalDraftQuery";
import { useSubmitProposal } from "@/features/proposals/hooks/useProposalMutations";
import type { ProposalDraftValues } from "@/features/proposals/types";
import { ProposalExportButton } from "@/features/proposals/components/ProposalExportButton";
import {
  useCancelSubmitProject,
  useDeleteProject,
  useUpdateProjectVisibility,
  useReopenRejectedProject,
} from "../../hooks/useProjectMutations";
import { getProjectStatusMeta } from "../../utils/projectStatus";
import { ReturnedFeedbackBanner } from "./ReturnedFeedbackBanner";
import { ProjectDetailsEditDialog } from "./ProjectDetailsEditDialog";
import { useHasRole } from "@/features/auth/RoleContext";

type HeaderProposal = {
  budgetsByYear?: Array<{ year?: number | string | null }>;
};

interface ProjectHeaderProps {
  project: ProjectDetail;
  proposal?: HeaderProposal;
}

const fallbackError = "ระบบไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง";

export function ProjectHeader({ project, proposal }: ProjectHeaderProps) {
  const router = useRouter();
  const projectId = String(project.id);
  const proposalState = useProposalState(projectId, {
    preferEditableDraft: project.permissions?.canSubmitProposal === true,
  });
  const { data: currentDraft, isLoading: isDraftLoading } = useGetDraft(projectId);
  const { mutate: submitProposal, isPending: isSubmitting } = useSubmitProposal(projectId);
  const deleteMutation = useDeleteProject(projectId);
  const cancelSubmitMutation = useCancelSubmitProject(projectId);
  const visibilityMutation = useUpdateProjectVisibility(projectId);
  const reopenMutation = useReopenRejectedProject(projectId);
  const isSuperAdmin = useHasRole("super_admin");
  const [submitConfirmOpen, setSubmitConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cancelSubmitConfirmOpen, setCancelSubmitConfirmOpen] = useState(false);
  const [visibilityConfirmOpen, setVisibilityConfirmOpen] = useState(false);
  const [editDetailsOpen, setEditDetailsOpen] = useState(false);
  const canSubmitProposal = project.permissions?.canSubmitProposal === true;
  const isSubmitDisabled = isDraftLoading || isSubmitting || !currentDraft || !canSubmitProposal;
  const statusMeta = getProjectStatusMeta(project.projectStatusId, project.status?.name);
  const exportableProposal = proposalState.status === "draft" || proposalState.status === "submitted"
    ? proposalState.data
    : null;

  const { data: quadrantsRes } = useFourQuadrants();
  const { data: governorsRes } = useDeputyGovernors();
  const quadrants = quadrantsRes?.data || [];
  const governors = governorsRes?.data || [];

  const agencyName = project.division?.departmentName
    ? `${project.division.departmentName} (${project.division.name})`
    : (project.division?.name || "ไม่ระบุหน่วยงาน");
  const matchedGovernor = governors.find((governor) => governor.id === project.deputyGovernorId);
  const deputyGovernorName = project.deputyGovernorId
    ? matchedGovernor?.name || `รหัส ${project.deputyGovernorId}`
    : "ยังไม่ระบุ";
  const matchedQuadrant = quadrants.find((quadrant) => quadrant.id === project.fourQuadrantsId);
  const fourQuadrantsName = project.fourQuadrantsId
    ? matchedQuadrant?.name || `รหัส ${project.fourQuadrantsId}`
    : "ยังไม่ระบุ";
  const fiscalYear = proposal?.budgetsByYear?.[0]?.year
    ? `พ.ศ. ${proposal.budgetsByYear[0].year}`
    : "ยังไม่ระบุ";

  const handleSubmit = () => {
    if (!currentDraft) {
      toast.error("ยังไม่สามารถส่งโครงการได้", { description: "กำลังโหลดแบบร่างอยู่ กรุณารอสักครู่" });
      return;
    }
    setSubmitConfirmOpen(true);
  };

  const confirmSubmit = () => {
    if (!currentDraft) return;
    submitProposal(currentDraft, {
      onSuccess: () => setSubmitConfirmOpen(false),
      onError: () => toast.error("ส่งโครงการไม่สำเร็จ", { description: fallbackError }),
    });
  };

  return (
    <div className="mb-6 space-y-4">
      <button
        onClick={() => router.push("/projects")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#00734b]"
      >
        <ArrowLeft className="h-4 w-4" />
        กลับไปหน้ารวมโครงการ
      </button>

      <Card className="rounded-md border-[#D1CDC7] bg-white shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={`${statusMeta.className} rounded-md px-2.5 py-0.5 text-[11px] font-bold`}
                >
                  {statusMeta.label}
                </Badge>
                <span className="break-all rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-500">
                  {project.projectCode || "รอการสร้างรหัสโครงการ"}
                </span>
              </div>

              <h1 className="break-words text-xl font-extrabold leading-snug tracking-tight text-[#191c20] sm:text-2xl md:text-3xl">
                {project.projectName || "ไม่ระบุชื่อโครงการ"}
              </h1>

              <div className="grid grid-cols-1 gap-6 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-bold tracking-widest text-slate-400">หน่วยงานที่รับผิดชอบ</p>
                  <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#191c20]">
                    <div className="shrink-0 rounded-md bg-[#00734b]/10 p-1.5"><Building2 className="h-4 w-4 text-[#00734b]" /></div>
                    <span className="break-words" title={agencyName}>{agencyName}</span>
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-bold tracking-widest text-slate-400">ผู้บริหารที่กำกับดูแล</p>
                  <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#191c20]">
                    <div className="shrink-0 rounded-md bg-[#00734b]/10 p-1.5"><Briefcase className="h-4 w-4 text-[#00734b]" /></div>
                    <span className="break-words" title={deputyGovernorName}>{deputyGovernorName}</span>
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-bold tracking-widest text-slate-400">กรอบยุทธศาสตร์ 4 ด้าน</p>
                  <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-[#191c20]">
                    <div className="shrink-0 rounded-md bg-[#00734b]/10 p-1.5"><Target className="h-4 w-4 text-[#00734b]" /></div>
                    <span className="break-words" title={fourQuadrantsName}>{fourQuadrantsName}</span>
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-bold tracking-widest text-slate-400">ปีงบประมาณ</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-[#191c20]">
                    <div className="shrink-0 rounded-md bg-[#00734b]/10 p-1.5"><CalendarDays className="h-4 w-4 text-[#00734b]" /></div>
                    {fiscalYear}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-full shrink-0 flex-col items-stretch gap-2 xl:w-auto xl:self-start">
              {exportableProposal && (
                <ProposalExportButton
                  proposal={exportableProposal as ProposalDraftValues}
                  className="gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                />
              )}
              {isSuperAdmin && [11, 14].includes(project.projectStatusId ?? -1) && (
                <Button
                  variant="outline"
                  disabled={reopenMutation.isPending}
                  className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={async () => {
                    const reason = window.prompt("กรุณาระบุเหตุผลที่เปิดโครงการกลับมาแก้ไข");
                    if (!reason?.trim()) return;
                    try {
                      await reopenMutation.mutateAsync(reason.trim());
                      toast.success("เปิดโครงการกลับมาแก้ไขสำเร็จ");
                    } catch (error) {
                      toast.error("ไม่สามารถเปิดโครงการกลับมาแก้ไขได้", {
                        description: error instanceof Error ? error.message : undefined,
                      });
                    }
                  }}
                >
                  <RotateCcw className="size-4" />
                  {reopenMutation.isPending ? "กำลังดำเนินการ..." : "เปิดโครงการกลับมาแก้ไข"}
                </Button>
              )}
              {project.permissions?.canEditProject && (
                <Button
                  variant="outline"
                  onClick={() => setEditDetailsOpen(true)}
                  className="gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                >
                  <Pencil className="h-4 w-4" />
                  เปลี่ยนชื่อโครงการ
                </Button>
              )}
              {project.permissions?.canChangeVisibility && (
                <Button
                  variant="outline"
                  disabled={visibilityMutation.isPending}
                  onClick={() => setVisibilityConfirmOpen(true)}
                  className="gap-2 rounded-xl border-slate-300"
                >
                  {project.isPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {visibilityMutation.isPending
                    ? "กำลังบันทึก..."
                    : project.isPublic ? "ยกเลิกการเผยแพร่" : "เผยแพร่โครงการ"}
                </Button>
              )}
              {project.permissions?.canCancelSubmit && (
                <Button
                  variant="outline"
                  disabled={cancelSubmitMutation.isPending}
                  onClick={() => setCancelSubmitConfirmOpen(true)}
                  className="gap-2 rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  {cancelSubmitMutation.isPending ? "กำลังคืนแบบร่าง..." : "ยกเลิกการส่ง"}
                </Button>
              )}
              {proposalState.status === "draft" && canSubmitProposal && (
                <Button
                  disabled={isSubmitDisabled}
                  onClick={handleSubmit}
                  className="h-11 w-full gap-2 rounded-xl bg-primary px-6 font-bold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-95 xl:w-auto"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "กำลังส่งโครงการ..." : "ส่งโครงการเข้ารับการพิจารณา"}
                </Button>
              )}
              {project.permissions?.canDelete && (
                <Button
                  variant="outline"
                  disabled={deleteMutation.isPending}
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="h-10 w-full rounded-xl border-red-200 text-red-700 hover:bg-red-50 xl:w-auto"
                >
                  {deleteMutation.isPending ? "กำลังลบโครงการ..." : "ลบโครงการ"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ReturnedFeedbackBanner project={project} />

      {project.permissions?.canEditProject && (
        <ProjectDetailsEditDialog project={project} open={editDetailsOpen} onOpenChange={setEditDetailsOpen} />
      )}

      <AlertDialog open={submitConfirmOpen} onOpenChange={setSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการส่งโครงการหรือไม่</AlertDialogTitle>
            <AlertDialogDescription>
              เมื่อส่งแล้ว โครงการจะเข้าสู่กระบวนการตรวจสอบ และจะไม่สามารถแก้ไขได้จนกว่าจะมีการส่งกลับเพื่อแก้ไข
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "กำลังส่งโครงการ..." : "ยืนยันการส่ง"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelSubmitConfirmOpen} onOpenChange={setCancelSubmitConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการยกเลิกการส่งโครงการหรือไม่</AlertDialogTitle>
            <AlertDialogDescription>
              ระบบจะคืนข้อมูลข้อเสนอที่ส่งแล้วเป็นแบบร่างให้คุณแก้ไข และโครงการจะกลับไปอยู่ในสถานะแบบร่าง
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ไม่ใช่</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelSubmitMutation.isPending}
              onClick={() => {
                cancelSubmitMutation.mutate(undefined, {
                  onSuccess: () => setCancelSubmitConfirmOpen(false),
                  onError: () => toast.error("ยกเลิกการส่งไม่สำเร็จ", {
                    description: "สถานะโครงการอาจเปลี่ยนแล้ว กรุณารีเฟรชหน้าเพื่อดูสถานะล่าสุด",
                  }),
                });
              }}
            >
              {cancelSubmitMutation.isPending ? "กำลังคืนแบบร่าง..." : "ยืนยันการยกเลิกการส่ง"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={visibilityConfirmOpen} onOpenChange={setVisibilityConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {project.isPublic ? "ยืนยันการยกเลิกการเผยแพร่" : "ยืนยันการเผยแพร่โครงการ"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {project.isPublic
                ? "โครงการจะไม่แสดงในหน้ารายการโครงการสาธารณะอีกต่อไป"
                : "ข้อมูลโครงการแบบย่อจะเปิดให้ผู้ที่ไม่ได้เข้าสู่ระบบเข้าดูได้"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              disabled={visibilityMutation.isPending}
              onClick={() => {
                visibilityMutation.mutate(!project.isPublic, {
                  onSuccess: () => {
                    setVisibilityConfirmOpen(false);
                    toast.success(project.isPublic ? "ยกเลิกการเผยแพร่สำเร็จ" : "เผยแพร่โครงการสำเร็จ");
                  },
                  onError: () => toast.error("เปลี่ยนสถานะการเผยแพร่ไม่สำเร็จ", {
                    description: fallbackError,
                  }),
                });
              }}
            >
              {visibilityMutation.isPending ? "กำลังบันทึก..." : "ยืนยัน"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบโครงการหรือไม่</AlertDialogTitle>
            <AlertDialogDescription>
              {project.projectStatusId === 1
                ? "แบบร่าง ข้อมูลข้อเสนอ และเอกสารแนบจะถูกลบถาวร"
                : "โครงการจะถูกซ่อนจากรายการใช้งาน แต่ประวัติจะยังคงอยู่สำหรับการตรวจสอบ"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDeleteConfirmOpen(false);
                deleteMutation.mutate(undefined, {
                  onError: () => toast.error("ลบโครงการไม่สำเร็จ", { description: fallbackError }),
                });
              }}
            >
              ลบโครงการ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
