import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetUsers } from "./useGetUsers";
import type { User } from "../types";
import type { UserSortField, UserSortOrder } from "../api/users.api";
import { updateUserRolesAction, updateUserStatusAction } from "../actions/user.actions";
import { refreshSessionAction } from "@/features/auth/actions/auth.actions";

export type SortField = UserSortField;
export type SortDirection = UserSortOrder;

const PAGE_SIZE = 20;

export const useUserManagement = (options: { currentUserId?: string | null } = {}) => {
  const { currentUserId } = options;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [activeOnly, setActiveOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const queryClient = useQueryClient();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const usersQuery = useGetUsers({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    department: deptFilter === "ALL" ? undefined : deptFilter,
    role: roleFilter === "ALL" ? undefined : roleFilter,
    status: activeOnly ? "active" : "all",
    sort: sortField,
    order: sortDirection,
  });

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);
  const updateDeptFilter = useCallback((value: string) => {
    setDeptFilter(value);
    setCurrentPage(1);
  }, []);
  const updateRoleFilter = useCallback((value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  }, []);
  const updateActiveOnly = useCallback((value: boolean) => {
    setActiveOnly(value);
    setCurrentPage(1);
  }, []);

  const users = useMemo(() => usersQuery.data?.data ?? [], [usersQuery.data?.data]);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const statusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      updateUserStatusAction(userId, isActive),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      // toast.success("User status updated");
      toast.success("อัปเดตสถานะผู้ใช้เรียบร้อยแล้ว");
    },
    // onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update user status"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "ไม่สามารถอัปเดตสถานะผู้ใช้ได้"),
  });

  const rolesMutation = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: number[] }) =>
      updateUserRolesAction(userId, roleIds),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);

      if (currentUserId && currentUserId === variables.userId) {
        const refreshedSession = await refreshSessionAction();
        if (refreshedSession.success) {
          // toast.success("Your roles were updated and your session was refreshed.");
          toast.success("อัปเดตสิทธิ์ของคุณเรียบร้อยแล้ว และเซสชันของคุณได้รับการรีเฟรช");
        } else {
          toast.warning(refreshedSession.message);
        }
        return;
      }

      // toast.success("User roles updated");
      toast.success("อัปเดตสิทธิ์ผู้ใช้เรียบร้อยแล้ว");
    },
    // onError: (error) => toast.error(error instanceof Error ? error.message : "Unable to update user roles"),
    onError: (error) => toast.error(error instanceof Error ? error.message : "ไม่สามารถอัปเดตสิทธิ์ผู้ใช้ได้"),
  });

  const handleToggleActive = useCallback((userId: string | number) => {
    const id = String(userId);
    const currentUser = users.find((user) => String(user.user_id) === id);
    if (!currentUser || statusMutation.isPending) return;
    void statusMutation.mutateAsync({ userId: id, isActive: !currentUser.is_active });
  }, [statusMutation, users]);

  const openRoleModal = useCallback((user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  }, []);

  const openPasswordModal = useCallback((user: User) => {
    setSelectedUser(user);
    setTempPassword(null);
    setIsPasswordModalOpen(true);
  }, []);

  const handleSaveRoles = useCallback(async (roleIds: number[]) => {
    if (!selectedUser) return;
    await rolesMutation.mutateAsync({ userId: String(selectedUser.user_id), roleIds });
    setIsRoleModalOpen(false);
  }, [rolesMutation, selectedUser]);

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  return {
    users,
    search,
    setSearch: updateSearch,
    deptFilter,
    setDeptFilter: updateDeptFilter,
    roleFilter,
    setRoleFilter: updateRoleFilter,
    activeOnly,
    setActiveOnly: updateActiveOnly,
    currentPage,
    setCurrentPage,
    pagination: usersQuery.data?.pagination ?? {
      total: 0,
      page: currentPage,
      limit: PAGE_SIZE,
      totalPages: 0,
    },
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    isError: usersQuery.isError,
    error: usersQuery.error,
    sortField,
    sortDirection,
    handleSort,
    selectedUser,
    isRoleModalOpen,
    setIsRoleModalOpen,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    tempPassword,
    setTempPassword,
    handleToggleActive,
    handleSaveRoles,
    isUpdatingStatus: statusMutation.isPending,
    isUpdatingRoles: rolesMutation.isPending,
    openRoleModal,
    openPasswordModal,
  };
};
