"use client";
// src/features/meetings/components/ResolutionSplitView.tsx
// แสดงผลแบบ Split-View — Agenda list (left) + Resolution form (right)

import { useMemo, useCallback } from "react";
import {
  CheckCircle2,
  Circle,
  FileSignature,
  Briefcase,
  FileText,
  MessageSquare,
  GitBranch,
  MoreHorizontal,
  FolderOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  type Agenda,
  type Resolution,
  AgendaType,
  RESOLUTION_STATUS_LABELS,
  RESOLUTION_STATUS_COLORS,
  ResolutionStatus,
} from "../types";
import { ResolutionForm } from "./ResolutionForm";

interface ResolutionSplitViewProps {
  agendas: Agenda[];
  selectedAgendaId: string | null;
  selectedAgenda: Agenda | null;
  resolution: Resolution | null;
  onSelectAgenda: (agendaId: string) => void;
  onUpdateStatus: (status: ResolutionStatus | null) => void;
  onUpdateComment: (comment: string) => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  getResolutionForAgenda: (agendaId: string) => Resolution | null;
  isConsiderationAgenda: (agenda: Agenda) => boolean;
}

const AGENDA_TYPE_ICONS: Record<AgendaType, React.ReactNode> = {
  [AgendaType.FOR_INFORMATION]: <FileText className="w-3.5 h-3.5" />,
  [AgendaType.APPROVE_MINUTES]: <MessageSquare className="w-3.5 h-3.5" />,
  [AgendaType.FOLLOW_UP]: <GitBranch className="w-3.5 h-3.5" />,
  [AgendaType.FOR_CONSIDERATION]: <Briefcase className="w-3.5 h-3.5" />,
  [AgendaType.OTHER]: <MoreHorizontal className="w-3.5 h-3.5" />,
};

export function ResolutionSplitView({
  agendas,
  selectedAgendaId,
  selectedAgenda,
  resolution,
  onSelectAgenda,
  onUpdateStatus,
  onUpdateComment,
  onSave,
  isSaving,
  hasUnsavedChanges,
  getResolutionForAgenda,
  isConsiderationAgenda,
}: ResolutionSplitViewProps) {
  // Count completion
  const completionStats = useMemo(() => {
    const total = agendas.length;
    const completed = agendas.filter((a) => {
      const res = getResolutionForAgenda(a.agenda_id);
      return res && res.comment.trim().length > 0;
    }).length;
    return { total, completed };
  }, [agendas, getResolutionForAgenda]);

  const isAgendaRecorded = useCallback(
    (agendaId: string) => {
      const res = getResolutionForAgenda(agendaId);
      return res !== null && res.comment.trim().length > 0;
    },
    [getResolutionForAgenda]
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 min-h-0">
      {/* ── Left Panel: Agenda List ── */}
      <div className="lg:w-[380px] lg:shrink-0 bg-white rounded-md lg:rounded-r-none border border-[#ededf4] shadow-[0px_4px_24px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 border-b border-[#ededf4] bg-[#f9f9ff] shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#191c20] flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-[#00734b]" />
              วาระการประชุม
            </h3>
            <Badge variant="outline" className="text-[10px] font-bold">
              {completionStats.completed}/{completionStats.total}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00734b] rounded-full transition-all duration-500"
              style={{
                width: `${completionStats.total > 0 ? (completionStats.completed / completionStats.total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-280px)] lg:h-[calc(100vh-200px)]">
          {agendas.map((agenda) => {
            const isSelected = selectedAgendaId === agenda.agenda_id;
            const isRecorded = isAgendaRecorded(agenda.agenda_id);
            const res = getResolutionForAgenda(agenda.agenda_id);
            const isConsideration = agenda.agenda_type === AgendaType.FOLLOW_UP ||
              agenda.agenda_type === AgendaType.FOR_CONSIDERATION;

            return (
              <button
                key={agenda.agenda_id}
                id={`agenda-select-${agenda.agenda_id}`}
                className={`w-full text-left px-4 py-3.5 border-b border-[#ededf4] transition-all
                  ${
                    isSelected
                      ? "bg-[#00734b]/5 border-l-4 border-l-[#00734b]"
                      : "hover:bg-[#f3f3fa]/60 border-l-4 border-l-transparent"
                  }
                `}
                onClick={() => onSelectAgenda(agenda.agenda_id)}
              >
                <div className="flex items-start gap-3">
                  {/* Completion indicator */}
                  <span className="mt-0.5 shrink-0">
                    {isRecorded ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00734b]" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </span>

                  {/* Agenda info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-muted-foreground bg-slate-100 px-1.5 py-0.5 rounded font-bold shrink-0">
                        {agenda.agenda_number}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {AGENDA_TYPE_ICONS[agenda.agenda_type]}
                      </span>
                    </div>

                    <p
                      className={`text-sm font-semibold leading-snug truncate ${
                        isSelected ? "text-[#00734b]" : "text-[#191c20]"
                      }`}
                    >
                      {agenda.title}
                    </p>

                    {/* Sub-info row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {isConsideration && agenda.project && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-[#00734b]/5 px-1.5 py-0.5 rounded">
                          <FolderOpen className="w-2.5 h-2.5" />
                          {agenda.project.project_code}
                        </span>
                      )}
                      {res?.resolution_status && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] h-4 px-1.5 font-bold ${RESOLUTION_STATUS_COLORS[res.resolution_status].bg} ${RESOLUTION_STATUS_COLORS[res.resolution_status].text} ${RESOLUTION_STATUS_COLORS[res.resolution_status].border}`}
                        >
                          {RESOLUTION_STATUS_LABELS[res.resolution_status]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right Panel: Resolution Form ── */}
      <div className="flex-1 bg-white rounded-md lg:rounded-l-none border border-[#ededf4] lg:border-l-0 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] flex flex-col min-h-[500px] lg:min-h-0 overflow-hidden">
        <ResolutionForm
          agenda={selectedAgenda}
          resolution={resolution}
          isConsideration={selectedAgenda ? isConsiderationAgenda(selectedAgenda) : false}
          onUpdateStatus={onUpdateStatus}
          onUpdateComment={onUpdateComment}
          onSave={onSave}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>
    </div>
  );
}
