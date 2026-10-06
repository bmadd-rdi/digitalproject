import type { TabType } from "../hooks/useProjects";

// Fixed columns always shown: วันที่นำเข้า, หน่วยงาน, ชื่อโครงการ, งบประมาณ, ประเภทโครงการ
const FIXED_COLUMN_COUNT = 5;

export function getProjectTableColumnCount(options: {
  activeTab: TabType;
  hideAnalystColumn?: boolean;
  showActions?: boolean;
  showDraftProgress?: boolean;
}) {
  const hasStatusColumn = options.activeTab !== "drafts" || options.showDraftProgress !== false;
  // ปีเริ่มต้นงบประมาณ + ประเภทงบประมาณ — โชว์คู่กันเสมอ นอกเฉพาะ tab แบบร่าง
  const showBudgetYearAndType = options.activeTab !== "drafts";
  return (
    FIXED_COLUMN_COUNT
    + (options.hideAnalystColumn ? 0 : 1)
    + (hasStatusColumn ? 1 : 0)
    + (showBudgetYearAndType ? 2 : 0)
    + (options.showActions ? 1 : 0)
  );
  // return 6 + (options.hideAnalystColumn ? 0 : 1) + (hasStatusColumn ? 1 : 0) + (options.showActions ? 1 : 0);
  // return FIXED_COLUMN_COUNT + (options.hideAnalystColumn ? 0 : 1) + (hasStatusColumn ? 1 : 0) + (options.showActions ? 1 : 0);
}
