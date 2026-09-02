import type { DocumentFile } from "../../../types/workspace";
import type { ProjectAttachmentTypeName } from "../../../types/project-attachment-type";
import { FileUploadField } from "./FileUploadField";

interface DiagramPreviewCardProps {
  projectId: string;
  title: string;
  docTypeName: ProjectAttachmentTypeName;
  file: DocumentFile;
  onChange: (file: DocumentFile | null) => void;
}

export function DiagramPreviewCard({ projectId, title, docTypeName, file, onChange }: DiagramPreviewCardProps) {
  return (
    <FileUploadField
      projectId={projectId}
      docTypeName={docTypeName}
      title={title}
      accept=".png,.jpg,.jpeg,.webp"
      value={file}
      onChange={(next) => onChange(next as DocumentFile | null)}
    />
  );
}
