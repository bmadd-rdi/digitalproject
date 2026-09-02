"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, FileText, MoreVertical } from "lucide-react";
import { z } from "zod";
import { schemas } from "@/types/api-schemas";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabType } from "../hooks/useProjects";
import { getProjectStatusMeta, getThaiProjectStatus } from "../utils/projectStatus";
import { getProjectTableColumnCount } from "./project-table-columns";

export { getProjectTableColumnCount } from "./project-table-columns";

type Project = z.infer<typeof schemas.Project>;
type ProjectRow = Project & {
  formProgress?: string;
  docProgress?: string;
};

interface ProjectTableProps {
  data: ProjectRow[];
  activeTab: TabType;
  emptyMessage?: string;
  onRowClick?: (project: ProjectRow) => void;
  renderActions?: (project: ProjectRow) => ReactNode;
  actionsFirst?: boolean;
  showActions?: boolean;
  stickyActions?: boolean;
  actionsHeader?: string;
  hideAnalystColumn?: boolean;
  showDraftProgress?: boolean;
  statusLanguage?: "th" | "en";
}

export function ProjectTableSkeleton({
  activeTab,
  hideAnalystColumn = false,
  showActions = false,
  showDraftProgress = true,
}: Pick<ProjectTableProps, "activeTab" | "hideAnalystColumn" | "showActions" | "showDraftProgress">) {
  const columnCount = getProjectTableColumnCount({ activeTab, hideAnalystColumn, showActions, showDraftProgress });
  return (
    <div className="flex-1 overflow-auto" data-column-count={columnCount}>
      <Table>
        <TableBody>
          {Array.from({ length: 6 }, (_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columnCount }, (_, columnIndex) => (
                <TableCell key={columnIndex} className="px-6 py-5 sm:px-10">
                  <div className="h-5 animate-pulse rounded bg-muted" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({
  statusId,
  statusName,
  language = "en",
}: {
  statusId?: number | null;
  statusName?: string | null;
  language?: "th" | "en";
}) {
  const meta = getProjectStatusMeta(statusId, statusName);
  const label = language === "th"
    ? getThaiProjectStatus(statusId)
    : meta.label;

  return (
    <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-bold ${meta.className}`}>
      {label}
    </span>
  );
}

function getProjectTypeLabel(name: string | null | undefined, language: "th" | "en") {
  if (!name) return "-";
  if (language !== "th") return name;

  const normalizedName = name.trim().toLowerCase();
  if (normalizedName === "hardware") return "ฮาร์ดแวร์";
  if (normalizedName === "software") return "ซอฟต์แวร์";
  return name;
}

export function ProjectTable({
  data,
  activeTab,
  emptyMessage,
  onRowClick,
  renderActions,
  actionsFirst = false,
  showActions = false,
  stickyActions = false,
  actionsHeader = "จัดการ",
  hideAnalystColumn = false,
  showDraftProgress = true,
  statusLanguage = "en",
}: ProjectTableProps) {
  const router = useRouter();
  const navigate = (project: ProjectRow) => {
    if (onRowClick) onRowClick(project);
    else router.push(`/projects/${project.id}`);
  };

  const actionsClassName = stickyActions
    ? "sticky left-0 z-20 px-3 py-4 text-center shadow-[2px_0_4px_-3px_rgba(0,0,0,0.25)] sm:px-6"
    : "px-6 py-4 text-center sm:px-10";
  const hasStatusColumn = activeTab !== "drafts" || showDraftProgress;
  const columnCount = getProjectTableColumnCount({ activeTab, hideAnalystColumn, showActions, showDraftProgress });

  const renderActionsHeader = () => (
    <TableHead className={actionsClassName}>{actionsHeader}</TableHead>
  );

  const renderActionsCell = (project: ProjectRow) => (
    <TableCell
      className={actionsClassName}
      onClick={(event) => event.stopPropagation()}
    >
      {renderActions ? (
        renderActions(project)
      ) : (
        <Button
          variant="ghost"
          size="icon"
          aria-label="การดำเนินการโครงการ"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      )}
    </TableCell>
  );

  if (data.length === 0) {
    return (
      <div className="flex-1 overflow-auto">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={columnCount} className="p-16 text-center font-medium text-muted-foreground">
                {emptyMessage ?? (activeTab === "drafts" ? "ไม่มีโครงการแบบร่าง" : "ไม่พบโครงการ")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto" data-column-count={columnCount}>
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow>
            {showActions && actionsFirst && renderActionsHeader()}
            <TableHead className="px-6 py-4 sm:px-10">วันที่นำเข้า</TableHead>
            <TableHead className="w-full px-6 py-4 sm:px-10">ชื่อโครงการ</TableHead>
            <TableHead className="px-6 py-4 sm:px-10">หน่วยงาน</TableHead>
            <TableHead className="px-6 py-4 sm:px-10">ส่วนราชการ</TableHead>
            <TableHead className="px-6 py-4 sm:px-10">ประเภทโครงการ</TableHead>
            <TableHead className="px-6 py-4 sm:px-10">งบประมาณ</TableHead>
            {!hideAnalystColumn && <TableHead className="px-6 py-4 sm:px-10">ผู้วิเคราะห์</TableHead>}
            {hasStatusColumn && <TableHead className="min-w-50 px-6 py-4 sm:px-10">
              {activeTab === "drafts" ? "ความคืบหน้า" : "สถานะโครงการ"}
            </TableHead>}
            {showActions && !actionsFirst && renderActionsHeader()}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((project) => {
            const isReturned = [3, 7, 10, 13].includes(project.status?.id ?? -1);
            const date = project.createdAt
              ? new Intl.DateTimeFormat("th-TH").format(new Date(project.createdAt))
              : "-";

            return (
              <TableRow
                key={project.id}
                className={isReturned && activeTab !== "drafts"
                  ? "cursor-pointer bg-red-50/40 hover:bg-red-50/70"
                  : "cursor-pointer hover:bg-surface-variant/40"}
                onClick={() => navigate(project)}
              >
                {showActions && actionsFirst && renderActionsCell(project)}
                <TableCell className="px-6 py-5 text-xs text-muted-foreground sm:px-10">{date}</TableCell>
                <TableCell className="px-6 py-5 sm:px-10">
                  <div className={`flex flex-col font-bold ${isReturned && activeTab !== "drafts" ? "text-red-700" : "text-[#191c20]"}`}>
                    <span className="mb-0.5 font-mono text-[10px] font-normal text-muted-foreground">{project.projectCode || "-"}</span>
                    <span className="cursor-pointer transition-colors duration-200 hover:text-primary">{project.projectName || "-"}</span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-5 text-[#3f4942] sm:px-10">{project.division?.name || "-"}</TableCell>
                <TableCell className="px-6 py-5 text-[#3f4942] sm:px-10">{project.division?.departmentName || "-"}</TableCell>
                <TableCell className="px-6 py-5 text-[#3f4942] sm:px-10">{getProjectTypeLabel(project.projectType?.name, statusLanguage)}</TableCell>
                <TableCell className="px-6 py-5 text-[#3f4942] sm:px-10">{project.latestSubmittedRequestedBudget ? Number(project.latestSubmittedRequestedBudget).toLocaleString("th-TH") : "-"}</TableCell>
                {!hideAnalystColumn && (
                  <TableCell className="px-6 py-5 text-[#3f4942] sm:px-10">
                    {project.analyst ? `${project.analyst.firstName} ${project.analyst.lastName}` : "-"}
                  </TableCell>
                )}
                {hasStatusColumn && <TableCell className="px-6 py-5 sm:px-10">
                  {activeTab === "drafts" ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00734b]/20 bg-[#00734b]/10 px-2.5 py-1 text-[11px] font-bold text-[#00734b]"><FileSpreadsheet className="h-3 w-3" /> แบบฟอร์ม {project.formProgress || "-"}</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600"><FileText className="h-3 w-3" /> เอกสาร {project.docProgress || "-"}</span>
                    </div>
                  ) : (
                    <StatusBadge statusId={project.status?.id} statusName={project.status?.name} language={statusLanguage} />
                  )}
                </TableCell>}
                {showActions && !actionsFirst && renderActionsCell(project)}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
