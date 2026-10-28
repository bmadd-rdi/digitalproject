// src/features/projects/hooks/useProjects.ts
import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getProjectsAction } from "../actions/project.actions";
import {
  canViewAllProjectsTab,
  canViewDraftsTab,
  type UserRoleInput,
} from "@/utils/rbac-helpers";

export type TabType = "drafts" | "active" | "team" | "all";

type ProjectQuery = {
  page?: number;
  limit?: number;
  search?: string;
  statusIds?: number[];
  status?: "draft" | "submitted" | "all_except_draft" | "all";
  ownership?: "mine" | "team_only" | "team_and_mine" | "all";
  departmentIds?: number[];
  projectTypeIds?: number[];
  analystIds?: string[];
  budgetTypes?: string[];
};

// ฟังก์ชันแปลง TabType เป็น Query Parameters ที่ Backend เข้าใจ
const getQueryParamsForTab = (tab: TabType): ProjectQuery => {
  switch (tab) {
    case "drafts":
      return { status: "draft", ownership: "team_and_mine" };
    case "active":
      return { status: "all_except_draft", ownership: "mine" };
    case "team":
      return { status: "all_except_draft", ownership: "team_and_mine" };
    case "all":
      return { status: "all", ownership: "all" };
    default:
      return { status: "all", ownership: "all" };
  }
};

// const fetchProjectsAPI = async (params: { page: number; limit: number; search: string; tab: TabType; statusIds: number[] }) => {
  const fetchProjectsAPI = async (params: {
  page: number;
  limit: number;
  search: string;
  tab: TabType;
  statusIds: number[];
  departmentIds: number[];
  projectTypeIds: number[];
  analystIds: string[];
  budgetTypes: string[];
}) => {
  const tabConditions = getQueryParamsForTab(params.tab);
  const statusIds = [...params.statusIds].sort((a, b) => a - b);

  // สร้าง Object สำหรับส่งไปเป็น URL Query String
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...(params.search ? { search: params.search } : {}),
    ...(statusIds.length === 0 && tabConditions.status ? { status: tabConditions.status } : {}),
    ...(tabConditions.ownership ? { ownership: tabConditions.ownership } : {}),
  });
  statusIds.forEach((statusId) => queryParams.append("statusIds", String(statusId)));
  params.departmentIds.forEach((id) => queryParams.append("departmentIds", String(id)));
  params.projectTypeIds.forEach((id) => queryParams.append("projectTypeIds", String(id)));
  params.analystIds.forEach((id) => queryParams.append("analystIds", id));
  params.budgetTypes.forEach((type) => queryParams.append("budgetTypes", type));

  // 👈 เรียกใช้งาน Server Action แทนการเรียก serverFetch ตรงๆ
  const result = await getProjectsAction(queryParams.toString());

  // ปรับโครงสร้างข้อมูลที่ส่งกลับ ให้ตรงกับที่ UI Template และ Hook ต้องการ
  return {
    data: result.data,
    meta: {
      currentPage: result.pagination.page,
      totalPages: result.pagination.totalPages,
      totalItems: result.pagination.total,
    },
    summary: {
      draftsCount: 0,
      activeCount: 0,
    }
  };
};

export function useProjects(userRoles: UserRoleInput = []) {
  const defaultTab: TabType = canViewDraftsTab(userRoles) ? "drafts" : "active";
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusIds, setSelectedStatusIdsState] = useState<number[]>([]);
  const [selectedDepartmentIds, setSelectedDepartmentIdsState] = useState<number[]>([]);
  const [selectedProjectTypeIds, setSelectedProjectTypeIdsState] = useState<number[]>([]);
  const [selectedAnalystIds, setSelectedAnalystIdsState] = useState<string[]>([]);
  const [selectedBudgetTypes, setSelectedBudgetTypesState] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const normalizedStatusIds = [...selectedStatusIds].sort((a, b) => a - b);
  const normalizedDepartmentIds = [...selectedDepartmentIds].sort((a, b) => a - b);
  const normalizedProjectTypeIds = [...selectedProjectTypeIds].sort((a, b) => a - b);
  const normalizedAnalystIds = [...selectedAnalystIds].sort();
  const normalizedBudgetTypes = [...selectedBudgetTypes].sort();

  const { data: response, isLoading, isError, isFetching } = useQuery({
    // queryKey: ["projects", activeTab, currentPage, searchQuery, normalizedStatusIds],
        queryKey: [
      "projects", activeTab, currentPage, searchQuery, normalizedStatusIds,
      normalizedDepartmentIds, normalizedProjectTypeIds, normalizedAnalystIds, normalizedBudgetTypes,
    ],
    queryFn: () => fetchProjectsAPI({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      tab: activeTab,
      statusIds: normalizedStatusIds,
      departmentIds: normalizedDepartmentIds,
      projectTypeIds: normalizedProjectTypeIds,
      analystIds: normalizedAnalystIds,
      budgetTypes: normalizedBudgetTypes,
    }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: "always",
  });

  const handleTabChange = (tab: TabType) => {
    if (tab === "drafts" && !canViewDraftsTab(userRoles)) return;
    if (tab === "all" && !canViewAllProjectsTab(userRoles)) return;

    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedStatusIdsState([]);
    setSelectedDepartmentIdsState([]);
    setSelectedProjectTypeIdsState([]);
    setSelectedAnalystIdsState([]);
    setSelectedBudgetTypesState([]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const setSelectedStatusIds = (statusIds: number[]) => {
    setSelectedStatusIdsState([...new Set(statusIds)].sort((a, b) => a - b));
    setCurrentPage(1);
  };

  const clearStatusFilter = () => setSelectedStatusIds([]);





    const setSelectedDepartmentIds = (departmentIds: number[]) => {
    setSelectedDepartmentIdsState([...new Set(departmentIds)].sort((a, b) => a - b));
    setCurrentPage(1);
  };

  const setSelectedProjectTypeIds = (projectTypeIds: number[]) => {
    setSelectedProjectTypeIdsState([...new Set(projectTypeIds)].sort((a, b) => a - b));
    setCurrentPage(1);
  };

  const setSelectedAnalystIds = (analystIds: string[]) => {
    setSelectedAnalystIdsState([...new Set(analystIds)].sort());
    setCurrentPage(1);
  };

  const setSelectedBudgetTypes = (budgetTypes: string[]) => {
    setSelectedBudgetTypesState([...new Set(budgetTypes)].sort());
    setCurrentPage(1);
  };

  // ล้างตัวกรองทั้งหมดในปุ่มเดียว — ใช้กับ filter panel รวม
  const clearAllFilters = () => {
    setSelectedStatusIdsState([]);
    setSelectedDepartmentIdsState([]);
    setSelectedProjectTypeIdsState([]);
    setSelectedAnalystIdsState([]);
    setSelectedBudgetTypesState([]);
    setCurrentPage(1);
  };

  const activeFilterCount = [
    normalizedStatusIds.length > 0,
    normalizedDepartmentIds.length > 0,
    normalizedProjectTypeIds.length > 0,
    normalizedAnalystIds.length > 0,
    normalizedBudgetTypes.length > 0,
  ].filter(Boolean).length;





  return {
    activeTab,
    handleTabChange,
    searchQuery,
    setSearchQuery: handleSearch,
    selectedStatusIds: normalizedStatusIds,
    setSelectedStatusIds,
    clearStatusFilter,
    selectedDepartmentIds: normalizedDepartmentIds,
    setSelectedDepartmentIds,
    selectedProjectTypeIds: normalizedProjectTypeIds,
    setSelectedProjectTypeIds,
    selectedAnalystIds: normalizedAnalystIds,
    setSelectedAnalystIds,
    selectedBudgetTypes: normalizedBudgetTypes,
    setSelectedBudgetTypes,
    clearAllFilters,
    activeFilterCount,
    projectsData: response?.data || [],
    currentPage: response?.meta.currentPage || 1,
    totalPages: response?.meta.totalPages || 1,
    setCurrentPage,
    draftsCount: response?.summary.draftsCount || 0,
    activeCount: response?.summary.activeCount || 0,
    isLoading,
    isFetching,
    isError
  };
}
