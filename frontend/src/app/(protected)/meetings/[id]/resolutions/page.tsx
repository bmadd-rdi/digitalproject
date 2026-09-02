"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";
import { ResolutionSplitView } from "@/features/meetings/components/ResolutionSplitView";
import { MeetingWorkspaceHeader } from "@/features/meetings/components/MeetingWorkspaceHeader";
import { useResolutions } from "@/features/meetings/hooks/useResolutions";
import { useMeeting } from "@/features/meetings/hooks/useMeetings";

export default function ResolutionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const meetingQuery = useMeeting(id);
  const resolutions = useResolutions(id);

  if (meetingQuery.isLoading || resolutions.isLoading) {
    return <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-[#00734b]" />กำลังโหลดข้อมูลการประชุม...</div>;
  }
  if (meetingQuery.isError || !meetingQuery.data) {
    return <div className="mx-auto max-w-4xl rounded-md border border-red-200 bg-red-50 p-8 text-center text-red-700">ไม่พบข้อมูลการประชุม</div>;
  }
  if (resolutions.isError) {
    return <div className="mx-auto max-w-4xl rounded-md border border-red-200 bg-red-50 p-8 text-center text-red-700">ไม่สามารถโหลดวาระได้</div>;
  }

  return (
    <div className="mx-auto flex w-full flex-col gap-6 p-6 lg:p-8">
      <MeetingWorkspaceHeader meeting={meetingQuery.data} activeTab="resolutions" />
      <ResolutionSplitView
        agendas={resolutions.agendas}
        selectedAgendaId={resolutions.selectedAgendaId}
        selectedAgenda={resolutions.selectedAgenda}
        resolution={resolutions.resolution}
        onSelectAgenda={resolutions.selectAgenda}
        onUpdateStatus={resolutions.updateResolutionStatus}
        onUpdateComment={resolutions.updateResolutionComment}
        onSave={resolutions.saveResolution}
        isSaving={resolutions.isSaving}
        hasUnsavedChanges={resolutions.hasUnsavedChanges}
        getResolutionForAgenda={resolutions.getResolutionForAgenda}
        isConsiderationAgenda={resolutions.isConsiderationAgenda}
      />
    </div>
  );
}
