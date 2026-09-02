"use client";
// src/features/meetings/components/AgendaDragDropList.tsx
// รายการวาระการประชุม — Grouped list with up/down reorder & project linking

import { useState, useCallback } from "react";
import {
  ChevronUp,
  ChevronDown,
  Link2,
  Unlink,
  FolderOpen,
  Briefcase,
  FileText,
  MessageSquare,
  GitBranch,
  MoreHorizontal,
  Banknote,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  type Agenda,
  type GroupedAgendas,
  type Project,
  AgendaType,
} from "../types";
import { ProjectSelectorModal } from "./ProjectSelectorModal";

interface AgendaDragDropListProps {
  groupedAgendas: GroupedAgendas[];
  availableProjects: Project[];
  onMoveUp: (agendaId: string) => void;
  onMoveDown: (agendaId: string) => void;
  onLinkProject: (agendaId: string, projectId: string) => void;
  onUnlinkProject: (agendaId: string) => void;
  onDelete: (agendaId: string) => void;
  isFirstInGroup: (agendaId: string) => boolean;
  isLastInGroup: (agendaId: string) => boolean;
}

const AGENDA_TYPE_ICONS: Record<AgendaType, React.ReactNode> = {
  [AgendaType.FOR_INFORMATION]: <FileText className="w-4 h-4" />,
  [AgendaType.APPROVE_MINUTES]: <MessageSquare className="w-4 h-4" />,
  [AgendaType.FOLLOW_UP]: <GitBranch className="w-4 h-4" />,
  [AgendaType.FOR_CONSIDERATION]: <Briefcase className="w-4 h-4" />,
  [AgendaType.OTHER]: <MoreHorizontal className="w-4 h-4" />,
};

const AGENDA_TYPE_STYLES: Record<
  AgendaType,
  { headerBg: string; headerText: string; accentBorder: string }
> = {
  [AgendaType.FOR_INFORMATION]: {
    headerBg: "bg-blue-50",
    headerText: "text-blue-700",
    accentBorder: "border-l-blue-400",
  },
  [AgendaType.APPROVE_MINUTES]: {
    headerBg: "bg-violet-50",
    headerText: "text-violet-700",
    accentBorder: "border-l-violet-400",
  },
  [AgendaType.FOLLOW_UP]: {
    headerBg: "bg-cyan-50",
    headerText: "text-cyan-700",
    accentBorder: "border-l-cyan-400",
  },
  [AgendaType.FOR_CONSIDERATION]: {
    headerBg: "bg-amber-50",
    headerText: "text-amber-700",
    accentBorder: "border-l-amber-400",
  },
  [AgendaType.OTHER]: {
    headerBg: "bg-slate-50",
    headerText: "text-slate-600",
    accentBorder: "border-l-slate-400",
  },
};

export function AgendaDragDropList({
  groupedAgendas,
  availableProjects,
  onMoveUp,
  onMoveDown,
  onLinkProject,
  onUnlinkProject,
  onDelete,
  isFirstInGroup,
  isLastInGroup,
}: AgendaDragDropListProps) {
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [linkingAgendaId, setLinkingAgendaId] = useState<string | null>(null);

  const handleOpenProjectModal = useCallback((agendaId: string) => {
    setLinkingAgendaId(agendaId);
    setProjectModalOpen(true);
  }, []);

  const handleSelectProject = useCallback(
    (projectId: string) => {
      if (linkingAgendaId) {
        onLinkProject(linkingAgendaId, projectId);
        setLinkingAgendaId(null);
      }
    },
    [linkingAgendaId, onLinkProject]
  );

  const formatBudget = useCallback((amount: number) => {
    return new Intl.NumberFormat("th-TH").format(amount);
  }, []);

  return (
    <>
      <div className="space-y-6">
        {groupedAgendas.map((group) => {
          const styles = AGENDA_TYPE_STYLES[group.type];
          const icon = AGENDA_TYPE_ICONS[group.type];

          return (
            <div
              key={group.type}
              className="bg-white rounded-md border border-[#ededf4] shadow-[0px_4px_24px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              {/* Group Header */}
              <div
                className={`${styles.headerBg} px-6 py-3 flex items-center gap-2.5 border-b border-[#ededf4]`}
              >
                <span className={`${styles.headerText}`}>{icon}</span>
                <h3 className={`font-bold text-sm ${styles.headerText}`}>
                  {group.label}
                </h3>
                <Badge variant="outline" className="ml-auto text-[10px] font-bold">
                  {group.agendas.length} วาระ
                </Badge>
              </div>

              {/* Agenda Items */}
              <div className="divide-y divide-[#ededf4]">
                {group.agendas.map((agenda) => (
                  <AgendaCard
                    key={agenda.agenda_id}
                    agenda={agenda}
                    accentBorder={styles.accentBorder}
                    isFirst={isFirstInGroup(agenda.agenda_id)}
                    isLast={isLastInGroup(agenda.agenda_id)}
                    onMoveUp={() => onMoveUp(agenda.agenda_id)}
                    onMoveDown={() => onMoveDown(agenda.agenda_id)}
                    onLinkProject={() =>
                      handleOpenProjectModal(agenda.agenda_id)
                    }
                    onUnlinkProject={() => onUnlinkProject(agenda.agenda_id)}
                    onDelete={() => onDelete(agenda.agenda_id)}
                    formatBudget={formatBudget}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {groupedAgendas.length === 0 && (
          <div className="bg-white rounded-md border border-[#ededf4] shadow-sm p-16 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-200" />
            <p className="font-semibold text-slate-500">
              ยังไม่มีวาระการประชุม
            </p>
            <p className="text-sm text-slate-400 mt-1">
              เพิ่มวาระการประชุมเพื่อเริ่มต้น
            </p>
          </div>
        )}
      </div>

      {/* Project Selector Modal */}
      <ProjectSelectorModal
        open={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setLinkingAgendaId(null);
        }}
        onSelect={handleSelectProject}
        availableProjects={availableProjects}
      />
    </>
  );
}

// ── Single Agenda Card ──
interface AgendaCardProps {
  agenda: Agenda;
  accentBorder: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onLinkProject: () => void;
  onUnlinkProject: () => void;
  onDelete: () => void;
  formatBudget: (amount: number) => string;
}

function AgendaCard({
  agenda,
  accentBorder,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onLinkProject,
  onUnlinkProject,
  onDelete,
  formatBudget,
}: AgendaCardProps) {
  const showProjectLinker = agenda.agenda_type === AgendaType.FOLLOW_UP ||
    agenda.agenda_type === AgendaType.FOR_CONSIDERATION;

  return (
    <div
      className={`group flex items-start gap-4 px-6 py-4 border-l-4 ${accentBorder} hover:bg-[#f9f9ff] transition-colors`}
    >
      {/* Reorder arrows */}
      <div className="flex flex-col gap-0.5 pt-1 shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 rounded-md disabled:opacity-30"
              disabled={isFirst}
              onClick={onMoveUp}
              aria-label="เลื่อนขึ้น"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">เลื่อนขึ้น</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 rounded-md disabled:opacity-30"
              disabled={isLast}
              onClick={onMoveDown}
              aria-label="เลื่อนลง"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">เลื่อนลง</TooltipContent>
        </Tooltip>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-7 w-7 shrink-0 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700"
            onClick={onDelete}
            aria-label="ลบวาระ"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>ลบวาระ</TooltipContent>
      </Tooltip>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md font-bold">
            {agenda.agenda_number}
          </span>
          <p className="font-bold text-sm text-[#191c20] leading-snug">
            {agenda.title}
          </p>
        </div>

        {agenda.description && (
          <p className="text-xs text-muted-foreground leading-relaxed pl-9">
            {agenda.description}
          </p>
        )}

        {/* Linked Project Card */}
        {showProjectLinker && agenda.project && (
          <div className="ml-9 mt-2 flex items-center gap-3 p-3 rounded-md bg-[#00734b]/5 border border-[#00734b]/15">
            <FolderOpen className="w-4 h-4 text-[#00734b] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#00734b] truncate">
                {agenda.project.name}
              </p>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground">
                <span>{agenda.project.project_code}</span>
                <span className="flex items-center gap-0.5">
                  <Banknote className="w-3 h-3" />
                  {formatBudget(agenda.project.budget)} บาท
                </span>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 rounded-md text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={onUnlinkProject}
                  aria-label="ยกเลิกการเชื่อมโยง"
                >
                  <Unlink className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ยกเลิกการเชื่อมโยง</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Link Project Button (only for consideration agendas without a project) */}
        {showProjectLinker && !agenda.project && (
          <Button
            variant="outline"
            size="sm"
            className="ml-9 mt-1 text-xs gap-1.5 text-[#00734b] border-[#00734b]/30 hover:bg-[#00734b]/5 hover:text-[#00734b] rounded-lg"
            onClick={onLinkProject}
          >
            <Link2 className="w-3.5 h-3.5" />
            เชื่อมโยงโครงการ
          </Button>
        )}
      </div>
    </div>
  );
}
