"use client";

import { useProposalFormStore } from "../stores/useProposalFormStore";
import { Loader2, CheckCircle2, WifiOff, Clock } from "lucide-react";

/**
 * SaveStatusIndicator
 * Reads saveStatus + lastSavedAt from Zustand and shows a subtle inline badge.
 */
export function SaveStatusIndicator() {
  const { saveStatus, lastSavedAt } = useProposalFormStore();

  if (saveStatus === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        กำลังบันทึก...
      </span>
    );
  }

  if (saveStatus === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-500">
        <WifiOff className="w-3.5 h-3.5" />
        ไม่สามารถบันทึกได้ กำลังลองใหม่...
      </span>
    );
  }

  if (saveStatus === "saved" && lastSavedAt) {
    const time = new Date(lastSavedAt).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
        <CheckCircle2 className="w-3.5 h-3.5" />
        บันทึกแล้วเมื่อ {time}
      </span>
    );
  }

  // idle or no last save
  if (lastSavedAt) {
    const time = new Date(lastSavedAt).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        บันทึกร่างล่าสุดเมื่อ {time}
      </span>
    );
  }

  return null;
}
