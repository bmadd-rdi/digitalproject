"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ProposalDraftValues } from "../types";
import { generateProposalDocx } from "@/features/proposals/utils/documentGenerator";

interface ProposalExportButtonProps {
  proposal: ProposalDraftValues;
  label?: string;
  className?: string;
}

export function ProposalExportButton({
  proposal,
  label = "ดาวน์โหลดแบบเสนอโครงการ (Word)",
  className,
}: ProposalExportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await generateProposalDocx(proposal);
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
