"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, FileSignature, ListChecks, MapPin, Play, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useHasRole } from "@/features/auth/RoleContext";
import { useCancelMeeting, useTransitionMeeting } from "../hooks/useMeetings";
import { Meeting, MeetingStatus, MEETING_STATUS_COLORS, MEETING_STATUS_LABELS } from "../types";
import { getBoardLabel } from "@/features/workflow/board-labels";

const nextTransition: Partial<Record<MeetingStatus, {
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED";
  label: string;
}>> = {
  DRAFT: { status: "SCHEDULED", label: "กำหนดการประชุม" },
  SCHEDULED: { status: "IN_PROGRESS", label: "เริ่มการประชุม" },
  IN_PROGRESS: { status: "COMPLETED", label: "ปิดการประชุม" },
};

export function MeetingWorkspaceHeader({ meeting, activeTab }: {
  meeting: Meeting;
  activeTab: "agendas" | "resolutions";
}) {
  const isSecretary = useHasRole("secretary");
  const transition = useTransitionMeeting(meeting.meeting_id);
  const cancel = useCancelMeeting(meeting.meeting_id);
  const next = nextTransition[meeting.meeting_status];
  const colors = MEETING_STATUS_COLORS[meeting.meeting_status];
  const dateLabel = new Date(meeting.meeting_date).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const runTransition = async () => {
    if (!next) return;
    try {
      await transition.mutateAsync(next.status);
      toast.success("อัปเดตสถานะการประชุมสำเร็จ");
    } catch (error) {
      toast.error("ไม่สามารถอัปเดตสถานะได้", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const cancelMeeting = async () => {
    const reason = window.prompt("กรุณาระบุเหตุผลการยกเลิกการประชุม");
    if (!reason?.trim()) return;
    try {
      await cancel.mutateAsync(reason.trim());
      toast.success("ยกเลิกการประชุมสำเร็จ");
    } catch (error) {
      toast.error("ไม่สามารถยกเลิกการประชุมได้", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <div className="space-y-4">
      <Link href="/meetings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" />กลับไปยังรายการประชุม
      </Link>
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="shrink-0 rounded-xl bg-primary/10 p-2 text-primary"><FileSignature className="size-5" /></div>
                <div className="min-w-0">
                  <p className="break-words font-mono text-xs text-muted-foreground">ครั้งที่ {meeting.meeting_no}</p>
                  <h1 className="break-words text-xl font-bold leading-snug">{meeting.title}</h1>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 pl-11 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{dateLabel}</span>
                <span className="inline-flex min-w-0 items-center gap-1"><MapPin className="size-3.5 shrink-0" /><span className="break-all">{meeting.location}</span></span>
                <span>{getBoardLabel(meeting.meeting_type)}</span>
                {!!meeting.unresolved_resolution_count && (
                  <span className="font-medium text-amber-700">ยังไม่มีมติ {meeting.unresolved_resolution_count} วาระ</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                {MEETING_STATUS_LABELS[meeting.meeting_status]}
              </Badge>
              {isSecretary && next && (
                <Button size="sm" onClick={runTransition} disabled={transition.isPending} className="text-white">
                  <Play className="mr-2 size-4" />{next.label}
                </Button>
              )}
              {isSecretary && ![MeetingStatus.COMPLETED, MeetingStatus.CANCELLED].includes(meeting.meeting_status) && (
                <Button size="sm" variant="outline" onClick={cancelMeeting} disabled={cancel.isPending}>
                  <XCircle className="mr-2 size-4" />ยกเลิกการประชุม
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <nav className="flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full border bg-white p-1">
        <Tab href={`/meetings/${meeting.meeting_id}/agendas`} active={activeTab === "agendas"} icon={<ListChecks className="size-4" />} label="วาระการประชุม" />
        <Tab href={`/meetings/${meeting.meeting_id}/resolutions`} active={activeTab === "resolutions"} icon={<FileSignature className="size-4" />} label="บันทึกมติ" />
      </nav>
    </div>
  );
}

function Tab({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-primary text-white" : "text-muted-foreground hover:text-primary"}`}>
      <span className={`${active ? "text-white" : "text-black"}`}>{icon}</span><span className={`${active ? "text-white" : "text-black"}`}>{label}</span>
    </Link>
  );
}
