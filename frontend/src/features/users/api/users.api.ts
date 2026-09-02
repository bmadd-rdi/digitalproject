import type { User } from "../types";
import { z } from "zod";
import { schemas } from "@/types/api-schemas";
import { CLIENT_API_BASE } from "@/lib/client-api";

const API_BASE = CLIENT_API_BASE;

export type UserSortField = "createdAt" | "username" | "name" | "firstName" | "email" | "role" | "department";
export type UserSortOrder = "asc" | "desc";
export type UserStatusFilter = "all" | "active" | "inactive";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: UserSortField;
  order?: UserSortOrder;
  role?: string;
  status?: UserStatusFilter;
  department?: string;
  departmentId?: number;
  divisionId?: number;
}

export interface UserPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersResponse {
  data: User[];
  pagination: UserPagination;
}

export type ApiUser = z.infer<typeof schemas.UserProfileResponse>;
export type ApiUsersResponse = z.infer<typeof schemas.PaginatedUserResponse>;

function mapApiUser(user: ApiUser): User {
  const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;

  return {
    user_id: user.userId,
    username: user.username,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    position: user.position ?? null,
    department_name: user.division?.departmentName ?? "-",
    division_name: user.division?.divisionName ?? "-",
    roles: user.roles.map((role) => role.roleName),
    role_ids: user.roles.map((role) => role.roleId),
    is_active: user.isActive,
    last_login: lastLogin && !Number.isNaN(lastLogin.getTime())
      ? new Intl.DateTimeFormat("th-TH", {
          dateStyle: "short",
          timeStyle: "short",
          timeZone: "Asia/Bangkok",
        }).format(lastLogin)
      : null,
    created_at: user.createdAt,
  };
}

export function mapUsersResponse(
  result: ApiUsersResponse,
  fallbackPagination: UserPagination,
): GetUsersResponse {
  return {
    data: result.data.map(mapApiUser),
    pagination: result.pagination ?? fallbackPagination,
  };
}

export async function getUsers(params: GetUsersParams = {}): Promise<GetUsersResponse> {
  const query = new URLSearchParams();
  const normalized = {
    page: params.page ?? 1,
    limit: params.limit ?? 20,
    sort: params.sort ?? "createdAt",
    order: params.order ?? "desc",
    status: params.status ?? "all",
  };

  for (const [key, value] of Object.entries({ ...normalized, ...params })) {
    if (value === undefined || value === "" || value === "all") continue;
    query.set(key, String(value));
  }

  const response = await fetch(`${API_BASE}/users?${query.toString()}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw Object.assign(
      new Error(result.message ?? result.error ?? "Unable to load users."),
      { status: response.status, data: result },
    );
  }

  return mapUsersResponse(result, {
      total: 0,
      page: normalized.page,
      limit: normalized.limit,
      totalPages: 0,
    });
}
