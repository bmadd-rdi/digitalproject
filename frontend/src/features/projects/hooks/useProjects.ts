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

const fetchProjectsAPI = async (params: { page: number; limit: number; search: string; tab: TabType; statusIds: number[] }) => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const normalizedStatusIds = [...selectedStatusIds].sort((a, b) => a - b);
  const { data: response, isLoading, isError, isFetching } = useQuery({
    queryKey: ["projects", activeTab, currentPage, searchQuery, normalizedStatusIds],
    queryFn: () => fetchProjectsAPI({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery,
      tab: activeTab,
      statusIds: normalizedStatusIds,
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

  return {
    activeTab,
    handleTabChange,
    searchQuery,
    setSearchQuery: handleSearch,
    selectedStatusIds: normalizedStatusIds,
    setSelectedStatusIds,
    clearStatusFilter,
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
