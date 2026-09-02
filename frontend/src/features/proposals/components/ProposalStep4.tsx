// src/features/projects/components/ProjectStep4.tsx
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { ProposalStep4Values } from "../types";
import { AlertCircle, Calculator } from "lucide-react";

// นำเข้า Accordion จาก shadcn
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// นำเข้า Components ย่อยของคุณ
import { HardwareCostSection } from "./step4/HardwareCostSection";
import { SoftwareCostSection } from "./step4/SoftwareCostSection";
import { PersonnelCostSection } from "./step4/PersonnelCostSection";
import { TrainingCostSection } from "./step4/TrainingCostSection";
import { OtherCostSection } from "./step4/OtherCostSection";

export const ProposalStep4 = () => {
  const { control, formState: { errors } } = useFormContext<ProposalStep4Values>();

  // 1. Watch ข้อมูลจากทุก Section เพื่อเอามาคำนวณ Grand Total
  const watchedHw = useWatch({ control, name: "hardwareCosts" }) || [];
  const watchedSw = useWatch({ control, name: "softwareCosts" }) || [];
  const watchedCore = useWatch({ control, name: "personnelCoreCosts" }) || [];
  const watchedAsst = useWatch({ control, name: "personnelAsstCosts" }) || [];
  const watchedSupp = useWatch({ control, name: "personnelSuppCosts" }) || [];
  const watchedCourses = useWatch({ control, name: "trainingCourses" }) || [];
  const watchedOther = useWatch({ control, name: "otherCosts" }) || [];

  // 2. คำนวณผลรวมแต่ละหมวด
  const totalHwCost = watchedHw.reduce((acc, row) => acc + ((row.quantity || 0) * (row.unitPrice || 0)), 0);
  const totalSwCost = watchedSw.reduce((acc, row) => acc + ((row.quantity || 0) * (row.unitPrice || 0)), 0);
  
  // รวมบุคลากรทั้ง 3 ประเภท
  const totalCore = watchedCore.reduce((acc, row) => acc + (((row.baseSalary || 0) * (row.multiplier || 1)) * (row.personCount || 0) * (row.durationMonths || 0)), 0);
  const totalAsst = watchedAsst.reduce((acc, row) => acc + (((row.baseSalary || 0) * (row.multiplier || 1)) * (row.personCount || 0) * (row.durationMonths || 0)), 0);
  const totalSupp = watchedSupp.reduce((acc, row) => acc + ((row.baseSalary || 0) * (row.personCount || 0) * (row.durationMonths || 0)), 0);
  const totalPersonnelCost = totalCore + totalAsst + totalSupp;

  const totalTrainingCost = watchedCourses.reduce((acc, course) => {
    const spkCost = (course.speakerCosts || []).reduce((sum, r) => sum + ((r.hours || 0) * (r.ratePerHour || 0) * (r.days || 0)), 0);
    const foodCost = (course.foodCosts || []).reduce((sum, r) => sum + ((r.mealsCount || 0) * (r.ratePerMeal || 0) * (r.traineesCount || 0) * (r.days || 0)), 0);
    return acc + spkCost + foodCost;
  }, 0);

  // คำนวณหมวดที่ 5 (แยก IT / Non-IT)
  const totalOtherIT = watchedOther
    .filter(row => row.costType === "IT")
    .reduce((acc, row) => acc + ((row.quantity || 0) * (row.unitPrice || 0)), 0);
    
  const totalOtherNonIT = watchedOther
    .filter(row => row.costType === "NON_IT")
    .reduce((acc, row) => acc + ((row.quantity || 0) * (row.unitPrice || 0)), 0);
    
  const totalOtherCost = totalOtherIT + totalOtherNonIT;

  // 3. คำนวณ Grand Total (ยอดรวมทั้งโครงการ)
  const grandTotal = totalHwCost + totalSwCost + totalPersonnelCost + totalTrainingCost + totalOtherCost;
  
  // คำนวณยอดรวมเฉพาะส่วน IT (หัก Non-IT ออก)
  const grandTotalITOnly = grandTotal - totalOtherNonIT;

  // ฟังก์ชันช่วยเช็คว่า Section นี้มี Error ไหม
  const hasHardwareError = !!errors.hardwareCosts;
  const hasSoftwareError = !!errors.softwareCosts;
  const hasPersonnelError = !!errors.personnelCoreCosts || !!errors.personnelAsstCosts || !!errors.personnelSuppCosts || !!errors.personnelResponsibilities;
  const hasTrainingError = !!errors.trainingCourses;
  const hasOtherError = !!errors.otherCosts;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0 pb-10">
      <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">4. รายการค่าใช้จ่ายตามโครงการ</h2>
      
      <Accordion type="multiple" defaultValue={["item-1", "item-2", "item-3", "item-4", "item-5"]} className="w-full space-y-4">
        
        {/* --- หมวดที่ 1: ครุภัณฑ์ --- */}
        <AccordionItem value="item-1" className="border border-border rounded-lg bg-white px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">1. ค่าใช้จ่ายครุภัณฑ์คอมพิวเตอร์</span>
              {hasHardwareError && <AlertCircle className="w-5 h-5 text-status-orange" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 w-full min-w-0 h-auto">
            <HardwareCostSection />
          </AccordionContent>
        </AccordionItem>

        {/* --- หมวดที่ 2: ซอฟต์แวร์ --- */}
        <AccordionItem value="item-2" className="border border-border rounded-lg bg-white px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">2. ค่าใช้จ่ายซอฟต์แวร์และเครื่องมือ</span>
              {hasSoftwareError && <AlertCircle className="w-5 h-5 text-status-orange" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 w-full min-w-0 h-auto">
            <SoftwareCostSection />
          </AccordionContent>
        </AccordionItem>

        {/* --- หมวดที่ 3: บุคลากร --- */}
        <AccordionItem value="item-3" className="border border-border rounded-lg bg-white px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">3. ค่าใช้จ่ายบุคลากรที่ใช้ในการพัฒนาระบบ</span>
              {hasPersonnelError && <AlertCircle className="w-5 h-5 text-status-orange" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 w-full min-w-0 h-auto">
            <PersonnelCostSection />
          </AccordionContent>
        </AccordionItem>

        {/* --- หมวดที่ 4: การฝึกอบรม --- */}
        <AccordionItem value="item-4" className="border border-border rounded-lg bg-white px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">4. ค่าใช้จ่ายการฝึกอบรม</span>
              {hasTrainingError && <AlertCircle className="w-5 h-5 text-status-orange" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 w-full min-w-0 h-auto">
            <TrainingCostSection />
          </AccordionContent>
        </AccordionItem>

        {/* --- หมวดที่ 5: ค่าใช้จ่ายอื่นๆ --- */}
        <AccordionItem value="item-5" className="border border-border rounded-lg bg-white px-4">
          <AccordionTrigger className="hover:no-underline py-4 text-left">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">5. ค่าใช้จ่ายอื่น ๆ</span>
              {hasOtherError && <AlertCircle className="w-5 h-5 text-status-orange shrink-0" />}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6 w-full min-w-0 h-auto">
            <OtherCostSection />
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* --- ตารางสรุปงบประมาณ (Cost Summary Table) --- */}
      <div className="mt-8 border border-border rounded-xl bg-slate-50 overflow-hidden shadow-sm">
        <div className="bg-slate-100/80 px-6 py-4 border-b border-border flex items-center gap-2">
          <Calculator className="w-5 h-5 text-slate-500" />
          <h3 className="font-bold text-slate-700 text-lg">สรุปงบประมาณโครงการ</h3>
        </div>
        
        <div className="p-6">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-200/60">
              <tr className="hover:bg-white/50 transition-colors">
                <td className="py-3 text-slate-600 font-medium w-3/4">1. ค่าใช้จ่ายครุภัณฑ์คอมพิวเตอร์</td>
                <td className="py-3 text-right font-mono text-slate-800">{totalHwCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-white/50 transition-colors">
                <td className="py-3 text-slate-600 font-medium">2. ค่าใช้จ่ายซอฟต์แวร์และเครื่องมือ</td>
                <td className="py-3 text-right font-mono text-slate-800">{totalSwCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-white/50 transition-colors">
                <td className="py-3 text-slate-600 font-medium">3. ค่าใช้จ่ายบุคลากรที่ใช้ในการพัฒนาระบบ</td>
                <td className="py-3 text-right font-mono text-slate-800">{totalPersonnelCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="hover:bg-white/50 transition-colors">
                <td className="py-3 text-slate-600 font-medium">4. ค่าใช้จ่ายการฝึกอบรม</td>
                <td className="py-3 text-right font-mono text-slate-800">{totalTrainingCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
              </tr>
              
              {/* หมวดที่ 5 แยกบรรทัดให้เห็นชัดเจน */}
              <tr className="bg-slate-100/50">
                <td className="py-3 text-slate-600 font-medium">5. ค่าใช้จ่ายอื่น ๆ</td>
                <td className="py-3 text-right font-mono text-slate-800">{totalOtherCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="text-xs text-slate-500 bg-slate-50/50">
                <td className="py-1.5 pl-6 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div> ส่วนที่เป็น IT
                </td>
                <td className="py-1.5 text-right font-mono text-blue-600">{totalOtherIT.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="text-xs text-slate-500 bg-slate-50/50">
                <td className="py-1.5 pl-6 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-orange-400"></div> ส่วนที่เป็น Non-IT
                </td>
                <td className="py-1.5 text-right font-mono text-orange-600 pb-3">{totalOtherNonIT.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
            
            {/* ยอดรวมย่อย (Sub-total เฉพาะ IT) */}
            <tfoot className="border-t-2 border-slate-200">
              <tr>
                <td className="py-4 text-right font-bold text-slate-600 pr-4">รวมงบประมาณ (เฉพาะส่วน IT)</td>
                <td className="py-4 text-right font-mono font-bold text-lg text-primary">
                  {grandTotalITOnly.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- สรุปรวม Grand Total ไว้ล่างสุด (Sticky) --- */}
      <div className="bg-primary-container text-primary p-6 rounded-xl text-right shadow-md flex justify-between items-center sticky bottom-4 z-10 border border-primary/20 backdrop-blur-sm bg-primary-container/95">
        <span className="text-lg font-bold">รวมงบประมาณทั้งสิ้น (IT + Non-IT)</span>
        <span className="text-3xl font-black font-mono tracking-tight">{grandTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })} <span className="text-xl">บาท</span></span>
      </div>

    </div>
  );
};
