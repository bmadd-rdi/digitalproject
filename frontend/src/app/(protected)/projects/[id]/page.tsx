// src/app/(protected)/projects/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useProjectWorkspace } from "@/features/projects/hooks/useProjectWorkspace";
import { useWorkspaceTabs } from "@/features/projects/hooks/useWorkspaceTabs";
import { ProjectHeader } from "@/features/projects/components/workspace/ProjectHeader";
import { WorkspaceTabsList } from "@/features/projects/components/workspace/WorkspaceTabsList";
import { ProposalTabContent } from "@/features/projects/components/workspace/ProposalTabContent";
import { DocumentsTabContent } from "@/features/projects/components/workspace/DocumentsTabContent";
import { TimelineTabContent } from "@/features/projects/components/workspace/TimelineTabContent";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params.id as string;

  const { projectDetail, isLoading, isError } = useProjectWorkspace(projectId);

  // Hook ของ Tabs จะถูกเรียกใช้ผ่าน Default Parameter ชั่วคราวไปก่อนถ้าย้อนค่าเป็น null
  const { activeTab, setActiveTab } = useWorkspaceTabs(projectDetail?.hasProposal || false);

  // ดักสถานะกำลังโหลด
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground w-full">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#00734b]" />
        <p className="font-medium">กำลังโหลดข้อมูลพื้นที่ทำงาน...</p>
      </div>
    );
  }

  // ดักสถานะหาไม่พบ หรือเกิด Error
  if (isError || !projectDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-red-600 w-full">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-bold">ไม่พบข้อมูลโครงการ</h2>
        <p className="text-slate-500 mt-2">โปรเจกต์นี้อาจถูกลบไปแล้ว หรือคุณไม่มีสิทธิ์เข้าถึง</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full min-w-0 flex-col p-4 sm:p-6 lg:p-8 mx-auto w-full animate-in fade-in duration-500">
      <ProjectHeader project={projectDetail} />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        className="min-h-0 min-w-0 flex-1 flex flex-col mt-6"
      >
        <WorkspaceTabsList />

        <TabsContent value="tab-proposal" className="min-w-0 flex-1 mt-6">
          <ProposalTabContent project={projectDetail} />
        </TabsContent>

        <TabsContent value="tab-documents" className="min-w-0 flex-1 mt-6">
          <DocumentsTabContent
            projectId={projectId}
            initialAttachments={projectDetail.attachments ?? []}
            canManage={projectDetail.permissions?.canManageAttachments ?? false}
          />
        </TabsContent>

        <TabsContent value="tab-timeline" className="min-w-0 flex-1 mt-6">
          <TimelineTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
