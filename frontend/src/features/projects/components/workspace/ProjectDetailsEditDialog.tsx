"use client";

import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { schemas } from "@/types/api-schemas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateProject } from "../../hooks/useProjectMutations";
import type { ProjectDetail } from "../../types/workspace";

type UpdateProjectPayload = z.infer<typeof schemas.UpdateProjectRequest>;

export function ProjectDetailsEditDialog({
  project,
  open,
  onOpenChange,
}: {
  project: ProjectDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const mutation = useUpdateProject(project.id);
  const [projectName, setProjectName] = useState(project.projectName ?? "");

  const save = async () => {
    const normalizedName = projectName.trim();
    if (!normalizedName) return;
    const payload: UpdateProjectPayload = { projectName: normalizedName };
    try {
      await mutation.mutateAsync(payload);
      toast.success("บันทึกข้อมูลโครงการแล้ว");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลโครงการได้");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !mutation.isPending && onOpenChange(nextOpen)}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-lg">
        <DialogHeader>
          <DialogTitle>แก้ไขชื่อโครงการ</DialogTitle>
          <DialogDescription>แก้ไขได้ตามสิทธิ์ของผู้ใช้งานและสถานะปัจจุบันของโครงการ</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="analyst-project-name">ชื่อโครงการ</Label>
            <Input id="analyst-project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={600} />
          </div>
        </div>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto" disabled={mutation.isPending} onClick={() => onOpenChange(false)}>ยกเลิก</Button>
          <Button className="w-full sm:w-auto" disabled={mutation.isPending || !projectName.trim()} onClick={() => void save()}>{mutation.isPending ? "กำลังบันทึก..." : "บันทึก"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
