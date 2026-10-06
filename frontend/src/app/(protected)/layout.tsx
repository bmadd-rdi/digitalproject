import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getUserSession } from "@/lib/session";
import { normalizeRoles } from "@/lib/route-config";
import { SessionRefresh } from "@/features/auth/components/session-refresh";
import WorkspaceLayoutClient from "./WorkspaceLayoutClient";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getUserSession();
  if (!session?.userId) redirect("/login");

  return (
    <>
      <SessionRefresh />
      <WorkspaceLayoutClient roles={normalizeRoles(session.roles)} userId={session.userId}>
        {children}
      </WorkspaceLayoutClient>
    </>
  );
}
