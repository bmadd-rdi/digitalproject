import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUsers, type GetUsersParams } from "../api/users.api";

const DEFAULT_PARAMS: Required<Pick<GetUsersParams, "page" | "limit" | "sort" | "order" | "status">> = {
  page: 1,
  limit: 20,
  sort: "createdAt",
  order: "desc",
  status: "all",
};

export function useGetUsers(params: GetUsersParams = {}) {
  const queryParams = { ...DEFAULT_PARAMS, ...params };

  return useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => getUsers(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
