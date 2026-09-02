import { CLIENT_API_BASE } from "@/lib/client-api";
import type { ProjectAttachmentTypeName } from "../../../types/project-attachment-type";
import type { SharedFileValue, UploadedProjectFile } from "./file-upload.types";

export async function uploadProjectFile(
  file: File,
  projectId: string,
  docTypeName: ProjectAttachmentTypeName,
  description: string,
): Promise<UploadedProjectFile> {
  const body = new FormData();
  body.append("file", file);
  body.append("projectId", projectId);
  body.append("docTypeName", docTypeName);
  body.append("description", description.trim());

  const response = await fetch(`${CLIENT_API_BASE}/uploads/document`, {
    method: "POST",
    credentials: "include",
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.data?.url) {
    throw new Error(payload.message ?? payload.error ?? "File upload failed");
  }

  return payload.data as UploadedProjectFile;
}

export async function deleteProjectFile(fileId: string) {
  const response = await fetch(
    `${CLIENT_API_BASE}/uploads/files/${encodeURIComponent(fileId)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message ?? payload.error ?? "File deletion failed");
  }
}

export type UploadedFileUploader = SharedFileValue["uploader"];
