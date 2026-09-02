"use client";

import React, { useEffect } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProposalStep4Values } from "../../types";

// ----------------------------------------------------------------------
// 1. Types & Interfaces
// ----------------------------------------------------------------------

// โครงสร้างข้อมูลสำหรับ 1 แถว ในตารางบุคลากร
interface PersonnelCostItem {
  id?: string;
  position: string;
  degree: string;
  fieldOfStudy?: string; // สาขา (มีเฉพาะ Core/Asst)
  experienceYears: number;
  baseSalary: number;
  multiplier?: number;   // ตัวคูณ (มีเฉพาะ Core/Asst)
  personCount: number;
  durationMonths: number;
}

// ----------------------------------------------------------------------
// 2. Component: PersonnelTable (ตารางย่อยสำหรับแต่ละกลุ่มบุคลากร)
// ----------------------------------------------------------------------
const PersonnelTable = ({ 
  title, 
  nameArray, 
  isSupport = false 
}: { 
  title: string; 
  nameArray: "personnelCoreCosts" | "personnelAsstCosts" | "personnelSuppCosts"; 
  isSupport?: boolean;
}) => {
  const { control, register, formState: { errors } } = useFormContext<ProposalStep4Values>();
  const { fields, append, remove } = useFieldArray({ control, name: nameArray });
  const appendPersonnel = append as unknown as (value: PersonnelCostItem) => void;
  
  // ดึงค่าปัจจุบันที่พิมพ์อยู่ (Real-time) เพื่อเอามาคำนวณเงินรวมรายแถว
  const watchedRows = useWatch({ control, name: nameArray }) as PersonnelCostItem[] || [];
  const tableErrors = (errors[nameArray] as unknown as Record<string, { message?: string }>[]) || [];

  return (
    <div className="space-y-3 mt-3">
      
      {/* 2.1 ส่วนหัว: ชื่อตาราง และ ปุ่มเพิ่มแถว */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-bold text-slate-700">{title}</Label>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
          </span>
        </div>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="h-7 text-[11px]"
          onClick={() => appendPersonnel(
            isSupport 
              ? { position: "", degree: "", experienceYears: 0, baseSalary: 0, personCount: 1, durationMonths: 1 }
              : { position: "", degree: "", fieldOfStudy: "", experienceYears: 0, baseSalary: 0, multiplier: 1, personCount: 1, durationMonths: 1 }
          )}
        >
          <Plus className="w-3 h-3 mr-1" /> เพิ่ม{title}
        </Button>
      </div>

      {/* 2.2 โครงสร้างตาราง (Table Grid) */}
      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        {/* ให้ความกว้างขั้นต่ำ (min-w) เพื่อดันให้เกิด Scrollbar แนวนอน ป้องกัน Input เบียดกันในจอเล็ก */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[12px] min-w-225">
            
            {/* --- 2.2.1 หัวตาราง (Thead) --- */}
            <thead>
              {/* แถวที่ 1: แบ่งกลุ่มสายตา (Grouping) */}
              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th colSpan={isSupport ? 3 : 4} className="p-1.5 text-center border-r border-slate-200">ข้อมูลบุคลากร</th>
                <th colSpan={isSupport ? 4 : 5} className="p-1.5 text-center border-r border-emerald-200/50 bg-emerald-50/50 text-emerald-700">การคำนวณค่าตอบแทน</th>
                <th className="w-10"></th>
              </tr>
              
              {/* แถวที่ 2: ชื่อคอลัมน์ */}
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-2 w-8 text-center font-medium">#</th>
                <th className="p-2 text-left font-medium w-48">ตำแหน่ง</th>
                <th className="p-2 text-left font-medium w-32">วุฒิ</th>
                {!isSupport && <th className="p-2 text-left font-medium w-32 bg-blue-50/30 text-blue-700">สาขา</th>}
                
                <th className="p-2 text-center font-medium w-16 leading-tight border-l border-slate-200">ประสบการณ์ ไ่ม่น้อยกว่า<br/>(ปี)</th>
                <th className="p-2 text-right font-medium w-32 bg-emerald-50/50 text-emerald-800">อัตราเงินเดือนพื้นฐาน(บาท)</th>
                {!isSupport && <th className="p-2 text-center font-medium w-16 bg-blue-50/30 text-blue-700">ตัวคูณ</th>}
                <th className="p-2 text-center font-medium w-16">คน</th>
                <th className="p-2 text-center font-medium w-16">เดือน</th>
                <th className="p-2 text-right font-medium w-32 bg-emerald-50/50 text-emerald-800">รวม (บาท)</th>
                <th className="p-2 w-10 text-center border-l border-slate-200"></th>
              </tr>
            </thead>
            
            {/* --- 2.2.2 เนื้อหาตาราง (Tbody) --- */}
            {/* eslint-disable react/no-unescaped-entities */}
            <tbody className="divide-y divide-slate-100">
              {/* กรณีไม่มีข้อมูล */}
              {fields.length === 0 && (
                <tr>
                  <td colSpan={isSupport ? 9 : 11} className="p-8 text-center text-slate-400 italic bg-slate-50/30">
                    ยังไม่มีข้อมูล กรุณากด "เพิ่ม{title}"
                  </td>
                </tr>
              )}
              
              {/* ใส่ Type Record ให้ field เพื่อปิด Error: Property 'position' does not exist */}
              {fields.map((field: Record<"id", string> & Partial<PersonnelCostItem>, index) => {
                const row = watchedRows[index] || {} as PersonnelCostItem;
                const rowErr = tableErrors[index] || {};
                
                // คำนวณยอดเงินรวมต่อแถว
                const base = Number(row.baseSalary || 0);
                const mult = isSupport ? 1 : Number(row.multiplier || 1);
                const people = Number(row.personCount || 0);
                const months = Number(row.durationMonths || 0);
                const rowTotal = base * mult * people * months;

                return (
                  <tr key={field.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-2 text-center text-slate-400">{index + 1}</td>
                    
                    {/* กลุ่ม: ข้อมูลบุคลากร */}
                    <td className="p-1.5">
                      <Input 
                        {...register(`${nameArray}.${index}.position`)} 
                        className={cn("h-8 text-[12px] bg-white", rowErr.position && "border-orange-500 bg-orange-50")} 
                        placeholder="ระบุตำแหน่ง..."
                      />
                    </td>
                    <td className="p-1.5">
                      <Input {...register(`${nameArray}.${index}.degree`)} className="h-8 text-[12px] bg-white" placeholder="ป.ตรี / ป.โท" />
                    </td>
                    {!isSupport && (
                      <td className="p-1.5 bg-blue-50/10">
                        <Input {...register(`${nameArray}.${index}.fieldOfStudy` as never)} className="h-8 text-[12px] bg-white border-blue-200 focus-visible:ring-blue-500" placeholder="ระบุสาขา" />
                      </td>
                    )}
                    
                    {/* กลุ่ม: การคำนวณ (เน้นสีเขียว/ฟ้า) */}
                    <td className="p-1.5 border-l border-slate-100">
                      <Input type="number" {...register(`${nameArray}.${index}.experienceYears`)} className="h-8 text-[12px] text-center bg-white" />
                    </td>
                    <td className="p-1.5 bg-emerald-50/20">
                      <Input type="number" {...register(`${nameArray}.${index}.baseSalary`)} className="h-8 text-[12px] text-right font-mono bg-white border-emerald-200 focus-visible:ring-emerald-500" />
                    </td>
                    {!isSupport && (
                      <td className="p-1.5 bg-blue-50/10">
                        <Input type="number" step="0.1" {...register(`${nameArray}.${index}.multiplier` as never)} className="h-8 text-[12px] text-center bg-white border-blue-200 focus-visible:ring-blue-500" />
                      </td>
                    )}
                    <td className="p-1.5">
                      <Input type="number" {...register(`${nameArray}.${index}.personCount`)} className="h-8 text-[12px] text-center bg-white" />
                    </td>
                    <td className="p-1.5">
                      <Input type="number" {...register(`${nameArray}.${index}.durationMonths`)} className="h-8 text-[12px] text-center bg-white" />
                    </td>
                    
                    {/* ยอดรวมสุทธิรายแถว */}
                    <td className="p-2 text-right font-bold text-emerald-700 bg-emerald-50/30 font-mono tracking-tight">
                      {rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    
                    {/* ปุ่มลบ (ซ่อนไว้ โชว์ตอน Hover แถว) */}
                    <td className="p-1 text-center border-l border-slate-100">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. Component หลัก: PersonnelCostSection (หมวดที่ 3)
// ----------------------------------------------------------------------
export const PersonnelCostSection = () => {
  const { control, register, formState: { errors } } = useFormContext<ProposalStep4Values>();

  // Watch ตำแหน่งจากตารางทั้ง 3 เพื่อเอามาสร้างตาราง "หน้าที่ความรับผิดชอบ"
  const watchedCore = useWatch({ control, name: "personnelCoreCosts" });
  const watchedAsst = useWatch({ control, name: "personnelAsstCosts" });
  const watchedSupp = useWatch({ control, name: "personnelSuppCosts" });
  const currentRespValues = useWatch({ control, name: "personnelResponsibilities" });

  const { fields: respFields, replace: replaceResp } = useFieldArray({ 
    control, 
    name: "personnelResponsibilities" 
  });

  // 📍 Effect: Sync "ชื่อตำแหน่ง" จากตารางบน ลงมาสร้างฟอร์ม "หน้าที่รับผิดชอบ" อัตโนมัติ
  useEffect(() => {
    // 1. กวาดชื่อตำแหน่งทั้งหมดมารวมกัน ตัดช่องว่าง และคัดเอาเฉพาะที่ไม่ใช่ค่าว่าง
    const allPositions = [
      ...(watchedCore ?? []).map((p) => p.position),
      ...(watchedAsst ?? []).map((p) => p.position),
      ...(watchedSupp ?? []).map((p) => p.position),
    ]
    .map(p => p?.trim())
    .filter(p => p && p !== "");

    // 2. ใช้ Set เพื่อลบตำแหน่งที่ซ้ำกันทิ้ง (เช่น มี Programmer 3 คน ก็เอามาเขียนหน้าที่แค่ข้อเดียว)
    const uniquePositions = Array.from(new Set(allPositions));

    // 3. ดึงหน้าที่ที่เคยพิมพ์ไว้แล้วมาเก็บไว้ก่อน จะได้ไม่ลบของเก่าทิ้งเวลา User พิมพ์ตำแหน่งเพิ่ม
    // 4. สร้าง Array ใหม่สำหรับการแสดงผล
    const newRespList = uniquePositions.map(pos => {
      const existing = (currentRespValues ?? []).find((r) => r.position === pos);
      return {
        position: pos,
        responsibility: existing ? existing.responsibility : ""
      };
    });

    // 5. เช็คว่ามีอะไรเปลี่ยนแปลงไหมก่อนสั่ง Replace (ป้องกัน React บ่นเรื่อง Infinite Loop)
    const currentPosKey = JSON.stringify(respFields.map((f) => f.position));
    const newPosKey = JSON.stringify(uniquePositions);

    if (currentPosKey !== newPosKey) {
      replaceResp(newRespList);
    }
  }, [watchedCore, watchedAsst, watchedSupp, currentRespValues, respFields, replaceResp]); // ให้ทำงานทุกครั้งที่มีการพิมพ์ตำแหน่งใหม่

  return (
    <div className="space-y-4">
      {/* 3.2 ตารางทั้ง 3 กลุ่ม */}
      <div className="grid grid-cols-1 space-y-2">
        <PersonnelTable title="บุคลากรหลัก" nameArray="personnelCoreCosts" />
        <PersonnelTable title="บุคลากรผู้ช่วย" nameArray="personnelAsstCosts" />
        <PersonnelTable title="บุคลากรสนับสนุน" nameArray="personnelSuppCosts" isSupport={true} />
      </div>

      {/* 3.3 ตารางหน้าที่ความรับผิดชอบ (จะโชว์ก็ต่อเมื่อมีตำแหน่งอย่างน้อย 1 ตำแหน่ง) */}
      {respFields.length > 0 && (
        <div className="mt-10 animate-in fade-in slide-in-from-top-2 duration-500">
          
          <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-800">
            <Info className="w-4 h-4" />
            <p className="text-xs font-medium">กรุณาระบุหน้าที่ความรับผิดชอบตามตำแหน่งที่ระบุไว้ด้านบน</p>
          </div>
          
          <div className="border rounded-md bg-white shadow-sm overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="p-3 w-16 text-center font-medium">ลำดับ</th>
                  <th className="p-3 text-left font-medium w-1/3">ตำแหน่ง</th>
                  <th className="p-3 text-left font-medium">หน้าที่ความรับผิดชอบอย่างละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {respFields.map((field, index) => {
                  const error = errors.personnelResponsibilities?.[index]?.responsibility;
                  
                  return (
                    <tr key={field.id} className="hover:bg-slate-50/50">
                      <td className="p-4 text-center text-slate-400 font-mono text-xs">{index + 1}</td>
                      <td className="p-4 align-top">
                        <div className="font-bold text-slate-700">{field.position}</div>
                        {/* ซ่อน Input ไว้เผื่อส่งค่า Submit */}
                        <input type="hidden" {...register(`personnelResponsibilities.${index}.position`)} />
                      </td>
                      <td className="p-2">
                        <Textarea 
                          {...register(`personnelResponsibilities.${index}.responsibility`)}
                          placeholder="ระบุหน้าที่... เช่น พัฒนาส่วนงาน Frontend, ออกแบบฐานข้อมูล ฯลฯ"
                          className={cn(
                            "min-h-20 text-sm bg-slate-50/30 focus:bg-white transition-colors",
                            error && "border-orange-500 focus-visible:ring-orange-500"
                          )}
                        />
                        {error && (
                          <p className="text-[11px] text-orange-600 mt-1 font-medium">
                            {error.message}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
