// src/features/projects/hooks/useWorkspaceTabs.ts
import { useEffect, useState } from "react";
import type { WorkspaceTab } from "../types/workspace";

// ชื่อ event สำหรับสั่งสลับแท็บจากคอมโพเนนต์อื่น (เช่น ปุ่มส่งโครงการใน ProjectHeader)
export const WORKSPACE_GOTO_TAB_EVENT = "workspace:goto-tab";

export function useWorkspaceTabs(hasProposal: boolean) {
  const defaultTab: WorkspaceTab = hasProposal ? "tab-timeline" : "tab-proposal";
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(defaultTab);

  useEffect(() => {
    const handler = (event: Event) => {
      const tab = (event as CustomEvent<{ tab?: WorkspaceTab }>).detail?.tab;
      if (tab) setActiveTab(tab);
    };
    window.addEventListener(WORKSPACE_GOTO_TAB_EVENT, handler);
    return () => window.removeEventListener(WORKSPACE_GOTO_TAB_EVENT, handler);
  }, []);

  return { activeTab, setActiveTab, defaultTab };
}
