import { NextResponse, type NextRequest } from "next/server";
import {
  canAccessRoute,
  findProtectedRoute,
  normalizeRoles,
  PROTECTED_ROUTE_PREFIXES,
} from "@/lib/route-config";

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function decodeTokenPayload(token: string): Record<string, unknown> | null {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;

    const normalizedPayload = encodedPayload
      .replaceAll("-", "+")
      .replaceAll("_", "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "=",
    );
    const decoded = atob(paddedPayload);
    const bytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as unknown;

    return payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isProtectedPath(pathname)) return NextResponse.next();

  const token = request.cookies.get("token")?.value;
  const payload = token ? decodeTokenPayload(token) : null;
  const expiresAt = typeof payload?.exp === "number" ? payload.exp * 1000 : null;

  if (!payload || (expiresAt !== null && expiresAt <= Date.now())) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  const route = findProtectedRoute(pathname);
  if (!route || !canAccessRoute(route, normalizeRoles(payload.roles))) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/meetings/:path*",
    "/users/:path*",
    "/profile/:path*",
  ],
};

