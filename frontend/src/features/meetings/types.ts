export enum MeetingStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum AgendaType {
  FOR_INFORMATION = 1,
  APPROVE_MINUTES = 2,
  FOLLOW_UP = 3,
  FOR_CONSIDERATION = 4,
  OTHER = 5,
}

export enum ResolutionStatus {
  APPROVED = "APPROVED",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  CONDITIONAL_APPROVAL = "CONDITIONAL_APPROVAL",
  RECONSIDER = "RECONSIDER",
  NOT_APPROVED = "NOT_APPROVED",
  NOT_CONSIDERED = "NOT_CONSIDERED",
}

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  DRAFT: "ฉบับร่าง",
  SCHEDULED: "กำหนดประชุมแล้ว",
  IN_PROGRESS: "กำลังประชุม",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export const MEETING_STATUS_COLORS: Record<MeetingStatus, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
  SCHEDULED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  IN_PROGRESS: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

export const AGENDA_TYPE_LABELS: Record<AgendaType, string> = {
  1: "วาระแจ้งเพื่อทราบ",
  2: "วาระรับรองรายงานการประชุม",
  3: "วาระสืบเนื่อง",
  4: "วาระเพื่อพิจารณา",
  5: "วาระอื่น ๆ",
};

export const AGENDA_TYPE_ORDER = Object.values(AgendaType).filter(
  (value): value is AgendaType => typeof value === "number",
);

export const RESOLUTION_STATUS_LABELS: Record<ResolutionStatus, string> = {
  APPROVED: "เห็นชอบ",
  ACKNOWLEDGED: "รับทราบ",
  CONDITIONAL_APPROVAL: "เห็นชอบแบบมีเงื่อนไข",
  RECONSIDER: "ให้นำกลับมาพิจารณาใหม่",
  NOT_APPROVED: "ไม่เห็นชอบ",
  NOT_CONSIDERED: "ไม่รับพิจารณา",
};

export const RESOLUTION_STATUS_COLORS: Record<ResolutionStatus, { bg: string; text: string; border: string }> = {
  APPROVED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  ACKNOWLEDGED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  CONDITIONAL_APPROVAL: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  RECONSIDER: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  NOT_APPROVED: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  NOT_CONSIDERED: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};

export interface Project {
  project_id: string;
  project_code: string;
  name: string;
  agency: string;
  budget: number;
  description: string;
  objective: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface Resolution {
  resolution_id: string;
  agenda_id: string;
  resolution_status: ResolutionStatus | null;
  comment: string;
  version?: number;
}

export interface Agenda {
  agenda_id: string;
  meeting_id: string;
  project_id: string | null;
  agenda_number: string | number;
  sort_order?: number;
  agenda_type: AgendaType;
  title: string;
  description: string;
  project?: Project | null;
  resolution?: Resolution | null;
}

export interface Meeting {
  meeting_id: string;
  meeting_no: string;
  title: string;
  meeting_date: string;
  location: string;
  chairman: string;
  meeting_status: MeetingStatus;
  meeting_status_id?: number;
  meeting_type_id?: number;
  meeting_type?: "SMALL_BOARD" | "BIG_BOARD";
  unresolved_resolution_count?: number;
  created_by?: string;
  updated_at?: string;
  agendas?: Agenda[];
}

export interface GroupedAgendas {
  type: AgendaType;
  label: string;
  agendas: Agenda[];
}
