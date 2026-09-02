import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { DocumentFile, ProjectResponse } from "../types/workspace";
import {
  PROJECT_ATTACHMENT_TYPE_NAMES,
  type ProjectAttachmentType,
} from "../types/project-attachment-type";

export type ProjectAttachment = ProjectResponse["attachments"][number];

const EMPTY_ATTACHMENTS: ProjectAttachment[] = [];
const KNOWN_ATTACHMENT_TYPE_NAMES = new Set<string>(
  Object.values(PROJECT_ATTACHMENT_TYPE_NAMES),
);

function getDocumentType(fileName: string, mimeType: string): DocumentFile["type"] {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(extension ?? "")) return "image";
  if (mimeType === "application/pdf" || extension === "pdf") return "pdf";
  if (mimeType.includes("presentation") || ["ppt", "pptx"].includes(extension ?? "")) return "ppt";
  return "other";
}

function mapAttachment(attachment: ProjectAttachment): DocumentFile {
  return {
    id: attachment.id,
    name: attachment.fileName,
    type: getDocumentType(attachment.fileName, attachment.fileType),
    mimeType: attachment.fileType,
    fileSize: attachment.fileSize,
    url: attachment.fileUrl,
    file: attachment.fileUrl,
    description: attachment.description ?? undefined,
    createdAt: attachment.createdAt,
    canDelete:
      typeof attachment.canDelete === "boolean" ? attachment.canDelete : undefined,
    uploader: attachment.uploader,
  };
}

function compareAttachments(left: ProjectAttachment, right: ProjectAttachment) {
  const createdAtDifference =
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  return createdAtDifference || right.id.localeCompare(left.id);
}

function resolveAttachmentTypeName(
  attachment: ProjectAttachment,
  attachmentTypes: readonly Pick<ProjectAttachmentType, "id" | "name">[],
) {
  if (attachment.docTypeName?.trim()) {
    const directName = attachment.docTypeName.trim();
    if (KNOWN_ATTACHMENT_TYPE_NAMES.has(directName)) return directName;
  }

  const lookupName = attachmentTypes.find(
    (type) => type.id === attachment.docTypeId,
  )?.name;
  return lookupName && KNOWN_ATTACHMENT_TYPE_NAMES.has(lookupName)
    ? lookupName
    : null;
}

export function useProjectDocuments(
  initialAttachments: ProjectAttachment[] = EMPTY_ATTACHMENTS,
  attachmentTypes: readonly Pick<ProjectAttachmentType, "id" | "name">[] = [],
) {
  const [presentation, setPresentation] = useState<DocumentFile | null>(null);
  const [quotation, setQuotation] = useState<DocumentFile | null>(null);
  const [onePage, setOnePage] = useState<DocumentFile | null>(null);
  const [bmaDcUsage, setBmaDcUsage] = useState<DocumentFile | null>(null);
  const [approvalDoc, setApprovalDoc] = useState<DocumentFile | null>(null);
  const [systemDiagram, setSystemDiagram] = useState<DocumentFile | null>(null);
  const [networkDiagram, setNetworkDiagram] = useState<DocumentFile | null>(null);
  const [useCaseDiagram, setUseCaseDiagram] = useState<DocumentFile | null>(null);
  const [securityDiagram, setSecurityDiagram] = useState<DocumentFile | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<DocumentFile[]>([]);

  const resolvedAttachments = useMemo(
    () =>
      initialAttachments.map((attachment) => ({
        attachment,
        typeName: resolveAttachmentTypeName(attachment, attachmentTypes),
      })),
    [attachmentTypes, initialAttachments],
  );

  const latestByType = useMemo(() => {
    const latest = new Map<string, ProjectAttachment>();
    for (const { attachment, typeName } of [...resolvedAttachments].sort((left, right) =>
      compareAttachments(left.attachment, right.attachment),
    )) {
      if (!typeName) continue;
      const current = latest.get(typeName);
      if (!current) {
        latest.set(typeName, attachment);
      }
    }
    return latest;
  }, [resolvedAttachments]);

  const approvalDocuments = useMemo(
    () =>
      resolvedAttachments
        .filter(({ typeName }) => typeName === "approval_document")
        .map(({ attachment }) => attachment)
        .sort(compareAttachments)
        .map(mapAttachment),
    [resolvedAttachments],
  );

  // The local values mirror the server response and are also updated immediately
  // by upload controls before the invalidated project query resolves.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const get = (docTypeName: string) => {
      const attachment = latestByType.get(docTypeName);
      return attachment ? mapAttachment(attachment) : null;
    };
    setPresentation(get("presentation"));
    setQuotation(get("quotation"));
    setOnePage(get("one_page_summary"));
    setBmaDcUsage(get("bma_dc_usage"));
    setApprovalDoc(get("approval_document"));
    setSystemDiagram(get("system_diagram"));
    setNetworkDiagram(get("network_diagram"));
    setUseCaseDiagram(get("use_case_diagram"));
    setSecurityDiagram(get("security_diagram"));
    setAdditionalDocs(
      resolvedAttachments
        .filter(({ typeName }) => typeName === "other")
        .map(({ attachment }) => attachment)
        .map(mapAttachment),
    );
  }, [latestByType, resolvedAttachments]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const mandatoryUploadedCount = [presentation, quotation, onePage, approvalDoc].filter(Boolean).length;
  const diagramsUploadedCount = [systemDiagram, networkDiagram, useCaseDiagram, securityDiagram].filter(Boolean).length;
  const removeFile = (setter: Dispatch<SetStateAction<DocumentFile | null>>) => setter(null);
  const removeAdditionalDoc = (id: string) => setAdditionalDocs((prev) => prev.filter((file) => file.id !== id));
  const addAdditionalDocument = (file: DocumentFile) => setAdditionalDocs((prev) => [...prev, file]);

  return {
    presentation, quotation, onePage, bmaDcUsage, approvalDoc, systemDiagram, networkDiagram, useCaseDiagram, securityDiagram,
    additionalDocs, mandatoryUploadedCount, diagramsUploadedCount, setPresentation, setQuotation, setOnePage,
    setBmaDcUsage,
    setApprovalDoc, setSystemDiagram, setNetworkDiagram, setUseCaseDiagram, setSecurityDiagram, removeFile,
    removeAdditionalDoc, addAdditionalDocument,
    unclassifiedDocs: resolvedAttachments
      .filter(({ typeName }) => typeName === null)
      .map(({ attachment }) => mapAttachment(attachment)),
    approvalDocuments,
    latestApprovalDocument: approvalDoc ?? approvalDocuments[0] ?? null,
    approvalDocumentHistory: approvalDocuments.slice(1),
  };
}
