import { Edit3, ShieldAlert, User, Users } from "lucide-react";
import { TabType } from "../hooks/useProjects";

interface ProjectTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  draftsCount: number;
  activeCount: number;
  showDrafts?: boolean;
  showAll?: boolean;
}

const tabClassName = (isActive: boolean, activeClassName: string) =>
  `flex items-center gap-1.5 whitespace-nowrap border-b-[3px] px-3 py-3.5 text-[13px] font-bold transition-all sm:gap-2.5 sm:px-4 sm:py-5 sm:text-sm ${
    isActive
      ? activeClassName
      : "border-transparent text-[#3f4942] hover:text-[#191c20]"
  }`;

export function ProjectTabs({
  activeTab,
  onTabChange,
  draftsCount,
  activeCount,
  showDrafts = true,
  showAll = true,
}: ProjectTabsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-[#ededf4] bg-[#f9f9ff] px-4 no-scrollbar sm:gap-2 sm:px-6 lg:px-10">
      {showDrafts ? (
        <button
          type="button"
          onClick={() => onTabChange("drafts")}
          className={tabClassName(
            activeTab === "drafts",
            "border-status-orange text-status-orange",
          )}
        >
          <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          แบบร่างค้างทำ
          {draftsCount > 0 ? (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[9px] font-black sm:px-2 sm:text-[10px] ${
                activeTab === "drafts"
                  ? "bg-status-orange text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {draftsCount}
            </span>
          ) : null}
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => onTabChange("active")}
        className={tabClassName(
          activeTab === "active",
          "border-[#00734b] text-[#00734b]",
        )}
      >
        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ส่งแล้ว (ของฉัน)
        {activeCount > 0 ? (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-black sm:px-2 sm:text-[10px] ${
              activeTab === "active"
                ? "bg-[#00734b] text-white"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {activeCount}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        onClick={() => onTabChange("team")}
        className={tabClassName(
          activeTab === "team",
          "border-[#00734b] text-[#00734b]",
        )}
      >
        <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        ส่งแล้ว (ส่วนราชการ)
      </button>

      {showAll ? (
        <button
          type="button"
          onClick={() => onTabChange("all")}
          className={tabClassName(
            activeTab === "all",
            "border-purple-600 text-purple-600",
          )}
        >
          <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          โครงการทั้งหมด
        </button>
      ) : null}
    </div>
  );
}

