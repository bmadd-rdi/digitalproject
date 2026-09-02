import type { TabType } from "../hooks/useProjects";

export function getProjectTableColumnCount(options: {
  activeTab: TabType;
  hideAnalystColumn?: boolean;
  showActions?: boolean;
  showDraftProgress?: boolean;
}) {
  const hasStatusColumn = options.activeTab !== "drafts" || options.showDraftProgress !== false;
  return 6 + (options.hideAnalystColumn ? 0 : 1) + (hasStatusColumn ? 1 : 0) + (options.showActions ? 1 : 0);
}
