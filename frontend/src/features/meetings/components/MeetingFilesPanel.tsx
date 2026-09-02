"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileText, Loader2, Trash2, Upload, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CLIENT_API_BASE } from "@/lib/client-api";
import { useMeetingFiles, type MeetingFile } from "../hooks/useMeetingFiles";
import { useHasRole } from "@/features/auth/RoleContext";

const DOCUMENT_LABELS: Record<MeetingFile["documentType"], string> = {
  MEETING_DOCUMENT: "เอกสารประกอบการประชุม",
  MEETING_MINUTES: "รายงานการประชุม",
};

function formatBytes(value: number | null) {
  if (!value) return "ไม่ทราบขนาด";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getLimit(file: File, policy: ReturnType<typeof useMeetingFiles>["policy"]) {
  if (!policy) return null;
  const extension = `.${file.name.toLowerCase().split(".").pop() ?? ""}`;
  if (!policy.acceptedExtensions.includes(extension)) return "รองรับเฉพาะไฟล์ PDF, Word, Excel, JPG และ PNG เท่านั้น";
  if (file.type && !policy.acceptedMimeTypes.includes(file.type)) return "ชนิดไฟล์ไม่ตรงกับนามสกุลไฟล์ที่เลือก";
  const maxBytes = file.type === "application/pdf" || extension === ".pdf"
    ? policy.limits.pdfBytes
    : file.type.startsWith("image/") || [".jpg", ".jpeg", ".png"].includes(extension)
      ? policy.limits.imageBytes
      : policy.limits.documentBytes;
  if (file.size > maxBytes) return `ไฟล์มีขนาดเกิน ${Math.round(maxBytes / 1024 / 1024)} MB`;
  return null;
}

export function MeetingFilesPanel({ meetingId }: { meetingId: string }) {
  const isSecretary = useHasRole("secretary");
  if (!isSecretary) return null;
  return <SecretaryMeetingFilesPanel meetingId={meetingId} />;
}

function SecretaryMeetingFilesPanel({ meetingId }: { meetingId: string }) {
  const files = useMeetingFiles(meetingId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<MeetingFile["documentType"]>("MEETING_DOCUMENT");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const policyText = useMemo(() => {
    if (!files.policy) return "กำลังโหลดข้อกำหนดไฟล์...";
    return `PDF ไม่เกิน ${Math.round(files.policy.limits.pdfBytes / 1024 / 1024)} MB · รูปภาพไม่เกิน ${Math.round(files.policy.limits.imageBytes / 1024 / 1024)} MB · Word/Excel ไม่เกิน ${Math.round(files.policy.limits.documentBytes / 1024 / 1024)} MB`;
  }, [files.policy]);

  const chooseFile = (file: File | undefined) => {
    if (!file) return;
    const validation = getLimit(file, files.policy);
    setError(validation);
    setSelectedFile(validation ? null : file);
  };

  const upload = async () => {
    if (!selectedFile) {
      setError("กรุณาเลือกไฟล์ก่อนอัปโหลด");
      return;
    }
    setError(null);
    try {
      await files.uploadFile({ file: selectedFile, documentType });
      setSelectedFile(null);
      toast.success("อัปโหลดไฟล์สำเร็จ");
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "อัปโหลดไฟล์ไม่สำเร็จ";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <Card className="overflow-hidden rounded-2xl">
      <CardHeader className="border-b">
        <CardTitle className="text-base">เอกสารการประชุม</CardTitle>
        <p className="text-sm text-muted-foreground">เฉพาะเลขานุการเท่านั้นที่สามารถจัดการเอกสารการประชุมได้</p>
      </CardHeader>
      <CardContent className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div
            role="button"
            tabIndex={0}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); chooseFile(event.dataTransfer.files?.[0]); }}
            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}
          >
            <Upload className="mx-auto mb-3 size-8 text-primary" />
            <p className="font-semibold">ลากไฟล์มาวางที่นี่ หรือเลือกไฟล์จากเครื่อง</p>
            <p className="mt-1 text-xs text-muted-foreground">รองรับ PDF, Word, Excel, JPG และ PNG</p>
            <p className="mt-1 text-xs text-muted-foreground">{policyText}</p>
            <input ref={inputRef} type="file" className="sr-only" accept={files.policy?.acceptedExtensions.join(",") ?? ".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"} onChange={(event) => chooseFile(event.target.files?.[0])} />
            <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>เลือกไฟล์</Button>
          </div>

          <div className="space-y-4 rounded-2xl border bg-muted/20 p-4">
            <div>
              <p className="mb-2 text-sm font-semibold">ประเภทเอกสาร</p>
              <Select value={documentType} onValueChange={(value) => setDocumentType(value as MeetingFile["documentType"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEETING_DOCUMENT">{DOCUMENT_LABELS.MEETING_DOCUMENT}</SelectItem>
                  <SelectItem value="MEETING_MINUTES">{DOCUMENT_LABELS.MEETING_MINUTES}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedFile ? (
              <div className="rounded-xl border bg-background p-3">
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{selectedFile.name}</p><p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p></div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} aria-label="ล้างไฟล์ที่เลือก"><X className="size-4" /></Button>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">ยังไม่ได้เลือกไฟล์</p>}
            {files.isUploading && <div className="space-y-1"><div className="flex justify-between text-xs"><span>กำลังอัปโหลด</span><span>{files.uploadProgress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${files.uploadProgress}%` }} /></div></div>}
            {error && <p role="alert" className="break-words rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="button" className="flex-1 text-white" disabled={!selectedFile || files.isUploading} onClick={() => void upload()}>{files.isUploading && <Loader2 className="mr-2 size-4 animate-spin" />}อัปโหลด</Button>
              {error && selectedFile && !files.isUploading && <Button type="button" variant="outline" onClick={() => void upload()}><RotateCcw className="mr-2 size-4" />ลองใหม่</Button>}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">ไฟล์ที่อัปโหลดแล้ว</h3><span className="text-xs text-muted-foreground">{files.files.length} ไฟล์</span></div>
          {files.isLoading ? <p className="rounded-xl border p-5 text-sm text-muted-foreground">กำลังโหลดรายการไฟล์...</p> : files.files.length === 0 ? <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">ยังไม่มีไฟล์เอกสารการประชุม</p> : (
            <ul className="divide-y rounded-xl border">
              {files.files.map((file) => <li key={file.id} className="flex min-w-0 flex-wrap items-center gap-3 p-4">
                <FileText className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1"><p className="break-words text-sm font-medium">{file.originalFileName ?? "ไม่ระบุชื่อไฟล์"}</p><p className="text-xs text-muted-foreground">{DOCUMENT_LABELS[file.documentType]} · {file.mimeType ?? "ไม่ทราบชนิดไฟล์"} · {formatBytes(file.sizeBytes)} · {formatDate(file.createdAt)}</p></div>
                <div className="flex shrink-0 gap-1"><Button variant="ghost" size="icon" asChild aria-label="ดาวน์โหลดไฟล์"><a href={`${CLIENT_API_BASE}/meetings/${meetingId}/files/${file.id}/download`}><Download className="size-4" /></a></Button><Button variant="ghost" size="icon" disabled={files.isDeleting} aria-label="ลบไฟล์" onClick={() => { if (window.confirm("ต้องการลบไฟล์นี้หรือไม่")) files.deleteFile(file.id).catch((deleteError) => setError(deleteError instanceof Error ? deleteError.message : "ลบไฟล์ไม่สำเร็จ")); }}><Trash2 className="size-4 text-destructive" /></Button></div>
              </li>)}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
