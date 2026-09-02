"use client";

import { ArrowRight, Clock, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProposalState } from "@/features/proposals/hooks/useProposalState";
import { useInitializeDraft } from "@/features/proposals/hooks/useProposalMutations";
import type { ProjectDetail } from "../../types/workspace";
import { SubmittedProposalView } from "./SubmittedProposalView";
import type { RawSubmittedProposal } from "./proposal-view.utils";

interface ProposalTabContentProps {
  project: ProjectDetail;
}

export function ProposalTabContent({ project }: ProposalTabContentProps) {
  const projectId = String(project.id);
  const router = useRouter();
  const proposalState = useProposalState(projectId, {
    preferEditableDraft: project.permissions?.canSubmitProposal === true,
  });
  const { mutate: initializeDraft, isPending: isCreatingDraft } = useInitializeDraft(projectId);

  if (proposalState.status === "loading") {
    return (
      <div className="flex min-h-48 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังโหลดข้อมูลข้อเสนอ...
      </div>
    );
  }

  if (proposalState.status === "error") {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        ไม่สามารถโหลดข้อมูลข้อเสนอได้ กรุณาลองใหม่อีกครั้ง
      </p>
    );
  }

  if (proposalState.status === "draft") {
    return (
      <Card className="rounded-2xl border-orange-200 bg-orange-50/50 shadow-sm">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h3 className="text-lg font-extrabold text-foreground">เอกสารรายละเอียดโครงการอยู่ระหว่างการจัดทำ</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              กรุณาดำเนินการกรอกข้อมูลให้ครบถ้วนเพื่อส่งโครงการเข้าสู่กระบวนการพิจารณา
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/projects/${projectId}/proposal/create`)}
            className="h-11 w-full gap-2 font-bold md:w-auto"
          >
            แก้ไขข้อเสนอ
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (proposalState.status === "submitted") {
    return (
      <SubmittedProposalView
        project={project}
        proposal={proposalState.data as RawSubmittedProposal}
        onEdit={() => router.push(`/projects/${projectId}/proposal/create?mode=review`)}
      />
    );
  }

  return (
    <Card className="rounded-2xl border-orange-200 bg-orange-50/50 shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-200 bg-white text-orange-600 shadow-sm">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">ยังไม่มีเอกสารข้อเสนอ</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              เริ่มสร้างแบบร่างเพื่อกรอกรายละเอียดโครงการทั้ง 5 ขั้นตอน
            </p>
          </div>
        </div>
        <Button
          disabled={isCreatingDraft}
          onClick={() =>
            initializeDraft(undefined, {
              onSuccess: () => router.push(`/projects/${projectId}/proposal/create`),
            })
          }
          className="h-11 w-full gap-2 font-bold md:w-auto"
        >
          {isCreatingDraft && <Loader2 className="h-4 w-4 animate-spin" />}
          เริ่มสร้างแบบร่าง
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
