import { BOARD_LABELS } from "@/features/workflow/board-labels";

export const PROJECT_STATUS = {
  DRAFT: 1,
  PENDING_SECRETARY: 2,
  RETURNED_SECRETARY: 3,
  REJECTED_SECRETARY: 4,
  PENDING_ASSIGNMENT: 5,
  IN_ANALYSIS: 6,
  RETURNED_ANALYST: 7,
  REJECTED_ANALYST: 8,
  PENDING_SMALL_BOARD: 9,
  RETURNED_SMALL_BOARD: 10,
  REJECTED_SMALL_BOARD: 11,
  PENDING_BIG_BOARD: 12,
  RETURNED_BIG_BOARD: 13,
  REJECTED_BIG_BOARD: 14,
  APPROVED: 15,
} as const;

export const OWNER_EDITABLE_PROJECT_STATUSES = [1, 3, 7, 10, 13] as const;
export const OWNER_LOCKED_PROJECT_STATUSES = [2, 5, 6, 9, 12, 15] as const;

const STATUS_META: Record<number, { label: string; className: string }> = {
  1: { label: "แบบร่าง", className: "bg-gray-100 text-gray-700 border-gray-200" },
  2: { label: "รอตรวจสอบโดยเลขานุการ", className: "bg-blue-50 text-blue-700 border-blue-200" },
  3: { label: "ส่งกลับเพื่อแก้ไขโดยเลขานุการ", className: "bg-orange-50 text-orange-700 border-orange-200" },
  4: { label: "ไม่อนุมัติโดยเลขานุการ", className: "bg-red-50 text-red-700 border-red-200" },
  5: { label: "รอมอบหมายผู้วิเคราะห์", className: "bg-blue-50 text-blue-700 border-blue-200" },
  6: { label: "อยู่ระหว่างการวิเคราะห์", className: "bg-blue-50 text-blue-700 border-blue-200" },
  7: { label: "ส่งกลับเพื่อแก้ไขโดยผู้วิเคราะห์", className: "bg-orange-50 text-orange-700 border-orange-200" },
  8: { label: "ไม่อนุมัติโดยผู้วิเคราะห์", className: "bg-red-50 text-red-700 border-red-200" },
  9: { label: "รอพิจารณาโดยคณะกรรมการกลั่นกรอง", className: "bg-blue-50 text-blue-700 border-blue-200" },
  10: { label: "ส่งกลับเพื่อแก้ไขโดยคณะกรรมการกลั่นกรอง", className: "bg-orange-50 text-orange-700 border-orange-200" },
  11: { label: "ไม่อนุมัติโดยคณะกรรมการกลั่นกรอง", className: "bg-red-50 text-red-700 border-red-200" },
  12: { label: "รอพิจารณาโดยคณะกรรมการนโยบาย", className: "bg-blue-50 text-blue-700 border-blue-200" },
  13: { label: "ส่งกลับเพื่อแก้ไขโดยคณะกรรมการนโยบาย", className: "bg-orange-50 text-orange-700 border-orange-200" },
  14: { label: "ไม่อนุมัติโดยคณะกรรมการนโยบาย", className: "bg-red-50 text-red-700 border-red-200" },
  15: { label: "อนุมัติแล้ว", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

STATUS_META[9].label = `รอพิจารณาโดย${BOARD_LABELS.SMALL_BOARD}`;
STATUS_META[10].label = `ส่งกลับเพื่อแก้ไขโดย${BOARD_LABELS.SMALL_BOARD}`;
STATUS_META[11].label = `ไม่อนุมัติโดย${BOARD_LABELS.SMALL_BOARD}`;
STATUS_META[12].label = `รอพิจารณาโดย${BOARD_LABELS.BIG_BOARD}`;
STATUS_META[13].label = `ส่งกลับเพื่อแก้ไขโดย${BOARD_LABELS.BIG_BOARD}`;
STATUS_META[14].label = `ไม่อนุมัติโดย${BOARD_LABELS.BIG_BOARD}`;

const THAI_STATUS_LABELS: Record<number, string> = Object.fromEntries(
  Object.entries(STATUS_META).map(([id, meta]) => [Number(id), meta.label]),
);

export function getThaiProjectStatus(statusId?: number | null) {
  return THAI_STATUS_LABELS[statusId ?? -1] ?? "ไม่ทราบสถานะ";
}

export const PROJECT_STATUS_FILTER_OPTIONS = Object.keys(THAI_STATUS_LABELS)
  .map(Number)
  .sort((a, b) => a - b)
  .map((id) => ({ id, label: THAI_STATUS_LABELS[id] }));

export function getProjectStatusMeta(statusId?: number | null, fallbackName?: string | null) {
  return STATUS_META[statusId ?? -1] ?? {
    label: fallbackName || "ไม่ทราบสถานะ",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  };
}
