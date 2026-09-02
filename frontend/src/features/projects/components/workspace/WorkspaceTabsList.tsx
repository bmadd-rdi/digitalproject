import { ClipboardList, FolderOpen, History } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export function WorkspaceTabsList() {
  return (
    <TabsList className="bg-white border border-[#D1CDC7] h-auto w-full sm:w-auto self-start shadow-sm mb-5 p-1 rounded-full inline-flex">
      <TabsTrigger
        value="tab-proposal"
        id="tab-proposal"
        className="
          flex items-center gap-2 px-5 h-10 rounded-full font-bold text-sm text-slate-500
          transition-all duration-300 ease-out
          hover:text-[#00734b]
          data-[state=active]:bg-[#00734b] data-[state=active]:text-white 
          data-[state=active]:shadow-md data-[state=active]:scale-[1.05]
          group
        "
      >
        <ClipboardList className="w-4 h-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
        <span className="hidden sm:inline">เอกสารเสนอโครงการ</span>
        <span className="sm:hidden">Form</span>

      </TabsTrigger>

      <TabsTrigger
        value="tab-documents"
        id="tab-documents"
        className="
          flex items-center gap-2 px-5 h-10 rounded-full font-bold text-sm text-slate-500
          transition-all duration-300 ease-out
          hover:text-[#00734b]
          data-[state=active]:bg-[#00734b] data-[state=active]:text-white 
          data-[state=active]:shadow-md data-[state=active]:scale-[1.05]
          group
        "
      >
        <FolderOpen className="w-4 h-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
        ไฟล์แนบ
      </TabsTrigger>

      <TabsTrigger
        value="tab-timeline"
        id="tab-timeline"
        className="
          flex items-center gap-2 px-5 h-10 rounded-full font-bold text-sm text-slate-500
          transition-all duration-300 ease-out
          hover:text-[#00734b]
          data-[state=active]:bg-[#00734b] data-[state=active]:text-white 
          data-[state=active]:shadow-md data-[state=active]:scale-[1.05]
          group
        "
      >
        <History className="w-4 h-4 transition-transform duration-300 group-data-[state=active]:scale-110" />
        ประวัติและมติ
      </TabsTrigger>
    </TabsList>
  );
}
