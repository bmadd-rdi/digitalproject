// src/features/projects/templates/ProjectsTemplate.tsx
"use client";

import Link from "next/link";
import { Check, ChevronDown, Plus, Search, Filter, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { ProjectTabs } from "@/features/projects/components/ProjectTabs";
import { ProjectTable, ProjectTableSkeleton } from "@/features/projects/components/ProjectTable";
import { ProjectPagination } from "@/features/projects/components/ProjectPagination";
import {
  getProjectStatusMeta,
  PROJECT_STATUS,
  PROJECT_STATUS_FILTER_OPTIONS,
} from "@/features/projects/utils/projectStatus";
import {
  canViewAllProjectsTab,
  canViewDraftsTab,
  type UserRoleInput,
} from "@/utils/rbac-helpers";

export function ProjectsTemplate({
  userRoles = [],
}: {
  userRoles?: UserRoleInput;
}) {
  const {
    activeTab, handleTabChange,
    searchQuery, setSearchQuery,
    projectsData, currentPage, setCurrentPage, totalPages,
    draftsCount, activeCount,
    isLoading, isFetching,
    selectedStatusIds, setSelectedStatusIds, clearStatusFilter,
  } = useProjects(userRoles);

  const canViewDrafts = canViewDraftsTab(userRoles);
  const canViewAll = canViewAllProjectsTab(userRoles);
  const showStatusFilter = activeTab !== "drafts";
  const availableStatusOptions =
    activeTab === "all"
      ? PROJECT_STATUS_FILTER_OPTIONS
      : PROJECT_STATUS_FILTER_OPTIONS.filter(
          ({ id }) => id !== PROJECT_STATUS.DRAFT,
        );

  return (
    <div className="flex flex-col h-full p-6 lg:p-8 animate-in fade-in duration-500 mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#191c20] tracking-tight">รายการโครงการ</h1>
          <p className="text-sm text-[#3f4942] mt-1">จัดการแบบร่างและติดตามสถานะโครงการทั้งหมด</p>
        </div>
        <Link
          href="/projects/create"
          className="flex items-center gap-2 bg-[#00734b] hover:bg-primary-dark text-white px-6 py-3 rounded-full font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5 text-white" /> <span className="text-white">สร้างโครงการใหม่</span>
        </Link>
      </div>

      <div className="bg-white rounded-md border border-[#D1CDC7] shadow-sm flex-1 flex flex-col overflow-hidden relative">

        <ProjectTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          draftsCount={draftsCount}
          activeCount={activeCount}
          showDrafts={canViewDrafts}
          showAll={canViewAll}
        />

        <div className="p-6 px-6 sm:px-10 border-b border-[#ededf4] flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ, รหัส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-11 text-sm border border-[#D1CDC7] rounded-full bg-surface focus:outline-none focus:ring-2 focus:ring-[#00734b]/20 focus:border-[#00734b] transition-all"
            />
            {isFetching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00734b] animate-spin" />}
          </div>
          {showStatusFilter && (
            <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="กรองตามสถานะโครงการ"
                className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#D1CDC7] px-6 text-sm font-bold text-[#191c20] transition-colors hover:bg-surface-variant"
              >
                <Filter className="h-4 w-4" />
                {selectedStatusIds.length > 0
                  ? `เลือกแล้ว ${selectedStatusIds.length} สถานะ`
                  : "ตัวกรองสถานะ"}
                <ChevronDown className="h-4 w-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-[min(22rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
            >
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold">ตัวกรองสถานะ</p>
                  <p className="text-xs text-muted-foreground">เลือกได้หลายสถานะ</p>
                </div>
                {selectedStatusIds.length > 0 && (
                  <button
                    type="button"
                    className="shrink-0 text-xs font-semibold text-primary hover:underline"
                    onClick={clearStatusFilter}
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
              <div className="max-h-80 space-y-1 overflow-y-auto p-3">
                {availableStatusOptions.map(({ id, label }) => {
                  const checked = selectedStatusIds.includes(id);
                  const meta = getProjectStatusMeta(id);

                  return (
                    <label
                      key={id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                        checked ? meta.className : "border-transparent"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(nextChecked) => {
                          const nextStatusIds = nextChecked
                              ? [...selectedStatusIds, id]
                              : selectedStatusIds.filter((value) => value !== id);

                          setSelectedStatusIds(
                            availableStatusOptions
                              .filter(({ id: optionId }) =>
                                nextStatusIds.includes(optionId),
                              )
                              .map(({ id: optionId }) => optionId),
                          );
                        }}
                        aria-label={label}
                      />
                      <span className="min-w-0 flex-1 break-words">{label}</span>
                      {checked && <Check className="h-4 w-4 shrink-0" />}
                    </label>
                  );
                })}
              </div>
            </PopoverContent>
            </Popover>
          )}
        </div>

        {isLoading ? (
          <ProjectTableSkeleton
            activeTab={activeTab}
            hideAnalystColumn={activeTab === "drafts"}
            showActions={false}
            showDraftProgress={false}
          />
        ) : (
          <ProjectTable
            data={projectsData}
            activeTab={activeTab}
            hideAnalystColumn={activeTab === "drafts"}
            showActions={false}
            showDraftProgress={false}
            statusLanguage="th"
          />
        )}

        {/* Hide pagination on initial load */}
        {!isLoading && totalPages > 1 && (
          <ProjectPagination
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
          />
        )}

      </div>
    </div>
  );
}
