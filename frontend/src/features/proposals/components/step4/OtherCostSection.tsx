import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import type { ProposalStep4Values } from "../../types";

export const OtherCostSection = () => {
  const { control, register, setValue, formState: { errors } } = useFormContext<ProposalStep4Values>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "otherCosts",
  });

  // Watch ข้อมูลเพื่อคำนวณยอดรวม (Real-time)
  const watchedRows = useWatch({ control, name: "otherCosts" }) || [];
  const tableErrors = errors.otherCosts || [];

  return (
    <div className="space-y-3 mt-4">
      <div className="flex justify-between items-center mb-2">
        <Label className="text-md font-bold text-foreground">ค่าใช้จ่ายอื่น ๆ ที่ไม่อยู่ในหมวดฮาร์ดแวร์ ซอฟต์แวร์ บุคลากร หรือการฝึกอบรม</Label>
        <Button
          type="button"
          variant="default"
          size="sm"
          className=""
          onClick={() => append({ 
            itemName: "", 
            quantity: 1, 
            unitPrice: 0, 
            costType: "IT", // กำหนดค่าเริ่มต้นเป็น IT หรือปล่อยว่าง "" ก็ได้
            remark: "" 
          })}
        >
          <Plus className="w-3 h-3 mr-1" /> เพิ่มรายการอื่น ๆ
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-[12px] min-w-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <th className="p-2 w-8 text-center font-medium">#</th>
                <th className="p-2 text-left font-medium">รายการ</th>
                <th className="p-2 text-center font-medium w-40">ประเภท (IT / Non-IT)</th>
                <th className="p-2 text-center font-medium w-20">จำนวน</th>
                <th className="p-2 text-right font-medium w-28 bg-emerald-50/50 text-emerald-800">ราคา/หน่วย</th>
                <th className="p-2 text-right font-medium w-32 bg-emerald-50/50 text-emerald-800">รวม (บาท)</th>
                <th className="p-2 text-left font-medium w-48">หมายเหตุ</th>
                <th className="p-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 italic bg-slate-50/30">
                    ยังไม่มีรายการค่าใช้จ่ายอื่น ๆ
                  </td>
                </tr>
              )}

              {fields.map((field, index) => {
                const row = watchedRows[index] || {};
                const rowErr = tableErrors[index] || {};
                
                const qty = Number(row.quantity || 0);
                const price = Number(row.unitPrice || 0);
                const rowTotal = qty * price;
                const currentType = row.costType; // ค่าปัจจุบันของ costType

                return (
                  <tr key={field.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-2 text-center text-slate-400">{index + 1}</td>
                    
                    <td className="p-1.5">
                      <Input 
                        {...register(`otherCosts.${index}.itemName`)} 
                        className={cn("h-8 text-[12px] bg-white", rowErr.itemName && "border-orange-500")} 
                        placeholder="ระบุชื่อรายการ..."
                      />
                    </td>
                    
                    {/* ส่วนที่ให้เลือก IT / Non-IT แบบ Custom Radio (Segmented Control) */}
                    <td className="p-1.5 text-center">
                      <div className="flex items-center h-8 bg-slate-100 p-0.5 rounded-md border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setValue(`otherCosts.${index}.costType`, "IT", { shouldValidate: true })}
                          className={cn(
                            "flex-1 text-[11px] font-medium h-full rounded-sm transition-all",
                            currentType === "IT" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          IT
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue(`otherCosts.${index}.costType`, "NON_IT", { shouldValidate: true })}
                          className={cn(
                            "flex-1 text-[11px] font-medium h-full rounded-sm transition-all",
                            currentType === "NON_IT" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          Non-IT
                        </button>
                      </div>
                      {/* ซ่อน input ตัวจริงไว้สำหรับส่งค่า */}
                      <input type="hidden" {...register(`otherCosts.${index}.costType`)} />
                    </td>

                    <td className="p-1.5">
                      <Input type="number" {...register(`otherCosts.${index}.quantity`)} className="h-8 text-[12px] text-center bg-white" />
                    </td>
                    <td className="p-1.5 bg-emerald-50/20">
                      <Input type="number" {...register(`otherCosts.${index}.unitPrice`)} className="h-8 text-[12px] text-right font-mono bg-white" />
                    </td>
                    <td className="p-2 text-right font-bold text-emerald-700 bg-emerald-50/30 font-mono tracking-tight">
                      {rowTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-1.5">
                      <Input 
                        {...register(`otherCosts.${index}.remark`)} 
                        className="h-8 text-[12px] bg-white" 
                        placeholder="หมายเหตุเพิ่มเติม..."
                      />
                    </td>
                    <td className="p-1 text-center">
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
