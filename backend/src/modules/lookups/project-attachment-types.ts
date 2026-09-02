export const PROJECT_ATTACHMENT_TYPES = [
  { id: 1, code: "SYSTEM_DIAGRAM", docTypeName: "system_diagram" },
  { id: 2, code: "NETWORK_DIAGRAM", docTypeName: "network_diagram" },
  { id: 3, code: "USE_CASE_DIAGRAM", docTypeName: "use_case_diagram" },
  { id: 4, code: "SECURITY_DIAGRAM", docTypeName: "security_diagram" },
  { id: 5, code: "PRESENTATION", docTypeName: "presentation" },
  { id: 6, code: "REPORT", docTypeName: "report" },
  { id: 7, code: "EXPENSE_DOCUMENT", docTypeName: "ใบเบิกเงิน" },
  { id: 8, code: "OTHER", docTypeName: "other" },
  { id: 9, code: "QUOTATION", docTypeName: "quotation" },
  { id: 10, code: "ONE_PAGE_SUMMARY", docTypeName: "one_page_summary" },
  { id: 11, code: "APPROVAL_DOCUMENT", docTypeName: "approval_document" },
  { id: 12, code: "BMA_DC_USAGE", docTypeName: "bma_dc_usage" },
] as const;

export const PROJECT_ATTACHMENT_TYPE_LABELS = {
  system_diagram: "System Diagram",
  network_diagram: "Network Diagram",
  use_case_diagram: "Use Case Diagram",
  security_diagram: "Security Diagram",
  presentation: "Presentation",
  report: "Report",
  quotation: "Quotation",
  one_page_summary: "One Page Summary",
  approval_document: "Approval Document",
  bma_dc_usage: "การใช้ BMA DC",
  other: "Other Documents",
  "ใบเบิกเงิน": "ใบเบิกเงิน",
} as const;

export type ProjectAttachmentTypeName = keyof typeof PROJECT_ATTACHMENT_TYPE_LABELS;

export function getProjectAttachmentTypeLabel(name: string) {
  return PROJECT_ATTACHMENT_TYPE_LABELS[name as ProjectAttachmentTypeName] ?? name;
}
