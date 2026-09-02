import { redirect } from "next/navigation";
import { getUserSession } from "@/lib/session";
import { EditProfileForm } from "@/features/users/components/EditProfileForm";

export default async function EditUserProfilePage() {
  const session = await getUserSession();
  if (!session?.userId) redirect("/login");

  return <EditProfileForm userId={session.userId} />;
}
