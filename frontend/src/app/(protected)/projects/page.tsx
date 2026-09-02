// src/app/(protected)/projects/page.tsx
import { ProjectsTemplate } from "@/features/projects/templates/ProjectsTemplate";
import { getUserSession } from "@/lib/session";
import { normalizeRoles } from "@/lib/route-config";

export default async function ProjectsPage() {
  const session = await getUserSession();
  return <ProjectsTemplate userRoles={normalizeRoles(session?.roles)} />;
}
