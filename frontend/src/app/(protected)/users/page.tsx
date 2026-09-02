// src/app/(protected)/users/page.tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { UserManagementView } from "@/features/users/components/UserManagementView";
import {
  mapUsersResponse,
  type ApiUsersResponse,
  type GetUsersParams,
} from "@/features/users/api/users.api";
import { serverFetch } from "@/lib/server-fetch";
import { getUserSession } from "@/lib/session";

const INITIAL_PARAMS = {
  page: 1,
  limit: 20,
  sort: "createdAt",
  order: "desc",
  status: "all",
} satisfies Required<Pick<GetUsersParams, "page" | "limit" | "sort" | "order" | "status">>;

export default async function UsersManagementPage() {
  const queryClient = new QueryClient();
  const session = await getUserSession();
  const query = new URLSearchParams({
    page: String(INITIAL_PARAMS.page),
    limit: String(INITIAL_PARAMS.limit),
    sort: INITIAL_PARAMS.sort,
    order: INITIAL_PARAMS.order,
    status: INITIAL_PARAMS.status,
  });

  try {
    const response = await serverFetch<ApiUsersResponse>(`/api/v1/users?${query.toString()}`);
    queryClient.setQueryData(
      ["users", INITIAL_PARAMS],
      mapUsersResponse(response, { total: 0, page: 1, limit: 20, totalPages: 0 }),
    );
  } catch {
    // The client query will retry the request after hydration if SSR is unavailable.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col h-full p-6 lg:p-8 animate-in fade-in duration-500 mx-auto w-full">
        <UserManagementView currentUserId={session?.userId ?? null} />
      </div>
    </HydrationBoundary>
  );
}
