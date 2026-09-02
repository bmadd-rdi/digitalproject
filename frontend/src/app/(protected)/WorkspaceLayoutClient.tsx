"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import type { ReactNode } from "react";

import { AppSidebar } from "@/components/custom/app-sidebar";
import { CustomSidebarTrigger } from "@/components/custom/custom-sidebar-trigger";
import { UserMenu } from "@/components/custom/user-menu";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { findProtectedRoute } from "@/lib/route-config";
import { RoleProvider } from "@/features/auth/RoleContext";

function Breadcrumbs() {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const route = findProtectedRoute(pathname);

  return (
    <div className="ml-4 flex min-w-0 items-center space-x-2 overflow-hidden text-sm text-muted-foreground">
      <Link
        href="/projects"
        aria-label="กลับไปยังโครงการ"
        className="flex shrink-0 items-center transition-colors hover:text-primary"
      >
        <Home className="h-4 w-4" />
      </Link>
      {pathSegments.length > 0 ? (
        <>
          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
          <span className="truncate font-bold text-[#191c20]">
            {route?.label ?? pathSegments.at(-1)}
          </span>
        </>
      ) : null}
    </div>
  );
}

export default function WorkspaceLayoutClient({
  children,
  roles,
}: {
  children: ReactNode;
  roles: readonly string[];
}) {
  return (
    <RoleProvider roles={roles}>
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar roles={roles} />
        <main className="flex min-h-svh min-w-0 flex-1 flex-col bg-surface-container-low">
          <nav className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#ededf4] bg-white p-4 shadow-sm">
            <section className="flex w-full min-w-0 items-center overflow-hidden pr-4">
              <CustomSidebarTrigger />
              <Breadcrumbs />
            </section>
            <div className="flex shrink-0 items-center gap-4">
              <UserMenu />
            </div>
          </nav>
          <div data-testid="workspace-content-scroll" className="p-2 md:p-4">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
    </RoleProvider>
  );
}
