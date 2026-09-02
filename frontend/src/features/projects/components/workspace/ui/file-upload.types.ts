import type { ProjectAttachmentTypeName } from "../../../types/project-attachment-type";

export type SharedFileValue = {
  id: string;
  name: string;
  type?: string;
  mimeType?: string;
  size?: string;
  fileSize?: number | null;
  url?: string;
  file?: File | string;
  description?: string;
  canDelete?: boolean;
  uploader?: {
    userId: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type FileUploadFieldProps = {
  projectId: string;
  docTypeName: ProjectAttachmentTypeName;
  title: string;
  accept?: string;
  value?: SharedFileValue | string | null;
  onChange: (value: SharedFileValue | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  showDescription?: boolean;
  descriptionRequired?: boolean;
  descriptionError?: string;
  canManage?: boolean;
  allowNewVersion?: boolean;
  uploadButtonLabel?: string;
  className?: string;
};

export type UploadedProjectFile = {
  attachmentId?: string;
  docTypeId: number;
  docTypeName: string;
  url: string;
  fileSize?: number | null;
  canDelete?: boolean;
  uploader?: SharedFileValue["uploader"];
};
