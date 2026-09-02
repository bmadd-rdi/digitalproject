import { formatFileSize, matchesAccept } from "../../../utils/fileValidation";
import type { SharedFileValue } from "./file-upload.types";
import { CLIENT_API_BASE } from "@/lib/client-api";

export { formatFileSize, matchesAccept };

const FILE_PREVIEW_BASE_URL = CLIENT_API_BASE.replace(/\/+$/, "");

/**
 * Rewrites attachment URLs to the temporary local preview host while keeping
 * the stored filename and API path unchanged. Blob/data URLs are left alone.
 */
export function getPreviewFileUrl(value: string) {
  if (!value || value.startsWith("blob:") || value.startsWith("data:")) {
    return value;
  }

  try {
    const source = new URL(value);
    const uploadMarker = "/uploads/files/";
    const uploadIndex = source.pathname.indexOf(uploadMarker);
    if (uploadIndex < 0) return value;

    const uploadPath = source.pathname.slice(uploadIndex);
    if (FILE_PREVIEW_BASE_URL.startsWith("/")) {
      return `${FILE_PREVIEW_BASE_URL}${uploadPath}${source.search}${source.hash}`;
    }

    const base = new URL(FILE_PREVIEW_BASE_URL);
    return `${base.origin}${base.pathname.replace(/\/+$/, "")}${uploadPath}${source.search}${source.hash}`;
  } catch {
    return value;
  }
}

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function fileKind(fileName: string, mimeType = "") {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (
    mimeType.startsWith("image/") ||
    ["png", "jpg", "jpeg", "webp", "gif"].includes(extension ?? "")
  ) {
    return "image";
  }
  if (mimeType === "application/pdf" || extension === "pdf") return "pdf";
  if (
    mimeType.includes("presentation") ||
    ["ppt", "pptx"].includes(extension ?? "")
  ) {
    return "ppt";
  }
  if (
    mimeType.includes("spreadsheet") ||
    ["xls", "xlsx", "csv"].includes(extension ?? "")
  ) {
    return "spreadsheet";
  }
  return "other";
}

export function getFileSource(value: SharedFileValue | string | null | undefined) {
  if (!value) return { name: "", source: "", mimeType: "", kind: "other" };
  if (typeof value === "string") {
    const name = decodeURIComponent(value.split("/").pop() || "Uploaded file");
    return {
      name,
      source: getPreviewFileUrl(value),
      mimeType: "",
      kind: fileKind(name),
    };
  }

  const name = value.name || "Uploaded file";
  const rawSource = typeof value.file === "string" ? value.file : value.url || "";
  const source = getPreviewFileUrl(rawSource);
  return {
    name,
    source,
    mimeType: value.mimeType || "",
    kind: fileKind(name, value.mimeType || value.type || ""),
  };
}
