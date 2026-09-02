import { normalizeRoles, type AppRole } from "@/lib/route-config";

export type UserRoleInput = string | readonly string[] | null | undefined;

function toAppRoles(value: UserRoleInput): AppRole[] {
  return normalizeRoles(
    Array.isArray(value) ? value : value ? [value] : [],
  );
}

/** Drafts require project-creation permission in the project-list UI. */
export function canViewDraftsTab(role: UserRoleInput): boolean {
  return toAppRoles(role).some(
    (item) => item === "super_admin" || item === "user",
  );
}

/** All Projects is an oversight view for management roles. */
export function canViewAllProjectsTab(role: UserRoleInput): boolean {
  return toAppRoles(role).some(
    (item) =>
      item === "super_admin" || item === "admin" || item === "secretary",
  );
}

