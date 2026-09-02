// src/features/workspaces/hooks/useProjectWorkspace.ts
import { useState } from "react";
import type { WorkspaceTab } from "../types/workspace";

export function useWorkspaceTabs(hasProposal: boolean) {
  const defaultTab: WorkspaceTab = hasProposal ? "tab-timeline" : "tab-proposal";
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(defaultTab);

  return { activeTab, setActiveTab, defaultTab };
}
