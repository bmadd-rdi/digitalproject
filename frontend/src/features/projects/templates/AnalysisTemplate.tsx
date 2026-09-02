// src/features/projects/templates/AnalysisTemplate.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ClipboardList, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Mock Data ---
// เปลี่ยน lastAction เป็น lastUpdated
const MOCK_ASSIGNED_PROJECTS = [
  { id: "p1", code: "BMA-67-0045", name: "ระบบจัดการคิวออนไลน์สำหรับโรงพยาบาล", agency: "สำนักการแพทย์", type: "Software", assignedDate: "14 ก.ค. 2567", status: "In Analysis", lastUpdated: "14 ก.ค. 2567 15:30 น." },
  { id: "p2", code: "BMA-67-0046", name: "จัดซื้อกล้อง CCTV พร้อบระบบ AI", agency: "สำนักจราจรฯ", type: "Hardware", assignedDate: "15 ก.ค. 2567", status: "In Analysis", lastUpdated: "15 ก.ค. 2567 09:15 น." },
  { id: "p3", code: "BMA-67-0030", name: "พัฒนาระบบจัดเก็บภาษีป้าย", agency: "สำนักการคลัง", type: "Software", assignedDate: "01 ก.ค. 2567", status: "Need Revision", lastUpdated: "05 ก.ค. 2567 11:45 น." },
  { id: "p4", code: "BMA-67-0022", name: "เช่าใช้บริการ Cloud Server", agency: "สำนักยุทธศาสตร์ฯ", type: "Network", assignedDate: "20 มิ.ย. 2567", status: "Ready for Agenda", lastUpdated: "25 มิ.ย. 2567 16:20 น." },
];

type TabType = "todo" | "waiting" | "done";

export function AnalysisTemplate() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("todo");
  const [searchQuery, setSearchQuery] = useState("");

  // --- Filter Logic ---
  const filteredProjects = MOCK_ASSIGNED_PROJECTS.filter(project => {
    // 1. กรองตาม Tab
    if (activeTab === "todo" && project.status !== "In Analysis") return false;
    if (activeTab === "waiting" && project.status !== "Need Revision") return false;
    if (activeTab === "done" && project.status !== "Ready for Agenda") return false;

    // 2. กรองตาม Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return project.name.toLowerCase().includes(query) || project.code.toLowerCase().includes(query);
    }
    return true;
  });

  // --- Stats ---
  const todoCount = MOCK_ASSIGNED_PROJECTS.filter(p => p.status === "In Analysis").length;
  const waitingCount = MOCK_ASSIGNED_PROJECTS.filter(p => p.status === "Need Revision").length;
  const doneCount = MOCK_ASSIGNED_PROJECTS.filter(p => p.status === "Ready for Agenda").length;

  return (
    <div className="flex flex-col h-full p-6 lg:p-8 animate-in fade-in duration-500 mx-auto w-full">

      {/* --- Header --- */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-[#191c20] tracking-tight">งานวิเคราะห์โครงการ</h1>
        <p className="text-sm text-[#3f4942] mt-1">ตรวจสอบความถูกต้องและพิจารณาความเหมาะสมของโครงการที่ได้รับมอบหมาย</p>
      </div>

      {/* --- Summary Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-md border border-blue-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">ต้องวิเคราะห์ (To Do)</p>
            <p className="text-2xl font-bold text-blue-600">{todoCount} <span className="text-sm font-normal text-slate-400">โครงการ</span></p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-500"><ClipboardList className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-5 rounded-md border border-orange-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">รอหน่วยงานแก้ไข</p>
            <p className="text-2xl font-bold text-orange-600">{waitingCount} <span className="text-sm font-normal text-slate-400">โครงการ</span></p>
          </div>
          <div className="p-3 bg-orange-50 rounded-full text-orange-500"><Clock className="w-5 h-5" /></div>
        </div>
        <div className="bg-white p-5 rounded-md border border-[#ededf4] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">พร้อมเข้าวาระ (Ready)</p>
            <p className="text-2xl font-bold text-[#00734b]">{doneCount} <span className="text-sm font-normal text-slate-400">โครงการ</span></p>
          </div>
          <div className="p-3 bg-[#00734b]/10 rounded-full text-[#00734b]"><CheckCircle2 className="w-5 h-5" /></div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="bg-white rounded-md border border-[#D1CDC7] shadow-sm flex-1 flex flex-col overflow-hidden">

        {/* Custom Tabs */}
        <div className="flex border-b border-[#ededf4] px-4 pt-2 bg-slate-50/50">
          {[
            { id: "todo", label: `ต้องวิเคราะห์ (${todoCount})`, color: "text-blue-600 border-blue-600" },
            { id: "waiting", label: `รอแก้ไข (${waitingCount})`, color: "text-orange-600 border-orange-600" },
            { id: "done", label: `เสร็จสิ้น (${doneCount})`, color: "text-[#00734b] border-[#00734b]" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
                activeTab === tab.id
                  ? tab.color
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-[#ededf4] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ, รหัส..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 h-10 text-sm border border-[#D1CDC7] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-[#00734b]/20 focus:border-[#00734b] transition-all"
            />
          </div>
          <Button variant="outline" className="rounded-full h-10 px-6 border-[#D1CDC7] text-[#191c20]">
            <Filter className="w-4 h-4 mr-2" /> ตัวกรอง
          </Button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filteredProjects.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium">
              ไม่มีข้อมูลโครงการในหมวดหมู่นี้
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white sticky top-0 text-slate-500 font-bold z-10 border-b border-[#ededf4] text-[12px] uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-4">รหัสโครงการ</th>
                  <th className="px-6 py-4 w-full">ชื่อโครงการ & หน่วยงาน</th>
                  <th className="px-6 py-4">ประเภท</th>
                  <th className="px-6 py-4">วันที่มอบหมาย</th>
                  {/* เปลี่ยนหัวคอลัมน์ */}
                  <th className="px-6 py-4">อัปเดตล่าสุด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ededf4]">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="hover:bg-surface-variant/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{project.code}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#191c20] truncate max-w-[300px] lg:max-w-md group-hover:text-[#00734b] transition-colors">
                        {project.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{project.agency}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        {project.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {project.assignedDate}
                      {activeTab === "todo" && <span className="ml-2 text-orange-500 font-bold animate-pulse">ใหม่</span>}
                    </td>
                    {/* เปลี่ยนข้อมูลที่นำมาแสดง */}
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{project.lastUpdated}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
