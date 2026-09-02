import { z } from "zod";
import { schemas } from "@/types/api-schemas";

export const PROJECT_ATTACHMENT_TYPE_NAMES = {
  systemDiagram: "system_diagram",
  networkDiagram: "network_diagram",
  useCaseDiagram: "use_case_diagram",
  securityDiagram: "security_diagram",
  presentation: "presentation",
  report: "report",
  quotation: "quotation",
  onePageSummary: "one_page_summary",
  approvalDocument: "approval_document",
  bmaDcUsage: "bma_dc_usage",
  other: "other",
  expenseClaim: "ใบเบิกเงิน",
} as const;

export type ProjectAttachmentTypeName =
  (typeof PROJECT_ATTACHMENT_TYPE_NAMES)[keyof typeof PROJECT_ATTACHMENT_TYPE_NAMES];

export type ProjectAttachmentType = z.infer<
  typeof schemas.ProjectAttachmentTypeLookupItem
>;
export type ProjectAttachmentTypeResponse = z.infer<
  typeof schemas.ProjectAttachmentTypeLookupResponse
>;
