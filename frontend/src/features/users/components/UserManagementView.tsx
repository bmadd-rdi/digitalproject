"use client";

import dynamic from "next/dynamic";
import { useUserManagement } from "../hooks/useUserManagement";
import { UserHeader } from "./UserHeader";
import { UserToolbar } from "./UserToolbar";
import { UserTable } from "./UserTable";
import { ProjectPagination } from "@/features/projects/components/ProjectPagination";

const RoleModal = dynamic(
  () => import("./modals/RoleModal").then((module) => module.RoleModal),
  { ssr: false },
);
const PasswordModal = dynamic(
  () => import("./modals/PasswordModal").then((module) => module.PasswordModal),
  { ssr: false },
);

export const UserManagementView = ({ currentUserId }: { currentUserId?: string | null }) => {
  const {
    users,
    search, setSearch,
    deptFilter, setDeptFilter,
    roleFilter, setRoleFilter,
    activeOnly, setActiveOnly,
    selectedUser,
    isRoleModalOpen, setIsRoleModalOpen,
    isPasswordModalOpen, setIsPasswordModalOpen,
    tempPassword, setTempPassword,
    handleToggleActive,
    handleSaveRoles,
    isUpdatingStatus,
    isUpdatingRoles,
    openRoleModal,
    openPasswordModal,
    sortField,
    sortDirection,
    handleSort,
    currentPage,
    setCurrentPage,
    pagination,
    isLoading,
    isFetching,
    isError,
    error,
  } = useUserManagement({ currentUserId });

  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full flex-1 flex-col gap-6 pb-10">
      <UserHeader />
      
      <UserToolbar 
        search={search} setSearch={setSearch}
        deptFilter={deptFilter} setDeptFilter={setDeptFilter}
        roleFilter={roleFilter} setRoleFilter={setRoleFilter}
        activeOnly={activeOnly} setActiveOnly={setActiveOnly}
      />
      
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-white shadow-sm">
        <div className="min-h-0 flex-1 overflow-auto">
          <UserTable
            className="min-h-full rounded-none border-0 shadow-none"
            users={users}
            isLoading={isLoading}
            onToggleActive={handleToggleActive}
            isUpdatingStatus={isUpdatingStatus}
            onOpenRoleModal={openRoleModal}
            onOpenPasswordModal={openPasswordModal}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </div>

        {isError && (
          <p className="border-t border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error instanceof Error ? error.message : "Unable to load users."}
          </p>
        )}
        {isFetching && !isLoading && (
          <p className="border-t border-border px-4 py-2 text-right text-xs text-muted-foreground">
            Updating users...
          </p>
        )}
        <ProjectPagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <RoleModal 
        key={`${selectedUser?.user_id ?? "none"}-${isRoleModalOpen ? "open" : "closed"}`}
        isOpen={isRoleModalOpen} 
        onClose={() => setIsRoleModalOpen(false)} 
        user={selectedUser}
        onSave={handleSaveRoles}
        isSaving={isUpdatingRoles}
      />
      
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        user={selectedUser}
        tempPassword={tempPassword}
        setTempPassword={setTempPassword}
      />
    </div>
  );
};
