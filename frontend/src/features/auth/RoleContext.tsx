"use client";

import { createContext, useContext, type ReactNode } from "react";

const RoleContext = createContext<readonly string[]>([]);

export function RoleProvider({ roles, children }: { roles: readonly string[]; children: ReactNode }) {
  return <RoleContext.Provider value={roles}>{children}</RoleContext.Provider>;
}

export function useRoles() {
  return useContext(RoleContext);
}

export function useHasRole(role: string) {
  const roles = useRoles();
  return roles.some((value) => value.toLowerCase() === role.toLowerCase());
}
