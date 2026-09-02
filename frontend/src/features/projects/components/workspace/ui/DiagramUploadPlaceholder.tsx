import type { DocumentFile } from "../../../types/workspace";
import type { ProjectAttachmentTypeName } from "../../../types/project-attachment-type";
import { FileUploadField } from "./FileUploadField";

interface DiagramUploadPlaceholderProps {
  projectId: string;
  title: string;
  docTypeName: ProjectAttachmentTypeName;
  onChange: (file: DocumentFile | null) => void;
}

export function DiagramUploadPlaceholder({ projectId, title, docTypeName, onChange }: DiagramUploadPlaceholderProps) {
  return (
    <FileUploadField
      projectId={projectId}
      docTypeName={docTypeName}
      title={title}
      accept=".png,.jpg,.jpeg,.webp"
      value={null}
      onChange={(next) => onChange(next as DocumentFile | null)}
    />
  );
}
