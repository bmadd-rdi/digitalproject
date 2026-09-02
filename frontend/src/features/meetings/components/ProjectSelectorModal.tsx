"use client";
// src/features/meetings/components/ProjectSelectorModal.tsx
// Modal สำหรับเลือกโครงการ — Searchable project list in a Dialog

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  FolderOpen,
  Building2,
  Banknote,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Project } from "../types";

interface ProjectSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (projectId: string) => void;
  availableProjects: Project[];
}

export function ProjectSelectorModal({
  open,
  onClose,
  onSelect,
  availableProjects,
}: ProjectSelectorModalProps) {
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return availableProjects;
    const q = search.trim().toLowerCase();
    return availableProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.project_code.toLowerCase().includes(q) ||
        p.agency.toLowerCase().includes(q)
    );
  }, [availableProjects, search]);

  const formatBudget = useCallback((amount: number) => {
    return new Intl.NumberFormat("th-TH").format(amount);
  }, []);

  const handleSelect = useCallback(
    (projectId: string) => {
      onSelect(projectId);
      setSearch("");
      onClose();
    },
    [onSelect, onClose]
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        setSearch("");
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5 text-[#00734b]" />
            เลือกโครงการเพื่อเชื่อมโยง
          </DialogTitle>
          <DialogDescription>
            ค้นหาและเลือกโครงการที่ต้องการเชื่อมโยงกับวาระการประชุมนี้
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="project-search"
            placeholder="ค้นหาโครงการ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 max-h-[400px] pr-1">
          {filteredProjects.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 text-slate-200" />
              <p className="font-medium text-slate-500">
                ไม่พบโครงการที่ตรงกัน
              </p>
              <p className="text-xs text-slate-400 mt-1">
                ลองเปลี่ยนคำค้นหาใหม่
              </p>
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.project_id}
                className="group flex items-start gap-4 p-4 rounded-md border border-[#ededf4] hover:border-[#00734b]/30 hover:bg-[#00734b]/5 transition-all cursor-pointer"
                onClick={() => handleSelect(project.project_id)}
              >
                {/* Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md">
                      {project.project_code}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-[#191c20] group-hover:text-[#00734b] transition-colors leading-snug">
                    {project.name}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {project.agency}
                    </span>
                    <span className="flex items-center gap-1">
                      <Banknote className="w-3 h-3" />
                      {formatBudget(project.budget)} บาท
                    </span>
                  </div>
                </div>

                {/* Select button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#00734b] hover:text-[#00734b] hover:bg-[#00734b]/10 rounded-lg"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  เลือก
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Footer count */}
        <p className="text-xs text-muted-foreground text-right pt-2 border-t">
          โครงการที่พร้อมเชื่อมโยง: {filteredProjects.length} รายการ
        </p>
      </DialogContent>
    </Dialog>
  );
}
