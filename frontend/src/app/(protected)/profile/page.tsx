import { redirect } from "next/navigation";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { getUserProfileAction } from "@/features/users/actions/user.actions";
import { UserProfileTemplate } from "@/features/users/templates/UserProfileTemplate";
import { getUserSession } from "@/lib/session";

export default async function UserProfilePage() {
  const session = await getUserSession();
  if (!session?.userId) redirect("/login");

  const queryClient = new QueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: ["userProfile", session.userId],
      queryFn: () => getUserProfileAction(session.userId),
      staleTime: 1000 * 60 * 5,
    });
  } catch {
    // The client query will retry once if server-side prefetch is unavailable.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfileTemplate currentUserId={session.userId} />
    </HydrationBoundary>
  );
}
