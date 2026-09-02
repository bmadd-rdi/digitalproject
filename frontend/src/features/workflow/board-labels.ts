export const BOARD_LABELS = {
  SMALL_BOARD: "คณะกรรมการกลั่นกรอง",
  BIG_BOARD: "คณะกรรมการนโยบาย",
} as const;

export type BoardCode = keyof typeof BOARD_LABELS;

export function getBoardLabel(code: string | null | undefined) {
  return code && code in BOARD_LABELS
    ? BOARD_LABELS[code as BoardCode]
    : code ?? "-";
}
