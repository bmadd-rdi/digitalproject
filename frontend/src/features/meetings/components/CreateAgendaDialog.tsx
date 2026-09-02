"use client";

import { useState } from "react";
import { z } from "zod";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AgendaType, Project } from "../types";
import { useAgendaTypeOptions, useCreateAgenda } from "../hooks/useAgendas";

const formSchema = z.object({
  agendaNumber: z.string().trim().min(1, "กรุณาระบุเลขวาระ").max(50),
  agendaTypeId: z.number().int().min(1).max(5),
  title: z.string().trim().min(1, "กรุณาระบุหัวข้อวาระ").max(500),
  description: z.string().trim().max(5000),
  projectId: z.string().nullable(),
}).superRefine((value, ctx) => {
  if ((value.agendaTypeId === AgendaType.FOLLOW_UP || value.agendaTypeId === AgendaType.FOR_CONSIDERATION) && !value.projectId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["projectId"], message: "วาระประเภทนี้ต้องเลือกโครงการ" });
  }
});

interface CreateAgendaDialogProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableProjects: Project[];
}

export function CreateAgendaDialog({ meetingId, open, onOpenChange, availableProjects }: CreateAgendaDialogProps) {
  const createAgenda = useCreateAgenda(meetingId);
  const typeOptions = useAgendaTypeOptions();
  const [agendaNumber, setAgendaNumber] = useState("");
  const [agendaTypeId, setAgendaTypeId] = useState(String(AgendaType.FOR_INFORMATION));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("NONE");
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setAgendaNumber("");
    setAgendaTypeId(String(AgendaType.FOR_INFORMATION));
    setTitle("");
    setDescription("");
    setProjectId("NONE");
    setError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const submit = async () => {
    const parsed = formSchema.safeParse({
      agendaNumber,
      agendaTypeId: Number(agendaTypeId),
      title,
      description,
      projectId: projectId === "NONE" ? null : projectId,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "กรุณาตรวจสอบข้อมูล");
      return;
    }

    try {
      await createAgenda.mutateAsync({
        agendaNumber: parsed.data.agendaNumber,
        agendaTypeId: parsed.data.agendaTypeId as AgendaType,
        title: parsed.data.title,
        description: parsed.data.description || null,
        projectId: parsed.data.projectId,
      });
      toast.success("เพิ่มวาระสำเร็จ");
      handleOpenChange(false);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "ไม่สามารถเพิ่มวาระได้");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-[#00734b]" />เพิ่มวาระการประชุม</DialogTitle>
          <DialogDescription>เลือกประเภทวาระและเชื่อมโยงโครงการตามเงื่อนไขของวาระ</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agenda-number">เลขวาระ</Label>
              <Input id="agenda-number" value={agendaNumber} onChange={(event) => setAgendaNumber(event.target.value)} placeholder="เช่น 1 หรือ 2.1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agenda-type">ประเภทวาระ</Label>
              <Select value={agendaTypeId} onValueChange={setAgendaTypeId}>
                <SelectTrigger id="agenda-type"><SelectValue /></SelectTrigger>
                <SelectContent>{typeOptions.map((type) => <SelectItem key={type.id} value={String(type.id)}>{type.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda-title">หัวข้อวาระ</Label>
            <Input id="agenda-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda-description">รายละเอียด</Label>
            <Textarea id="agenda-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="agenda-project">โครงการที่เกี่ยวข้อง</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="agenda-project"><SelectValue placeholder="ไม่เชื่อมโยงโครงการ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">ไม่เชื่อมโยงโครงการ</SelectItem>
                {availableProjects.map((project) => <SelectItem key={project.project_id} value={project.project_id}>{project.project_code} — {project.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createAgenda.isPending}><X className="mr-2 h-4 w-4" />ยกเลิก</Button>
          <Button type="button" onClick={() => void submit()} disabled={createAgenda.isPending} className="bg-[#00734b] text-white hover:bg-[#005838]"><Save className="mr-2 h-4 w-4" />{createAgenda.isPending ? "กำลังบันทึก..." : "บันทึกวาระ"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
