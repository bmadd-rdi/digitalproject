"use client";

import { useMemo, useState } from "react";
import {
  Download,
  AlertTriangle,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Presentation,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatFileSize, getFileSource } from "./file-upload.utils";
import type { SharedFileValue } from "./file-upload.types";

function FileTypeIcon({ kind }: { kind: string }) {
  if (kind === "image") return <FileImage className="h-4 w-4" aria-hidden="true" />;
  if (kind === "ppt") return <Presentation className="h-4 w-4" aria-hidden="true" />;
  if (kind === "spreadsheet") {
    return <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />;
  }
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

export function FileAttachment({
  value,
  onRemove,
  canManage = true,
  className,
}: {
  value: SharedFileValue | string;
  onRemove?: () => void | Promise<void>;
  canManage?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const source = useMemo(() => getFileSource(value), [value]);
  const canPreview = source.kind === "image" || source.kind === "pdf";
  const canDelete = typeof value === "string" || value.canDelete !== false;

  const openFile = () => {
    if (!source.source) return;
    if (canPreview) {
      setOpen(true);
      return;
    }

    const link = document.createElement("a");
    link.href = source.source;
    link.download = source.name;
    link.rel = "noopener";
    link.click();
  };

  const confirmRemove = async () => {
    if (!onRemove || isRemoving) return;

    setIsRemoving(true);
    try {
      await onRemove();
      setDeleteDialogOpen(false);
    } catch {
      // The delete handler owns the error toast. Keep the confirmation open
      // so the user can retry after a failed request.
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex min-w-0 items-center gap-3 rounded-sm border border-slate-200 bg-white px-3 py-2.5 shadow-sm",
          className,
        )}
      >
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            source.kind === "pdf"
              ? "bg-red-50 text-red-600"
              : "bg-emerald-50 text-emerald-700",
          )}
        >
          <FileTypeIcon kind={source.kind} />
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={openFile}
            disabled={!source.source}
            className="block max-w-full truncate text-left text-sm font-semibold text-slate-800 underline-offset-2 hover:text-primary hover:underline disabled:cursor-default disabled:no-underline"
            title={canPreview ? "Preview file" : "Download file"}
          >
            {source.name}
          </button>
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
            <span>{canPreview ? "Click to preview" : "Click to download"}</span>
            {typeof value !== "string" && (
              <span>• {formatFileSize(value.fileSize)}</span>
            )}
            {typeof value !== "string" && value.uploader && (
              <span className="truncate">
                • Uploaded by {value.uploader.firstName} {value.uploader.lastName}
              </span>
            )}
          </div>
          {typeof value !== "string" && value.description && (
            <p className="mt-1 truncate text-xs text-slate-600" title={value.description}>
              {value.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {canPreview ? (
            <span className="hidden rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 sm:inline-flex">
              Preview
            </span>
          ) : (
            <Download className="hidden h-4 w-4 text-slate-400 sm:block" aria-label="Download" />
          )}
          {onRemove && canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!canManage || isRemoving}
              className="text-slate-400 hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${source.name}`}
              title={canManage ? "Remove file" : "File removal is disabled"}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(nextOpen) => {
          if (!isRemoving) setDeleteDialogOpen(nextOpen);
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <AlertDialogTitle>ยืนยันการลบไฟล์</AlertDialogTitle>
            <AlertDialogDescription className="break-words">
              คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ &quot;{source.name}&quot;?
              การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>ยกเลิก</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmRemove()}
              disabled={isRemoving}
            >
              {isRemoving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isRemoving ? "กำลังลบ..." : "ลบไฟล์"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[min(92vh,900px)] w-[min(96vw,1100px)] max-w-none flex-col p-4 sm:p-6">
          <DialogHeader className="shrink-0 pr-10">
            <DialogTitle className="truncate">{source.name}</DialogTitle>
            <DialogDescription>
              {canPreview ? "File preview" : "File download"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {source.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={source.source}
                alt={source.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <iframe
                src={source.source}
                title={source.name}
                className="h-full w-full border-0"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
