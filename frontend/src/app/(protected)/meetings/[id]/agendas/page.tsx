"use client";

import { use, useMemo, useState } from "react";
import { AlertCircle, ArrowDown, ArrowUp, Check, GripVertical, Loader2, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MeetingWorkspaceHeader } from "@/features/meetings/components/MeetingWorkspaceHeader";
import { MeetingFilesPanel } from "@/features/meetings/components/MeetingFilesPanel";
import { useAgendas, useBulkCreateAgendas, useCreateAgenda, useDeleteAgenda, useReorderAgendas } from "@/features/meetings/hooks/useAgendas";
import { useMeeting } from "@/features/meetings/hooks/useMeetings";
import { AgendaType, type Agenda } from "@/features/meetings/types";

const BOARD_LABELS = { SMALL_BOARD: "คณะกรรมการกลั่นกรอง", BIG_BOARD: "คณะกรรมการนโยบาย" } as const;
const AGENDA_LABELS: Record<number, string> = {
  1: "วาระแจ้งเพื่อทราบ",
  2: "วาระรับรองรายงานการประชุม",
  3: "วาระสืบเนื่อง",
  4: "วาระเพื่อพิจารณา",
  5: "วาระอื่น ๆ",
};

function sortAgendas(items: Agenda[]) {
  return [...items].sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0));
}

export default function AgendasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const meetingQuery = useMeeting(id);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"projectCode" | "projectName" | "latestRequestedBudget">("projectCode");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const agendas = useAgendas(id, { search, sortBy, sortOrder });
  const bulkCreate = useBulkCreateAgendas(id);
  const createAgenda = useCreateAgenda(id);
  const deleteAgenda = useDeleteAgenda(id);
  const reorder = useReorderAgendas(id);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [bulkType, setBulkType] = useState<AgendaType>(AgendaType.FOR_CONSIDERATION);
  const [newAgendaType, setNewAgendaType] = useState<AgendaType>(AgendaType.FOR_INFORMATION);
  const [newAgendaTitle, setNewAgendaTitle] = useState("");
  const [draftOrder, setDraftOrder] = useState<Agenda[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const orderedAgendas = useMemo(() => sortAgendas(agendas.agendas), [agendas.agendas]);
  const boardLabel = meetingQuery.data?.meeting_type ? BOARD_LABELS[meetingQuery.data.meeting_type] : "การประชุม";
  const draftHasCurrentAgendas = draftOrder.length === orderedAgendas.length && draftOrder.every((draft) => orderedAgendas.some((agenda) => agenda.agenda_id === draft.agenda_id));
  const activeDraftOrder = draftHasCurrentAgendas ? draftOrder : orderedAgendas;

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((current) => current.includes(projectId) ? current.filter((id) => id !== projectId) : [...current, projectId]);
  };

  const moveDraft = (agendaId: string, direction: -1 | 1) => {
    setDraftOrder((current) => {
      const base = current.length === activeDraftOrder.length ? current : activeDraftOrder;
      const index = base.findIndex((agenda) => agenda.agenda_id === agendaId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= base.length) return base;
      const next = [...base];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  };

  const saveOrder = async () => {
    if (!meetingQuery.data?.updated_at || draftOrder.length === 0) return;
    try {
      await reorder.mutateAsync({
        expectedUpdatedAt: meetingQuery.data.updated_at,
        items: activeDraftOrder.map((agenda, index) => ({ agendaId: agenda.agenda_id, sortOrder: index + 1 })),
      });
      toast.success("บันทึกลำดับวาระสำเร็จ");
    } catch (error) {
      if ((error as { status?: number })?.status === 409) {
        await Promise.all([meetingQuery.refetch(), agendas.refetch?.()]);
        toast.error("ข้อมูลวาระถูกเปลี่ยนแปลงแล้ว กรุณาตรวจสอบลำดับใหม่");
      } else toast.error(error instanceof Error ? error.message : "ไม่สามารถบันทึกลำดับวาระได้");
    }
  };

  const createBulk = async () => {
    if (selectedProjectIds.length === 0) return;
    try {
      await bulkCreate.mutateAsync({ projectIds: selectedProjectIds, agendaTypeId: bulkType });
      setSelectedProjectIds([]);
      toast.success(`เพิ่มวาระโครงการ ${selectedProjectIds.length} รายการสำเร็จ`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถเพิ่มวาระโครงการได้");
    }
  };

  const createGeneralAgenda = async () => {
    if (!newAgendaTitle.trim()) return;
    try {
      await createAgenda.mutateAsync({
        agendaNumber: String(orderedAgendas.length + 1),
        agendaTypeId: newAgendaType,
        title: newAgendaTitle.trim(),
        projectId: null,
      });
      setNewAgendaTitle("");
      toast.success("เพิ่มวาระทั่วไปสำเร็จ");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "ไม่สามารถเพิ่มวาระได้");
    }
  };

  if (meetingQuery.isLoading || agendas.isLoading) return <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="size-5 animate-spin text-primary" />กำลังโหลดข้อมูลวาระ...</div>;
  if (meetingQuery.isError || !meetingQuery.data) return <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">ไม่พบข้อมูลการประชุม</div>;
  if (agendas.isError) return <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">{agendas.error?.message ?? "ไม่สามารถโหลดวาระได้"}</div>;

  const hasUnsavedOrder = activeDraftOrder.some((agenda, index) => agenda.agenda_id !== orderedAgendas[index]?.agenda_id);

  return (
    <div className="mx-auto flex w-full min-w-0 flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <MeetingWorkspaceHeader meeting={meetingQuery.data} activeTab="agendas" />
      <div className="flex flex-col gap-2"><h2 className="text-2xl font-extrabold">จัดการวาระการประชุม</h2><p className="text-sm text-muted-foreground">{boardLabel} · แยกการจัดวาระออกจากการบันทึกมติอย่างชัดเจน</p></div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="min-w-0 space-y-6">
          <Card className="overflow-hidden rounded-2xl"><CardHeader className="border-b"><CardTitle className="text-base">โครงการที่มีสิทธิ์เข้าวาระ</CardTitle><p className="text-sm text-muted-foreground">เลือกหลายโครงการเพื่อสร้างวาระโครงการพร้อมกัน</p></CardHeader><CardContent className="space-y-4 p-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัสหรือชื่อโครงการ" className="pl-9" /></div>
            <div className="flex gap-2"><Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}><SelectTrigger className="min-w-0 flex-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="projectCode">เรียงตามรหัส</SelectItem><SelectItem value="projectName">เรียงตามชื่อ</SelectItem><SelectItem value="latestRequestedBudget">เรียงตามงบประมาณ</SelectItem></SelectContent></Select><Button variant="outline" onClick={() => setSortOrder((value) => value === "asc" ? "desc" : "asc")} aria-label="สลับลำดับการเรียง">{sortOrder === "asc" ? "น้อยไปมาก" : "มากไปน้อย"}</Button></div>
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">{agendas.availableProjects.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">ไม่พบโครงการที่มีสิทธิ์</p> : agendas.availableProjects.map((project) => <label key={project.project_id} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:border-primary/50"><input type="checkbox" className="mt-1 size-4 accent-primary" checked={selectedProjectIds.includes(project.project_id)} onChange={() => toggleProject(project.project_id)} /><span className="min-w-0 flex-1"><span className="block break-words text-sm font-semibold">{project.name}</span><span className="block text-xs text-muted-foreground">{project.project_code} · งบประมาณ {new Intl.NumberFormat("th-TH").format(project.budget)} บาท</span></span></label>)}</div>
            <div className="rounded-xl bg-primary/5 p-3 text-sm">เลือกแล้ว <strong>{selectedProjectIds.length}</strong> โครงการ</div>
            <Select value={String(bulkType)} onValueChange={(value) => setBulkType(Number(value) as AgendaType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="3">วาระสืบเนื่อง</SelectItem><SelectItem value="4">วาระเพื่อพิจารณา</SelectItem></SelectContent></Select>
            <Button className="w-full text-white" disabled={selectedProjectIds.length === 0 || bulkCreate.isPending} onClick={() => void createBulk()}>{bulkCreate.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}เพิ่มวาระจากโครงการที่เลือก</Button>
          </CardContent></Card>

          <Card className="rounded-2xl"><CardHeader className="border-b"><CardTitle className="text-base">เพิ่มวาระทั่วไป</CardTitle></CardHeader><CardContent className="space-y-3 p-4"><Select value={String(newAgendaType)} onValueChange={(value) => setNewAgendaType(Number(value) as AgendaType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">วาระแจ้งเพื่อทราบ</SelectItem><SelectItem value="2">วาระรับรองรายงานการประชุม</SelectItem><SelectItem value="5">วาระอื่น ๆ</SelectItem></SelectContent></Select><Input value={newAgendaTitle} onChange={(event) => setNewAgendaTitle(event.target.value)} placeholder="ชื่อวาระ" /><Button variant="outline" className="w-full" disabled={!newAgendaTitle.trim() || createAgenda.isPending} onClick={() => void createGeneralAgenda()}><Plus className="mr-2 size-4" />เพิ่มวาระทั่วไป</Button></CardContent></Card>
        </div>

        <Card className="min-w-0 overflow-hidden rounded-2xl"><CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="text-base">วาระที่มีอยู่</CardTitle><p className="text-sm text-muted-foreground">ลากเพื่อจัดลำดับ หรือใช้ปุ่มเลื่อนสำหรับการเข้าถึง</p></div><div className="flex gap-2">{hasUnsavedOrder && <><Button variant="outline" onClick={() => setDraftOrder(orderedAgendas)}><X className="mr-2 size-4" />ยกเลิก</Button><Button className="text-white" disabled={reorder.isPending} onClick={() => void saveOrder()}>{reorder.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}บันทึกลำดับ</Button></>}</div></CardHeader><CardContent className="space-y-3 p-4">
          {activeDraftOrder.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground"><AlertCircle className="mx-auto mb-2 size-6" />ยังไม่มีวาระการประชุม</div> : activeDraftOrder.map((agenda, index) => <div key={agenda.agenda_id} draggable onDragStart={() => setDraggedId(agenda.agenda_id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (!draggedId || draggedId === agenda.agenda_id) return; const from = activeDraftOrder.findIndex((item) => item.agenda_id === draggedId); const to = index; const next = [...activeDraftOrder]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved); setDraftOrder(next); setDraggedId(null); }} className="flex min-w-0 items-start gap-3 rounded-xl border p-3"><GripVertical className="mt-1 size-4 shrink-0 cursor-grab text-muted-foreground" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">วาระที่ {index + 1}</Badge><Badge variant="secondary">{AGENDA_LABELS[agenda.agenda_type] ?? "วาระ"}</Badge>{agenda.resolution ? <Badge className="bg-emerald-600 text-white"><Check className="mr-1 size-3" />มีมติแล้ว</Badge> : agenda.project_id ? <Badge variant="outline">รอบันทึกมติ</Badge> : null}</div><p className="mt-2 break-words font-semibold">{agenda.title}</p>{agenda.project && <p className="break-words text-xs text-muted-foreground">{agenda.project.project_code ?? "-"} · {agenda.project.name ?? "-"}</p>}<div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" size="sm" asChild><a href={`/meetings/${id}/resolutions`}>{agenda.resolution ? "ดูมติ" : "บันทึกมติ"}</a></Button><Button variant="ghost" size="sm" disabled={index === 0} onClick={() => moveDraft(agenda.agenda_id, -1)}><ArrowUp className="mr-1 size-4" />เลื่อนขึ้น</Button><Button variant="ghost" size="sm" disabled={index === activeDraftOrder.length - 1} onClick={() => moveDraft(agenda.agenda_id, 1)}><ArrowDown className="mr-1 size-4" />เลื่อนลง</Button><Button variant="ghost" size="sm" disabled={!!agenda.resolution || deleteAgenda.isPending} onClick={() => { if (window.confirm("ต้องการลบวาระนี้หรือไม่")) deleteAgenda.mutate(agenda.agenda_id, { onSuccess: () => toast.success("ลบวาระสำเร็จ"), onError: (error) => toast.error(error instanceof Error ? error.message : "ไม่สามารถลบวาระได้") }); }}><X className="mr-1 size-4 text-destructive" />ลบวาระ</Button></div></div></div>)}
        </CardContent></Card>
      </div>
      <MeetingFilesPanel meetingId={id} />
    </div>
  );
}
