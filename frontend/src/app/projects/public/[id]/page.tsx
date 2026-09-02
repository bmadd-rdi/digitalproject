"use client";

import { useParams } from "next/navigation";
import { PublicProjectDetailView } from "@/features/projects/components/public/PublicProjectDetailView";

export default function PublicProjectDetailPage() {
  const params = useParams<{ id: string }>();
  return <PublicProjectDetailView projectId={params.id} />;
}
