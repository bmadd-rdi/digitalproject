"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Loader2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePublicProject } from "../../hooks/usePublicProjects";
import { getProjectStatusMeta, getThaiProjectStatus } from "../../utils/projectStatus";

export function PublicProjectDetailView({ projectId }: { projectId: string }) {
  const query = usePublicProject(projectId);

  if (query.isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-container-low text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" /> กำลังโหลดรายละเอียดโครงการ...</main>;
  }

  if (query.isError || !query.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface-container-low px-4">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <h1 className="text-xl font-bold">ไม่พบโครงการสาธารณะ</h1>
            <p className="text-sm text-muted-foreground">โครงการอาจถูกยกเลิกการเผยแพร่ หรือไม่มีอยู่ในระบบ</p>
            <Button asChild variant="outline"><Link href="/projects/public">กลับไปยังรายการโครงการ</Link></Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const project = query.data;
  const statusMeta = getProjectStatusMeta(project.projectStatus?.id, project.projectStatus?.name);

  return (
    <main className="min-h-screen bg-surface-container-low px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl space-y-5">
        <Button asChild variant="ghost" className="gap-2 px-0 hover:bg-transparent hover:text-primary">
          <Link href="/projects/public"><ArrowLeft className="size-4" /> กลับรายการโครงการสาธารณะ</Link>
        </Button>
        <Card className="overflow-hidden">
          <CardContent className="space-y-8 p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={statusMeta.className}>{getThaiProjectStatus(project.projectStatus?.id)}</Badge>
              <span className="break-all rounded-md bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">{project.projectCode ?? "ไม่ระบุรหัสโครงการ"}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary">รายละเอียดโครงการสาธารณะ</p>
              <h1 className="mt-2 break-words text-3xl font-extrabold leading-tight sm:text-4xl">{project.projectName ?? project.projectNameOriginal ?? "ไม่ระบุชื่อโครงการ"}</h1>
            </div>
            {project.projectNameOriginal && project.projectNameOriginal !== project.projectName && (
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-semibold text-muted-foreground">ชื่อโครงการเมื่อเริ่มสร้าง</p>
                <p className="mt-1 break-words text-sm">{project.projectNameOriginal}</p>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <Tag className="size-5 text-primary" />
                <p className="mt-3 text-xs text-muted-foreground">ประเภทโครงการ</p>
                <p className="mt-1 break-words font-semibold">{project.projectType?.name ?? "ไม่ระบุ"}</p>
              </div>
            </div>
            <p className="border-t pt-5 text-xs leading-6 text-muted-foreground">ข้อมูลหน้านี้เป็นข้อมูลสรุปที่เปิดเผยต่อสาธารณะเท่านั้น และไม่รวมข้อมูลส่วนบุคคล เอกสารแนบ หรือรายละเอียดข้อเสนอฉบับเต็ม</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
