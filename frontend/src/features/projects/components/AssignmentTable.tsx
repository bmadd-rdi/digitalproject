"use client";

import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type {
  AnalystWorkloadResponse,
  AssignmentProjectsResponse,
} from "../actions/assignment.actions";

export type AssignmentProject = AssignmentProjectsResponse["data"][number];
export type AnalystWorkload = AnalystWorkloadResponse["data"][number];

type AssignmentTableProps = {
  projects: AssignmentProject[];
  analysts: AnalystWorkload[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onAssignSingle: (projectId: string, analystId: string) => void;
  onRequestBulkAssign: (analystId: string) => void;
  pendingProjectId?: string | null;
  isBulkAssigning?: boolean;
};

function analystName(analyst: AnalystWorkload) {
  return `${analyst.firstName} ${analyst.lastName}`.trim() || analyst.username;
}

function workloadClassName(count: number) {
  if (count >= 6) return "bg-red-50 text-red-700 border-red-200";
  if (count >= 3) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export function AssignmentTable({
  projects,
  analysts,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onAssignSingle,
  onRequestBulkAssign,
  pendingProjectId,
  isBulkAssigning = false,
}: AssignmentTableProps) {
  const isAllSelected = projects.length > 0 && selectedIds.length === projects.length;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {selectedIds.length > 0 && (
        <div className="absolute left-1/2 top-4 z-20 flex w-[calc(100%-2rem)] -translate-x-1/2 flex-col gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-medium">
            เลือกแล้ว <strong className="text-lg text-orange-300">{selectedIds.length}</strong> โครงการ
          </span>
          <Select
            disabled={isBulkAssigning}
            onValueChange={onRequestBulkAssign}
          >
            <SelectTrigger className="h-9 min-w-0 border-slate-700 bg-slate-800 text-white sm:min-w-[260px]">
              <SelectValue placeholder="เลือกนักวิเคราะห์เพื่อมอบหมาย..." />
            </SelectTrigger>
            <SelectContent>
              {analysts.map((analyst) => (
                <SelectItem key={analyst.userId} value={analyst.userId}>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{analystName(analyst)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({analyst.activeTaskCount} งาน)
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isBulkAssigning && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-background text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="w-12 px-4 py-4 text-center">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(checked) => onSelectAll(checked === true)}
                  aria-label="เลือกโครงการทั้งหมด"
                />
              </th>
              <th className="px-4 py-4">รหัสโครงการ</th>
              <th className="w-full px-4 py-4">ชื่อโครงการ</th>
              <th className="px-4 py-4">ประเภท</th>
              <th className="min-w-72 px-4 py-4">นักวิเคราะห์</th>
              <th className="px-4 py-4 text-right">รายละเอียด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((project) => {
              const isSelected = selectedIds.includes(project.id);
              const isAssigning = pendingProjectId === project.id;

              return (
                <tr
                  key={project.id}
                  className={`transition-colors hover:bg-muted/50 ${isSelected ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-4 text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onSelectToggle(project.id)}
                      aria-label={`เลือก ${project.projectName ?? "โครงการ"}`}
                    />
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                    {project.projectCode ?? "-"}
                  </td>
                  <td className="min-w-0 px-4 py-4">
                    <Link
                      href={`/projects/${project.id}`}
                      className="block max-w-[360px] truncate font-bold text-foreground transition-colors hover:text-primary"
                    >
                      {project.projectName ?? "ไม่ระบุชื่อโครงการ"}
                    </Link>
                    <p className="mt-1 max-w-[360px] truncate text-xs text-muted-foreground">
                      {project.division?.departmentName ?? "ไม่ระบุหน่วยงาน"}
                      {project.division?.name ? ` · ${project.division.name}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      เจ้าของ: {project.owner ? `${project.owner.firstName} ${project.owner.lastName}` : "-"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                      {project.projectType?.name ?? "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                    <Select
                      disabled={isAssigning || isBulkAssigning}
                      onValueChange={(analystId) => onAssignSingle(project.id, analystId)}
                    >
                      <SelectTrigger className="h-9 bg-background">
                        {isAssigning ? (
                          <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> กำลังมอบหมาย...</span>
                        ) : (
                          <SelectValue placeholder="-- เลือกนักวิเคราะห์ --" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {analysts.map((analyst) => (
                          <SelectItem key={analyst.userId} value={analyst.userId}>
                            <span className="flex min-w-[240px] items-center justify-between gap-3">
                              <span className="truncate">{analystName(analyst)}</span>
                              <span className={`rounded-full border px-1.5 py-0.5 text-[10px] ${workloadClassName(analyst.activeTaskCount)}`}>
                                {analyst.activeTaskCount} งาน
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-primary">
                      <Link href={`/projects/${project.id}`}>
                        <Eye className="h-4 w-4" /> ดูรายละเอียด
                      </Link>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
