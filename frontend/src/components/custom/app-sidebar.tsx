"use client";

import {
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getVisibleRouteGroups,
  findProtectedRoute,
  normalizeRoles,
  type AppRole,
  type RouteIconName,
} from "@/lib/route-config";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const icons: Record<RouteIconName, LucideIcon> = {
  dashboard: LayoutDashboard,
  projects: FolderOpen,
  tracking: ListTodo,
  secretary: ClipboardCheck,
  assignment: ClipboardCheck,
  analyst: ClipboardCheck,
  meetings: CalendarDays,
  users: Users,
  profile: Settings,
};

export function AppSidebar({ roles = [] }: { roles?: readonly string[] }) {
  const { toggleSidebar, state, isMobile } = useSidebar();
  const pathname = usePathname();
  const normalizedRoles = normalizeRoles(roles);
  const visibleGroups = getVisibleRouteGroups(normalizedRoles);
  const activeRoute = findProtectedRoute(pathname);
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <Sidebar
      variant="sidebar"
      collapsible="offcanvas"
      className="border-r border-border/50 shadow-sm"
    >
      <SidebarContent className="bg-surface">
        <div className="mb-2 flex items-center border-border/50 px-4 py-4 transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
          <Link href="/dashboard" className="flex w-full items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center transition-all duration-300 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
              <Image
                src="/pics/logo.png"
                alt="Bangkok Logo"
                width={40}
                height={40}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div
              className={`flex flex-col whitespace-nowrap transition-all duration-300 ${
                isCollapsed ? "hidden w-0 opacity-0" : "w-auto opacity-100"
              }`}
            >
              <span className="text-lg font-black leading-tight text-primary">
                BMA Digital
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Project Management
              </span>
            </div>
          </Link>
          {isMobile ? (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="ปิดเมนู"
              className="ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface-variant hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        {visibleGroups.map((group) => (
          <SidebarGroup
            key={group.title}
            className="mt-1 px-2 group-data-[collapsible=icon]:px-1"
          >
            {!isCollapsed ? (
              <SidebarGroupLabel className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.routes.map((route) => {
                  const Icon = icons[route.icon];
                  const isActive = activeRoute?.path === route.path;

                  return (
                    <SidebarMenuItem key={route.path}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={route.label}
                        className={`rounded-full transition-colors group-data-[collapsible=icon]:justify-center! ${
                          isActive
                            ? "bg-[#00734b]/10 font-bold text-[#00734b]"
                            : "font-medium text-slate-600 hover:bg-[#00734b]/5"
                        }`}
                      >
                        <Link
                          href={route.path}
                          className="flex w-full items-center gap-2 group-data-[collapsible=icon]:justify-center"
                        >
                          <Icon
                            className={`h-5 w-5 shrink-0 ${
                              isActive ? "text-[#00734b]" : "text-slate-500"
                            }`}
                          />
                          <span>{route.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export type { AppRole };
