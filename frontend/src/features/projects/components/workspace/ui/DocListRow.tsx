import type { DocumentFile } from "../../../types/workspace";
import type { ProjectAttachmentTypeName } from "../../../types/project-attachment-type";
import { FileUploadField, type SharedFileValue } from "./FileUploadField";

interface DocListRowProps {
  projectId: string;
  title: string;
  docTypeName?: ProjectAttachmentTypeName;
  accept?: string;
  file: DocumentFile | null;
  onChange: (file: DocumentFile | null) => void;
  isRequired?: boolean;
}

export function DocListRow({ projectId, title, docTypeName = "other", accept, file, onChange, isRequired = false }: DocListRowProps) {
  return (
    <FileUploadField
      projectId={projectId}
      docTypeName={docTypeName}
      title={`${title}${isRequired ? " *" : ""}`}
      accept={accept}
      value={file as SharedFileValue | null}
      onChange={(next) => onChange(next as DocumentFile | null)}
    />
  );
}
