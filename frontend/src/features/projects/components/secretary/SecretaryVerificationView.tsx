"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Loader2, RefreshCw, Search } from "lucide-react";
import { z } from "zod";
import { schemas } from "@/types/api-schemas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProjectPagination } from "../ProjectPagination";
import { ProjectTable } from "../ProjectTable";
import { SecretaryReviewDialog } from "./SecretaryReviewDialog";
import { useSecretaryPendingProjects } from "../../hooks/useSecretaryVerification";

type Project = z.infer<typeof schemas.Project>;

function TableSkeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

export function SecretaryVerificationView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const query = useSecretaryPendingProjects({ page, search });
  const projects = query.data?.data ?? [];
  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const countLabel = useMemo(
    () => query.isLoading ? "กำลังโหลด" : `${pagination?.total ?? 0} โครงการ`,
    [pagination?.total, query.isLoading],
  );

  return (
    <div className="mx-auto flex h-full w-full flex-col p-6 lg:p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
            <ClipboardCheck className="h-4 w-4" />
            งานตรวจสอบโครงการ
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#191c20]">รับหนังสือขอส่งโครงการ</h1>
          <p className="mt-1 text-sm text-[#3f4942]">ตรวจสอบโครงการที่ส่งมาจากทุกส่วนราชการ</p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
        >
          <RefreshCw className={query.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          โหลดข้อมูลใหม่
        </Button>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden rounded-md border-[#D1CDC7] shadow-sm">
        <div className="flex flex-col gap-3 border-b border-[#ededf4] p-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <h2 className="text-lg font-extrabold text-[#191c20]">โครงการรอตรวจสอบโดยเลขานุการ</h2>
            <p className="mt-1 text-sm text-muted-foreground">{countLabel}</p>
          </div>
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="ค้นหารหัสโครงการ ชื่อโครงการ หรือเจ้าของโครงการ"
              className="h-11 rounded-full pl-10"
            />
          </div>
        </div>

        {query.isError ? (
          <div className="flex flex-col items-center gap-3 p-16 text-center text-destructive">
            <p className="font-semibold">ไม่สามารถโหลดโครงการที่รอตรวจสอบได้</p>
            <p className="text-sm">เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง</p>
            <Button variant="outline" onClick={() => void query.refetch()}>ลองอีกครั้ง</Button>
          </div>
        ) : query.isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <ProjectTable
              data={projects}
              activeTab="all"
              showActions
              actionsFirst
              stickyActions
              actionsHeader="จัดการ"
              emptyMessage="ไม่มีโครงการที่รอการตรวจสอบจากเลขานุการ"
              hideAnalystColumn
              statusLanguage="th"
              renderActions={(project) => (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full min-w-20"
                  onClick={() => {
                    setSelectedProject(project);
                    setIsReviewOpen(true);
                  }}
                >
                  ตรวจสอบ
                </Button>
              )}
            />
            <ProjectPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}

        {query.isFetching && !query.isLoading && (
          <Loader2 className="absolute bottom-5 left-1/2 h-5 w-5 -translate-x-1/2 animate-spin text-primary" />
        )}
      </Card>

      <SecretaryReviewDialog
        project={selectedProject}
        open={isReviewOpen}
        onOpenChange={(open) => {
          setIsReviewOpen(open);
          if (!open) setSelectedProject(null);
        }}
      />
    </div>
  );
}
