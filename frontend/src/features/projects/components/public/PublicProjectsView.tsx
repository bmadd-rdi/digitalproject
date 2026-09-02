"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Eye, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProjectPagination } from "../ProjectPagination";
import { usePublicProjects } from "../../hooks/usePublicProjects";
import { getProjectStatusMeta, getThaiProjectStatus } from "../../utils/projectStatus";

export function PublicProjectsView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = usePublicProjects({ page, search });
  const projects = query.data?.data ?? [];
  const totalPages = query.data?.pagination.totalPages ?? 1;

  return (
    <main className="min-h-screen bg-surface-container-low px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border bg-background p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-bold text-primary">โครงการดิจิทัลกรุงเทพมหานคร</p>
              <h1 className="mt-2 break-words text-3xl font-extrabold tracking-tight sm:text-4xl">โครงการที่เผยแพร่สู่สาธารณะ</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">ค้นหาและติดตามข้อมูลโครงการที่เปิดเผยต่อสาธารณะ โดยไม่ต้องเข้าสู่ระบบ</p>
            </div>
            <Button asChild variant="outline" className="w-full shrink-0 sm:w-auto">
              <Link href="/">กลับหน้าหลัก</Link>
            </Button>
          </div>
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1); }}
              placeholder="ค้นหาด้วยชื่อโครงการหรือรหัสโครงการ"
              className="h-11 pl-10"
              aria-label="ค้นหาโครงการสาธารณะ"
            />
          </div>
        </header>

        {query.isError ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <AlertCircle className="size-10 text-destructive" />
              <h2 className="text-lg font-bold">ไม่สามารถโหลดข้อมูลโครงการได้</h2>
              <p className="text-sm text-muted-foreground">กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง</p>
              <Button variant="outline" onClick={() => void query.refetch()}>ลองใหม่</Button>
            </CardContent>
          </Card>
        ) : query.isLoading ? (
          <div className="flex min-h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="mr-2 size-5 animate-spin" /> กำลังโหลดข้อมูลโครงการ...
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center gap-2 p-8 text-center">
              <Eye className="size-10 text-muted-foreground/50" />
              <h2 className="text-lg font-bold">ยังไม่มีโครงการที่เผยแพร่</h2>
              <p className="text-sm text-muted-foreground">ลองเปลี่ยนคำค้นหา หรือกลับมาตรวจสอบใหม่ภายหลัง</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const statusMeta = getProjectStatusMeta(project.projectStatus?.id, project.projectStatus?.name);
                return (
                  <Card key={project.id} className="flex min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-md">
                    <CardContent className="flex h-full min-w-0 flex-col gap-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span className="min-w-0 break-all font-mono text-xs text-muted-foreground">{project.projectCode ?? "ไม่ระบุรหัส"}</span>
                        <Badge variant="outline" className={`shrink-0 ${statusMeta.className}`}>{getThaiProjectStatus(project.projectStatus?.id)}</Badge>
                      </div>
                      <h2 className="min-w-0 break-words text-lg font-bold leading-7">{project.projectName ?? project.projectNameOriginal ?? "ไม่ระบุชื่อโครงการ"}</h2>
                      {project.projectNameOriginal && project.projectNameOriginal !== project.projectName && (
                        <p className="break-words text-xs text-muted-foreground">ชื่อเริ่มต้น: {project.projectNameOriginal}</p>
                      )}
                      <div className="mt-auto flex items-end justify-between gap-3 border-t pt-4 text-xs text-muted-foreground">
                        <Button asChild size="sm" className="shrink-0 gap-1 text-white [&_svg]:text-white">
                          <Link href={`/projects/public/${project.id}`} className="text-white hover:text-white">
                            <span className="text-white">ดูรายละเอียด</span>
                            <ArrowRight className="size-3.5 text-white" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {totalPages > 1 && <ProjectPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
          </>
        )}
      </div>
    </main>
  );
}
