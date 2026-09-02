export const ALL_AUTHENTICATED_ROLES = "*" as const;

export type AppRole =
  | "secretary"
  | "admin"
  | "super_admin"
  | "analyst"
  | "user";

export type RouteIconName =
  | "dashboard"
  | "projects"
  | "tracking"
  | "secretary"
  | "assignment"
  | "analyst"
  | "meetings"
  | "users"
  | "profile";

export type ProtectedRoute = {
  label: string;
  path: string;
  group: string;
  icon: RouteIconName;
  roles: readonly AppRole[] | typeof ALL_AUTHENTICATED_ROLES;
  aliases?: readonly string[];
};

export type ProtectedRouteGroup = {
  title: string;
  routes: readonly ProtectedRoute[];
};

export const APP_ROUTE_GROUPS = [
  {
    title: "ภาพรวม",
    routes: [
      {
        label: "Dashboard",
        path: "/dashboard",
        group: "ภาพรวม",
        icon: "dashboard",
        roles: ["secretary", "admin", "super_admin"],
      },
    ],
  },
  {
    title: "โครงการ",
    routes: [
      {
        label: "จัดการโครงการ",
        path: "/projects",
        group: "โครงการ",
        icon: "projects",
        roles: ALL_AUTHENTICATED_ROLES,
      },
      {
        label: "ติดตามโครงการ",
        path: "/projects/tracking",
        group: "โครงการ",
        icon: "tracking",
        roles: ALL_AUTHENTICATED_ROLES,
        aliases: ["/projects/active"],
      },
    ],
  },
  {
    title: "งานตรวจสอบ (Tasks)",
    routes: [
      {
        label: "รับหนังสือขอส่งโครงการ",
        path: "/tasks/secretary",
        group: "งานตรวจสอบ (Tasks)",
        icon: "secretary",
        roles: ["secretary"],
        aliases: ["/tasks/screening"],
      },
      {
        label: "ระบุผู้วิเคราะห์โครงการ",
        path: "/tasks/assignment",
        group: "งานตรวจสอบ (Tasks)",
        icon: "assignment",
        roles: ["admin", "super_admin"],
      },
      {
        label: "งานวิเคราะห์โครงการ",
        path: "/tasks/analyst",
        group: "งานตรวจสอบ (Tasks)",
        icon: "analyst",
        roles: ["analyst"],
        aliases: ["/tasks/analysis"],
      },
    ],
  },
  {
    title: "การประชุม",
    routes: [
      {
        label: "จัดการการประชุม",
        path: "/meetings",
        group: "การประชุม",
        icon: "meetings",
        roles: ["secretary", "admin", "super_admin"],
      },
    ],
  },
  {
    title: "ตั้งค่าระบบ",
    routes: [
      {
        label: "จัดการผู้ใช้งาน",
        path: "/users",
        group: "ตั้งค่าระบบ",
        icon: "users",
        roles: ["admin", "super_admin"],
      },
      {
        label: "ข้อมูลส่วนตัว",
        path: "/profile",
        group: "ตั้งค่าระบบ",
        icon: "profile",
        roles: ALL_AUTHENTICATED_ROLES,
      },
    ],
  },
] as const satisfies readonly ProtectedRouteGroup[];

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/meetings",
  "/users",
  "/profile",
] as const;

const allRoutes: ProtectedRoute[] = APP_ROUTE_GROUPS.flatMap((group) => [
  ...group.routes,
]);

export function normalizeRoles(value: unknown): AppRole[] {
  if (!Array.isArray(value)) return [];

  const allowedRoles = new Set<AppRole>([
    "secretary",
    "admin",
    "super_admin",
    "analyst",
    "user",
  ]);

  return value.reduce<AppRole[]>((roles, item) => {
    const rawRole =
      typeof item === "string"
        ? item
        : item && typeof item === "object" && "roleName" in item
          ? String(item.roleName)
          : "";
    const role = rawRole.trim().toLowerCase().replaceAll("-", "_");
    if (allowedRoles.has(role as AppRole) && !roles.includes(role as AppRole)) {
      roles.push(role as AppRole);
    }
    return roles;
  }, []);
}

export function routeMatchesPath(route: ProtectedRoute, pathname: string) {
  const paths = [route.path, ...(route.aliases ?? [])];
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function findProtectedRoute(
  pathname: string,
): ProtectedRoute | undefined {
  return [...allRoutes]
    .sort((left, right) => right.path.length - left.path.length)
    .find((route) => routeMatchesPath(route, pathname));
}

export function canAccessRoute(route: ProtectedRoute, roles: readonly AppRole[]) {
  return (
    route.roles === ALL_AUTHENTICATED_ROLES ||
    route.roles.some((role) => roles.includes(role))
  );
}

export function getVisibleRouteGroups(roles: readonly AppRole[]) {
  return APP_ROUTE_GROUPS.map((group) => ({
    ...group,
    routes: group.routes.filter((route) => canAccessRoute(route, roles)),
  })).filter((group) => group.routes.length > 0);
}
