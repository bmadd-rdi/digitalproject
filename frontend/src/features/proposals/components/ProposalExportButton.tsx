"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ProposalDraftValues } from "../types";
import { useDepartments, useDivisions } from "@/features/lookups/hooks/useLookups";
import { generateProposalDocx } from "@/features/proposals/utils/documentGenerator";

interface ProposalExportButtonProps {
  proposal: ProposalDraftValues;
  /** ใช้เมื่อ proposal.agencyName ว่าง (แบบร่างที่ยังไม่ส่ง agencyName จะถูกสร้างตอนส่งโครงการ) */
  agencyNameFallback?: string;
  label?: string;
  className?: string;
}

export function ProposalExportButton({
  proposal,
  agencyNameFallback,
  label = "ดาวน์โหลดแบบเสนอโครงการ (Word)",
  className,
}: ProposalExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // department_id / division_id เก็บเป็นตัวเลข จึงต้องแปลงเป็นชื่อก่อนใส่ใน Word
  const departmentId = Number(proposal.departmentId) || undefined;
  const divisionId = Number(proposal.divisionId) || undefined;
  const { data: deptsRes } = useDepartments();
  const { data: divsRes } = useDivisions(departmentId);
  const departmentName = deptsRes?.data?.find((d) => d.id === departmentId)?.name;
  const divisionName = divsRes?.data?.find((d) => d.id === divisionId)?.name;

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateProposalDocx(proposal, { agencyNameFallback, departmentName, divisionName });
      if (!result.success) {
        toast.error("สร้างเอกสารไม่สำเร็จ", {
          description: result.error ?? "กรุณาลองใหม่อีกครั้ง",
        });
      } else if (result.failedImages.length > 0) {
        toast.warning("สร้างเอกสารแล้ว แต่บางรูปไม่สามารถนำมาใส่ได้", {
          description: result.failedImages.join(", "),
        });
      }
    } catch (error) {
      toast.error("สร้างเอกสารไม่สำเร็จ", {
        description: error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void handleGenerate()}
      disabled={isGenerating}
      className={className}
    >
      {isGenerating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isGenerating ? "กำลังสร้างเอกสาร..." : label}
    </Button>
  );
}
