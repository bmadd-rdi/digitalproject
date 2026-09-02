"use client";

import { useId, useRef, useState } from "react";
import { Loader2, Paperclip, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatFileSize, matchesAccept } from "../../../utils/fileValidation";

type FileUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  accept?: string;
  onUpload: (file: File, description: string) => Promise<void>;
};

export function FileUploadModal({
  open,
  onOpenChange,
  title,
  accept,
  onUpload,
}: FileUploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const descriptionId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSelectedFile(null);
    setDescription("");
    setError(null);
    setIsDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isUploading) return;
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const selectFile = (file: File | undefined) => {
    if (!file) return;
    if (!matchesAccept(file, accept)) {
      setError(`ไม่รองรับประเภทไฟล์นี้ ประเภทที่รองรับ: ${accept || "ไฟล์ประเภทนี้"}`);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    const trimmedDescription = description.trim();
    if (!selectedFile || !trimmedDescription || isUploading) return;

    setError(null);
    setIsUploading(true);
    try {
      await onUpload(selectedFile, trimmedDescription);
      resetForm();
      onOpenChange(false);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "อัปโหลดเอกสารไม่สำเร็จ",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = Boolean(selectedFile && description.trim()) && !isUploading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] min-w-sm md:min-w-md lg:min-w-6xl  overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="wrap-break-word pr-8">อัปโหลด{title}</DialogTitle>
          <DialogDescription>
            เลือกเอกสารและระบุคำอธิบายก่อนอัปโหลด
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                inputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              selectFile(event.dataTransfer.files[0]);
            }}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed px-5 py-7 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/60",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => selectFile(event.target.files?.[0])}
              disabled={isUploading}
            />
            <UploadCloud className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-sm font-semibold">ลากเอกสารมาวางที่นี่</p>
            <p className="mt-1 text-xs text-muted-foreground">หรือคลิกเพื่อเลือกไฟล์</p>
            {accept && (
              <p className="mt-2 wrap-break-word text-[11px] text-muted-foreground">
                ไฟล์ที่รองรับ: {accept}
              </p>
            )}
          </div>

          {selectedFile && (
            <div className="flex min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden rounded-md border bg-slate-50 px-3 py-2">
              <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                <Paperclip className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p
                    className="max-w-full truncate text-sm font-medium"
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setSelectedFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                disabled={isUploading}
                aria-label="นำเอกสารที่เลือกออก"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-semibold">
              คำอธิบายเอกสาร
            </label>
            <Textarea
              id={descriptionId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="ถ้าไม่มีคำอธิบายให้กรอกว่า ไม่มี"
              rows={3}
              disabled={isUploading}
              aria-invalid={Boolean(error)}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            ยกเลิก
          </Button>
          <Button type="button" onClick={() => void handleUpload()} disabled={!canUpload}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
