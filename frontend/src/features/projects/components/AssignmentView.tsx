"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Loader2, Search, Users, UserRoundCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectPagination } from "./ProjectPagination";
import { AssignmentTable } from "./AssignmentTable";
import {
  useAnalystWorkloads,
  useAssignmentPendingProjects,
  useAssignProject,
  useBulkAssignProjects,
} from "../hooks/useProjectAssignment";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function workloadClassName(count: number) {
  if (count >= 6) return "border-red-200 bg-red-50 text-red-700";
  if (count >= 3) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export function AssignmentView() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingProjectId, setPendingProjectId] = useState<string | null>(null);
  const [bulkAnalystId, setBulkAnalystId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const projectsQuery = useAssignmentPendingProjects({
    page,
    limit: 20,
    search: debouncedSearch,
  });
  const analystsQuery = useAnalystWorkloads();
  const assignMutation = useAssignProject();
  const bulkMutation = useBulkAssignProjects();

  const projects = projectsQuery.data?.data ?? [];
  const analysts = useMemo(
    () => analystsQuery.data?.data ?? [],
    [analystsQuery.data?.data],
  );
  const pagination = projectsQuery.data?.pagination;
  const selectedCount = selectedIds.length;

  const selectedAnalyst = useMemo(
    () => analysts.find((analyst) => analyst.userId === bulkAnalystId),
    [analysts, bulkAnalystId],
  );

  const toggleSelected = (projectId: string) => {
    setSelectedIds((current) =>
      current.includes(projectId)
        ? current.filter((id) => id !== projectId)
        : [...current, projectId],
    );
  };

  const selectAll = (checked: boolean) => {
    setSelectedIds(checked ? projects.map((project) => project.id) : []);
  };

  const assignSingle = async (projectId: string, analystId: string) => {
    setPendingProjectId(projectId);
    try {
      await assignMutation.mutateAsync({ projectId, payload: { analystId } });
      setSelectedIds((current) => current.filter((id) => id !== projectId));
      toast.success("มอบหมายโครงการสำเร็จ");
    } catch (error) {
      toast.error(errorMessage(error, "ไม่สามารถมอบหมายโครงการได้"));
    } finally {
      setPendingProjectId(null);
    }
  };

  const confirmBulkAssignment = (analystId: string) => {
    setBulkAnalystId(analystId);
  };

  const assignBulk = async () => {
    if (!bulkAnalystId || selectedIds.length === 0) return;

    try {
      await bulkMutation.mutateAsync({
        projectIds: selectedIds,
        analystId: bulkAnalystId,
      });
      setSelectedIds([]);
      setBulkAnalystId(null);
      toast.success(`มอบหมาย ${selectedIds.length} โครงการสำเร็จ`);
    } catch (error) {
      toast.error(errorMessage(error, "ไม่สามารถมอบหมายโครงการได้"));
    }
  };

  return (
    <main className="flex min-h-full w-full flex-col gap-6 p-6 lg:p-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          มอบหมายโครงการ
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เลือกนักวิเคราะห์เพื่อเริ่มกระบวนการวิเคราะห์โครงการ
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card size="sm" className="border-orange-200 bg-orange-50/40">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">รอการมอบหมาย</p>
              <p className="mt-1 text-2xl font-bold text-orange-700">
                {projectsQuery.isLoading ? "-" : pagination?.total ?? 0} <span className="text-sm font-normal">โครงการ</span>
              </p>
            </div>
            <ClipboardList className="h-6 w-6 text-orange-600" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">เลือกแล้ว</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {selectedCount} <span className="text-sm font-normal text-muted-foreground">โครงการ</span>
              </p>
            </div>
            <UserRoundCheck className="h-6 w-6 text-primary" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">นักวิเคราะห์ที่พร้อมใช้งาน</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">
                {analystsQuery.isLoading ? "-" : analysts.length} <span className="text-sm font-normal text-muted-foreground">ท่าน</span>
              </p>
            </div>
            <Users className="h-6 w-6 text-blue-600" />
          </CardContent>
        </Card>
      </section>

      <Card className="min-h-0 flex-1">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>นักวิเคราะห์และภาระงาน</CardTitle>
          <CardDescription>จำนวนงานปัจจุบันใช้ประกอบการกระจายงานอย่างเหมาะสม</CardDescription>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {analystsQuery.isLoading ? (
              [1, 2, 3].map((item) => <Skeleton key={item} className="h-8 w-40 shrink-0" />)
            ) : analysts.length === 0 ? (
              <p className="text-sm text-muted-foreground">ไม่พบผู้ใช้งานที่มีบทบาทนักวิเคราะห์</p>
            ) : (
              analysts.map((analyst) => (
                <Badge key={analyst.userId} variant="outline" className={`shrink-0 gap-1.5 ${workloadClassName(analyst.activeTaskCount)}`}>
                  {analyst.firstName} {analyst.lastName}: {analyst.activeTaskCount} งาน
                </Badge>
              ))
            )}
          </div>
        </CardHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b p-4 sm:p-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาชื่อโครงการ, รหัสโครงการ, เจ้าของ..."
                className="pl-9"
              />
            </div>
            {projectsQuery.isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>

          {projectsQuery.isError ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-12 text-center">
              <p className="font-semibold">ไม่สามารถโหลดรายการโครงการได้</p>
              <p className="text-sm text-muted-foreground">{errorMessage(projectsQuery.error, "เกิดข้อผิดพลาดจากระบบ")}</p>
              <Button variant="outline" onClick={() => projectsQuery.refetch()}>ลองใหม่</Button>
            </div>
          ) : projectsQuery.isLoading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4, 5].map((row) => <Skeleton key={row} className="h-14 w-full" />)}
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-12 text-center text-sm text-muted-foreground">
              ไม่มีโครงการที่รอการมอบหมาย
            </div>
          ) : (
            <AssignmentTable
              projects={projects}
              analysts={analysts}
              selectedIds={selectedIds}
              onSelectToggle={toggleSelected}
              onSelectAll={selectAll}
              onAssignSingle={assignSingle}
              onRequestBulkAssign={confirmBulkAssignment}
              pendingProjectId={pendingProjectId}
              isBulkAssigning={bulkMutation.isPending}
            />
          )}

          {!projectsQuery.isLoading && pagination && pagination.totalPages > 1 && (
            <ProjectPagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={(nextPage) => {
                setPage(nextPage);
                setSelectedIds([]);
              }}
            />
          )}
        </div>
      </Card>

      <AlertDialog open={Boolean(bulkAnalystId)} onOpenChange={(open) => !open && setBulkAnalystId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการมอบหมายโครงการ</AlertDialogTitle>
            <AlertDialogDescription>
              มอบหมาย {selectedCount} โครงการให้ {selectedAnalyst ? `${selectedAnalyst.firstName} ${selectedAnalyst.lastName}` : "นักวิเคราะห์ที่เลือก"} และเริ่มสถานะกำลังวิเคราะห์หรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkMutation.isPending}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              disabled={bulkMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void assignBulk();
              }}
            >
              {bulkMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ยืนยันการมอบหมาย
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
