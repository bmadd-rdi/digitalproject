// src/features/projects/templates/ProjectsTemplate.tsx
"use client";

import Link from "next/link";
import type { ReactNode } from "react";
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
  useDepartments,
  useProjectTypes,
  useBudgetTypes,
  useAnalystsLookup,
} from "@/features/lookups/hooks/useLookups";
// import { useAnalystWorkloads } from "@/features/projects/hooks/useProjectAssignment";
import {
  canViewAllProjectsTab,
  canViewDraftsTab,
  type UserRoleInput,
} from "@/utils/rbac-helpers";









// ---------------------------------------------------------------------------
// FilterSection — a single checkbox-list group inside the combined filter
// panel. Shared by every field (สถานะ, หน่วยงาน, ประเภทงบประมาณ, ผู้วิเคราะห์,
// ประเภทโครงการ) so each one looks and behaves identically.
// ---------------------------------------------------------------------------
function FilterSection<T extends string | number>({
  title,
  options,
  selected,
  onChange,
  isLoading,
  emptyLabel = "ไม่มีข้อมูล",
  getOptionClassName,
}: {
  title: string;
  options: { value: T; label: string }[];
  selected: T[];
  onChange: (next: T[]) => void;
  isLoading?: boolean;
  emptyLabel?: string;
  getOptionClassName?: (value: T) => string | undefined;
}) {
  return (
    <div className="border-b px-4 py-3 last:border-b-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{title}</p>
        {selected.length > 0 && (
          <button
            type="button"
            className="shrink-0 text-xs font-semibold text-primary hover:underline"
            onClick={() => onChange([])}
          >
            ล้าง
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">กำลังโหลด...</p>
      ) : options.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="max-h-40 space-y-1 overflow-y-auto">
          {options.map(({ value, label }) => {
            const checked = selected.includes(value);
            const extraClassName = checked ? getOptionClassName?.(value) : undefined;

            return (
              <label
                key={value}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                  extraClassName ?? "border-transparent"
                }`}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(nextChecked) => {
                    onChange(
                      nextChecked
                        ? [...selected, value]
                        : selected.filter((v) => v !== value),
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
      )}
    </div>
  );
}















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
    selectedStatusIds, setSelectedStatusIds,
    selectedDepartmentIds, setSelectedDepartmentIds,
    selectedProjectTypeIds, setSelectedProjectTypeIds,
    selectedAnalystIds, setSelectedAnalystIds,
    selectedBudgetTypes, setSelectedBudgetTypes,
    clearAllFilters, activeFilterCount,
  } = useProjects(userRoles);

  const canViewDrafts = canViewDraftsTab(userRoles);
  const canViewAll = canViewAllProjectsTab(userRoles);
  const showFilters = activeTab !== "drafts";
  const availableStatusOptions =
    activeTab === "all"
      ? PROJECT_STATUS_FILTER_OPTIONS
      : PROJECT_STATUS_FILTER_OPTIONS.filter(
          ({ id }) => id !== PROJECT_STATUS.DRAFT,
        );
  

  // Lookup data — only fetched when the filter panel can actually be shown
  // (ไม่ fetch ตอนอยู่ tab แบบร่างที่ไม่มีตัวกรองเลย)
  const departmentsQuery = useDepartments();
  const projectTypesQuery = useProjectTypes();
  const budgetTypesQuery = useBudgetTypes();
  // รายชื่อผู้วิเคราะห์ (เฉพาะ id + ชื่อ) ทุกคนที่ล็อกอินเรียกได้ — ไม่ใช้ endpoint
  // ภาระงานของหน้ามอบหมายงานที่ต้องมีสิทธิ์ project_assign
  const analystsQuery = useAnalystsLookup(showFilters);

  return (
    <div className="flex flex-col h-full p-6 lg:p-8 animate-in fade-in duration-500 mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">รายการโครงการ</h1>
          <p className="text-sm text-muted-foreground mt-1">จัดการแบบร่างและติดตามสถานะโครงการทั้งหมด</p>
        </div>
        <Link
          href="/projects/create"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-5 h-5 text-white" /> <span className="text-white">สร้างโครงการใหม่</span>
        </Link>
      </div>

      <div className="bg-card rounded-md border border-border shadow-sm flex-1 flex flex-col overflow-hidden relative">

        <ProjectTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          draftsCount={draftsCount}
          activeCount={activeCount}
          showDrafts={canViewDrafts}
          showAll={canViewAll}
        />

        <div className="p-6 px-6 sm:px-10 border-b border-border flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ, รหัส, งบประมาณ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-11 text-sm border border-border rounded-full bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {isFetching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />}
          </div>

          {showFilters && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label="ตัวกรอง"
                  className="flex h-11 items-center justify-center gap-2 rounded-full border border-border px-6 text-sm font-bold text-foreground transition-colors hover:bg-surface-variant"
                >
                  <Filter className="h-4 w-4" />
                  {activeFilterCount > 0 ? `ตัวกรอง (${activeFilterCount})` : "ตัวกรอง"}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-[min(24rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
              >
                <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-semibold">ตัวกรอง</p>
                    <p className="text-xs text-muted-foreground">เลือกได้หลายค่าในแต่ละหมวด</p>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      className="shrink-0 text-xs font-semibold text-primary hover:underline"
                      onClick={clearAllFilters}
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  )}
                </div>

                <div className="max-h-[28rem] overflow-y-auto">
                  <FilterSection
                    title="สถานะโครงการ"
                    options={availableStatusOptions.map(({ id, label }) => ({ value: id, label }))}
                    selected={selectedStatusIds}
                    onChange={setSelectedStatusIds}
                    getOptionClassName={(id) => getProjectStatusMeta(id).className}
                  />

                  <FilterSection
                    title="หน่วยงาน"
                    options={(departmentsQuery.data?.data ?? []).map((d) => ({ value: d.id, label: d.name }))}
                    selected={selectedDepartmentIds}
                    onChange={setSelectedDepartmentIds}
                    isLoading={departmentsQuery.isLoading}
                  />

                  <FilterSection
                    title="ประเภทงบประมาณ"
                    options={(budgetTypesQuery.data?.data ?? []).map((type) => ({ value: type, label: type }))}
                    selected={selectedBudgetTypes}
                    onChange={setSelectedBudgetTypes}
                    isLoading={budgetTypesQuery.isLoading}
                  />

                  <FilterSection
                    title="ผู้วิเคราะห์"
                    options={(analystsQuery.data?.data ?? []).map((a) => ({
                      value: a.userId,
                      // label: `${a.firstName} ${a.lastName}`.trim() || a.username,
                      label: a.name,
                    }))}
                    selected={selectedAnalystIds}
                    onChange={setSelectedAnalystIds}
                    isLoading={analystsQuery.isLoading}
                  />

                  <FilterSection
                    title="ประเภทโครงการ"
                    options={(projectTypesQuery.data?.data ?? []).map((t) => ({ value: t.id, label: t.name }))}
                    selected={selectedProjectTypeIds}
                    onChange={setSelectedProjectTypeIds}
                    isLoading={projectTypesQuery.isLoading}
                  />
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