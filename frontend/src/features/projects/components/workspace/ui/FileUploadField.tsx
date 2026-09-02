"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { AlertCircle, CheckCircle2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FileUploadModal } from "./FileUploadModal";
import { FileAttachment } from "./FileAttachment";
import { deleteProjectFile, uploadProjectFile } from "./file-upload.api";
import {
  fileKind,
  formatFileSize,
  matchesAccept,
  UUID_PATTERN,
} from "./file-upload.utils";
import type {
  FileUploadFieldProps,
  SharedFileValue,
} from "./file-upload.types";

export { FileAttachment, deleteProjectFile };
export type { FileUploadFieldProps, SharedFileValue } from "./file-upload.types";

export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export function FileUploadField({
  projectId,
  docTypeName,
  title,
  accept,
  value,
  onChange,
  onUploadingChange,
  showDescription = false,
  descriptionRequired = false,
  descriptionError,
  canManage = true,
  allowNewVersion = false,
  uploadButtonLabel = "Upload file",
  className,
}: FileUploadFieldProps) {
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = typeof value === "string" ? createLegacyValue(value) : value;

  const setUploading = (next: boolean) => {
    setIsUploading(next);
    onUploadingChange?.(next);
  };

  const invalidateProjectData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["proposals", "draft", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["proposals", "submitted", projectId] }),
    ]);
  };

  const handleUpload = async (file: File, description: string) => {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      throw new Error("Please provide a description for this file.");
    }
    if (!matchesAccept(file, accept)) {
      throw new Error(`Unsupported file type. Allowed: ${accept || "this file type"}.`);
    }
    if (file.type === "application/pdf" && file.size > MAX_PDF_SIZE_BYTES) {
      throw new Error(
        `PDF files must be smaller than ${formatFileSize(MAX_PDF_SIZE_BYTES)}.`,
      );
    }
    if (file.type.startsWith("image/") && file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error(
        `Images must be smaller than ${formatFileSize(MAX_IMAGE_SIZE_BYTES)} before compression.`,
      );
    }

    setError(null);
    setUploading(true);
    try {
      let uploadFile = file;
      if (file.type.startsWith("image/")) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.82,
          fileType: file.type === "image/png" ? "image/png" : "image/jpeg",
        });
        uploadFile = new File([compressed], file.name, {
          type: compressed.type,
          lastModified: Date.now(),
        });
      }

      const uploaded = await uploadProjectFile(
        uploadFile,
        projectId,
        docTypeName,
        trimmedDescription,
      );
      const fileSize = uploaded.fileSize ?? uploadFile.size;

      onChange({
        id: uploaded.attachmentId ?? crypto.randomUUID(),
        name: file.name,
        type: fileKind(file.name, file.type),
        mimeType: file.type,
        size: formatFileSize(fileSize),
        fileSize,
        url: uploaded.url,
        file: uploaded.url,
        description: trimmedDescription,
        canDelete: uploaded.canDelete,
        uploader: uploaded.uploader ?? null,
      });
      await invalidateProjectData();
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "File upload failed.";
      setError(message);
      toast.error("File upload failed", { description: message });
      throw uploadError instanceof Error ? uploadError : new Error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!current || isDeleting) return;
    setError(null);
    setIsDeleting(true);
    try {
      if (UUID_PATTERN.test(current.id)) await deleteProjectFile(current.id);
      onChange(null);
      await invalidateProjectData();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : "File deletion failed.";
      setError(message);
      toast.error("File deletion failed", { description: message });
      throw deleteError instanceof Error ? deleteError : new Error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section
      className={cn(
        "rounded-md border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-800">{title}</h3>
          <p className="truncate text-xs text-slate-500">
            {current ? "File attached" : accept ? `Accepted: ${accept}` : "No file attached"}
          </p>
        </div>

        {canManage && (!current || allowNewVersion) && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setUploadModalOpen(true)}
            disabled={isUploading}
            className="w-full shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-50 sm:w-auto"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            {current ? uploadButtonLabel : "Upload file"}
          </Button>
        )}
      </div>

      <div className="mt-3">
        {current ? (
          <FileAttachment
            value={current}
            onRemove={handleRemove}
            canManage={canManage && !isDeleting}
          />
        ) : canManage ? (
          <div className="border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
            Select a file and add its description to upload it.
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Attachments are read-only at this project stage.
          </div>
        )}
      </div>

      {current && showDescription && !current.description && descriptionRequired && canManage && (
        <Input
          value={current.description || ""}
          onChange={(event) => onChange({ ...current, description: event.target.value })}
          placeholder="Description is required"
          className={cn("mt-3 h-9 text-sm", descriptionError && "border-red-500")}
        />
      )}

      {(error || descriptionError) && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600" role="alert">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error || descriptionError}
        </p>
      )}

      {current && !error && (
        <p className="mt-2 flex items-center gap-1 text-[11px] text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Saved to project attachments
        </p>
      )}

      {canManage && (
        <FileUploadModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          title={title}
          accept={accept}
          onUpload={handleUpload}
        />
      )}
    </section>
  );
}

function createLegacyValue(url: string): SharedFileValue {
  const name = decodeURIComponent(url.split("/").pop() || "Uploaded file");
  return {
    id: "uploaded",
    name,
    type: fileKind(name),
    url,
    file: url,
  };
}
