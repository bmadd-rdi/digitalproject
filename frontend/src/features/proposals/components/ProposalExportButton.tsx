"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ProposalDraftValues } from "../types";
import {
  generateProposalDocx,
  type ProposalDocumentOwner,
} from "@/features/proposals/utils/documentGenerator";

interface ProposalExportButtonProps {
  proposal: ProposalDraftValues;
  /** ข้อมูลผู้สร้างโครงการ (project.owner) ใช้เติม position + level ลงในเอกสาร .docx เท่านั้น */
  owner?: ProposalDocumentOwner | null;
  /**
   * ทำงานก่อนสร้างเอกสาร (เช่น บันทึกฉบับร่าง) คืนค่า false เพื่อยกเลิกการสร้างเอกสาร
   */
  beforeExport?: () => boolean | Promise<boolean>;
  label?: string;
  className?: string;
}

export function ProposalExportButton({
  proposal,
  owner,
  beforeExport,
  label = "ดาวน์โหลดแบบเสนอโครงการ (Word)",
  className,
}: ProposalExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      // บันทึกฉบับร่างก่อนเสมอ จึงค่อยสร้างเอกสาร Word
      if (beforeExport) {
        const saved = await beforeExport();
        if (!saved) {
          toast.error("ยังบันทึกฉบับร่างไม่สำเร็จ", {
            description: "กรุณาบันทึกฉบับร่างให้สำเร็จก่อน แล้วลองสร้างเอกสารอีกครั้ง",
          });
          return;
        }
        toast.success("บันทึกฉบับร่างแล้ว");
      }

      const result = await generateProposalDocx(proposal, { owner });
      if (!result.success) {
        toast.error("สร้างเอกสารไม่สำเร็จ", {
          description: result.error ?? "กรุณาลองใหม่อีกครั้ง",
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
