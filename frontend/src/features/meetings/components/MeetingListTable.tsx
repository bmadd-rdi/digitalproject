"use client";
// src/features/meetings/components/MeetingListTable.tsx
// ตารางแสดงรายการการประชุม — Data table with status badges & action menus
// Design aligned with ProjectTable / projects page

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  Search,
  CalendarDays,
  MapPin,
  Users,
  MoreVertical,
  ListChecks,
  FileSignature,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type Meeting,
  MeetingStatus,
  MEETING_STATUS_LABELS,
  MEETING_STATUS_COLORS,
} from "../types";
import type { MeetingFilterStatus, MeetingListPagination } from "../hooks/useMeetings";

interface MeetingListTableProps {
  meetings: Meeting[];
  searchQuery: string;
  filterStatus: MeetingFilterStatus;
  pagination: MeetingListPagination;
  onSearchChange: (query: string) => void;
  onFilterChange: (status: MeetingFilterStatus) => void;
  onPageChange: (page: number) => void;
}

export function MeetingListTable({
  meetings,
  searchQuery,
  filterStatus,
  pagination,
  onSearchChange,
  onFilterChange,
  onPageChange,
}: MeetingListTableProps) {
  const router = useRouter();

  const handleNavigateAgendas = useCallback(
    (meetingId: string) => {
      router.push(`/meetings/${meetingId}/agendas`);
    },
    [router]
  );

  const handleNavigateResolutions = useCallback(
    (meetingId: string) => {
      router.push(`/meetings/${meetingId}/resolutions`);
    },
    [router]
  );

  const formatThaiDate = useCallback((dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    const monthIdx = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${months[monthIdx]} ${year}`;
  }, []);

  return (
    <div className="bg-white rounded-md border border-[#D1CDC7] shadow-sm flex-1 flex flex-col overflow-hidden">
      
      {/* ── Toolbar: Search + Filter (inside card, matching projects page) ── */}
      <div className="p-6 px-6 sm:px-10 border-b border-[#ededf4] flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            id="meeting-search"
            type="text"
            placeholder="ค้นหาชื่อการประชุม, ครั้งที่..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 h-11 text-sm border border-[#D1CDC7] rounded-full bg-surface focus:outline-none focus:ring-2 focus:ring-[#00734b]/20 focus:border-[#00734b] transition-all"
          />
        </div>
        <Select
          value={filterStatus}
          onValueChange={(val) => onFilterChange(val as MeetingFilterStatus)}
        >
          <SelectTrigger
            id="meeting-status-filter"
            className="w-auto sm:w-[180px] h-11 rounded-full border-[#D1CDC7] bg-white text-sm font-bold gap-2"
          >
            <Filter className="w-4 h-4 shrink-0" />
            <SelectValue placeholder="กรองตามสถานะ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ทั้งหมด</SelectItem>
            {Object.values(MeetingStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {MEETING_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Data Table ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white sticky top-0 text-slate-400 font-bold z-10 border-b border-[#ededf4] text-[13px] uppercase tracking-wide">
            <tr>
              <th className="px-6 sm:px-10 py-4 w-[120px]">ครั้งที่</th>
              <th className="px-6 sm:px-10 py-4 w-full">ชื่อการประชุม</th>
              <th className="px-6 sm:px-10 py-4">วันที่</th>
              <th className="px-6 sm:px-10 py-4">สถานะ</th>
              <th className="px-6 sm:px-10 py-4 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ededf4]">
            {meetings.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <CalendarDays className="w-12 h-12 text-slate-200" />
                    <div>
                      <p className="font-semibold text-slate-500">
                        ไม่พบข้อมูลการประชุม
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              meetings.map((meeting) => {
                const statusColors =
                  MEETING_STATUS_COLORS[meeting.meeting_status];
                return (
                  <tr
                    key={meeting.meeting_id}
                    className="group cursor-pointer hover:bg-surface-variant/40 transition-colors"
                    onClick={() => handleNavigateAgendas(meeting.meeting_id)}
                  >
                    {/* ครั้งที่ */}
                    <td className="px-6 sm:px-10 py-5 font-mono text-xs font-semibold text-muted-foreground">
                      {meeting.meeting_no}
                    </td>

                    {/* ชื่อการประชุม */}
                    <td className="px-6 sm:px-10 py-5">
                      <div className="space-y-1.5">
                        <p className="font-bold text-[#191c20] group-hover:text-[#00734b] transition-colors leading-snug">
                          {meeting.title}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {meeting.location.length > 40
                              ? meeting.location.slice(0, 40) + "..."
                              : meeting.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {meeting.chairman}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* วันที่ */}
                    <td className="px-6 sm:px-10 py-5 text-[#3f4942] text-xs">
                      <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        {formatThaiDate(meeting.meeting_date)}
                      </span>
                    </td>

                    {/* สถานะ */}
                    <td className="px-6 sm:px-10 py-5">
                      <Badge
                        variant="outline"
                        className={`${statusColors.bg} ${statusColors.text} ${statusColors.border} font-bold text-[11px] px-2.5 py-0.5`}
                      >
                        {MEETING_STATUS_LABELS[meeting.meeting_status]}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-6 sm:px-10 py-5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            id={`meeting-actions-${meeting.meeting_id}`}
                            className="p-2 rounded-full text-muted-foreground hover:text-[#191c20] hover:bg-slate-200 transition-all opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            id={`manage-agendas-${meeting.meeting_id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateAgendas(meeting.meeting_id);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <ListChecks className="w-4 h-4" />
                            จัดการวาระการประชุม
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            id={`record-resolutions-${meeting.meeting_id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateResolutions(meeting.meeting_id);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <FileSignature className="w-4 h-4" />
                            บันทึกมติที่ประชุม
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-3 px-6 sm:px-10 py-3 border-t border-[#ededf4] text-xs text-muted-foreground shrink-0">
        <span>แสดง {meetings.length} จาก {pagination.total} รายการ</span>
        <div className="flex items-center gap-2">
          <span>หน้า {pagination.page} / {Math.max(pagination.totalPages, 1)}</span>
          <button
            type="button"
            aria-label="หน้าก่อนหน้า"
            className="rounded-md border border-[#D1CDC7] p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="หน้าถัดไป"
            className="rounded-md border border-[#D1CDC7] p-1.5 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={pagination.page >= pagination.totalPages || pagination.totalPages === 0}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
