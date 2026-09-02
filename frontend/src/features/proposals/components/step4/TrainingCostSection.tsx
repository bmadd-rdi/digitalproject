"use client";

import { Control, FieldErrors, useFieldArray, useFormContext, UseFormRegister, UseFormSetValue, UseFormWatch, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProposalStep4Values } from "../../types";

/* React Hook Form's nested dynamic field paths require these two compatibility casts. */
/* eslint-disable @typescript-eslint/no-explicit-any */

// กำหนด Type สำหรับแถวข้อมูลวิทยากรและอาหาร
interface TrainingRowType {
  itemName?: string;
  hours?: number;
  ratePerHour?: number;
  days?: number;
  mealsCount?: number;
  ratePerMeal?: number;
  traineesCount?: number;
}

// กำหนด Type สำหรับ Props ของ Component
interface TrainingCourseItemProps {
  index: number;
  control: Control<ProposalStep4Values>;  
  register: UseFormRegister<ProposalStep4Values>;
  setValue: UseFormSetValue<ProposalStep4Values>;
  watch: UseFormWatch<ProposalStep4Values>;
  remove: (index?: number | number[]) => void;
  errors: FieldErrors<ProposalStep4Values>;
}

const foodTypeLabels: Record<string, string> = {
  PARTIAL_MEAL: "ค่าอาหาร (ไม่ครบมื้อ)",
  FULL_MEAL: "ค่าอาหารและเครื่องดื่ม",
  SNACK: "ค่าอาหารว่าง",
  OTHER: "ค่าอาหารอื่น ๆ",
};

const TrainingCourseItem = ({ index, control, register, setValue, watch, remove, errors }: TrainingCourseItemProps) => {
  const coursePath = `trainingCourses.${index}` as const;
  const speakerEnabledPath = `${coursePath}.hasSpeakerCost` as `trainingCourses.${number}.hasSpeakerCost`;
  const speakerCostsPath = `${coursePath}.speakerCosts` as `trainingCourses.${number}.speakerCosts`;
  const foodCostsPath = `${coursePath}.foodCosts` as `trainingCourses.${number}.foodCosts`;
  const rowErrors = errors?.trainingCourses?.[index] || {};
  
  const hasSpeaker = useWatch({ control, name: speakerEnabledPath });
  const watchedSpeakerCosts = useWatch({ control, name: speakerCostsPath }) || [];
  const watchedFoodCosts = useWatch({ control, name: foodCostsPath }) || [];

  const { fields: spkFields, append: appendSpk, remove: removeSpk } = useFieldArray({ control, name: speakerCostsPath });
  const { fields: foodFields } = useFieldArray({ control, name: foodCostsPath });

  const totalSpkCost = watchedSpeakerCosts.reduce((acc: number, row: TrainingRowType) => acc + ((row.hours || 0) * (row.ratePerHour || 0) * (row.days || 0)), 0);
  const totalFoodCost = watchedFoodCosts.reduce((acc: number, row: TrainingRowType) => acc + ((row.mealsCount || 0) * (row.ratePerMeal || 0) * (row.traineesCount || 0) * (row.days || 0)), 0);

  return (
    <div className="border border-border rounded-lg p-5 mb-6 bg-surface-container-lowest relative">
      <Button type="button" onClick={() => remove(index)} variant="ghost" size="sm" className="absolute top-4 right-4 text-status-orange hover:bg-red-100"><Trash2 className="w-4 h-4 mr-2" /> ลบหลักสูตร</Button>
      <h3 className="text-lg font-bold text-primary mb-4">หลักสูตรที่ {index + 1}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="md:col-span-2">
          <Label className="mb-1 block">หลักสูตร <span className="text-status-orange">*</span></Label>
          <Textarea {...register(`${coursePath}.courseName`)} className={`bg-surface ${rowErrors.courseName ? 'border-status-orange' : ''}`} placeholder="ระบุชื่อหลักสูตร..." />
          {rowErrors.courseName && <p className="text-status-orange text-xs mt-1">{rowErrors.courseName.message}</p>}
        </div>
        <div className="md:col-span-2">
          <Label className="mb-1 block">วิธีการฝึกอบรม <span className="text-status-orange">*</span></Label>
          <Textarea {...register(`${coursePath}.trainingMethod`)} className={`bg-surface ${rowErrors.trainingMethod ? 'border-status-orange' : ''}`} placeholder="ระบุวิธีการ..." />
          {rowErrors.trainingMethod && <p className="text-status-orange text-xs mt-1">{rowErrors.trainingMethod.message}</p>}
        </div>
        <div>
          <Label className="mb-2 block">สถานที่ฝึกอบรม <span className="text-status-orange">*</span></Label>
          <RadioGroup 
            value={watch(`${coursePath}.locationType`)}
            onValueChange={(val) => setValue(`${coursePath}.locationType`, val as "GOVERNMENT" | "PRIVATE", { shouldValidate: true })}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex items-center space-x-2"><RadioGroupItem value="GOVERNMENT" id={`loc-gov-${index}`} /><Label htmlFor={`loc-gov-${index}`}>สถานที่ราชการ</Label></div>
            <div className="flex items-center space-x-2"><RadioGroupItem value="PRIVATE" id={`loc-prv-${index}`} /><Label htmlFor={`loc-prv-${index}`}>สถานที่เอกชน</Label></div>
          </RadioGroup>
        </div>
      </div>

      <hr className="border-t border-border my-6" />

      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox 
            id={`has-spk-${index}`} 
            // แปลงค่า hasSpeaker ให้ชัวร์ว่าเป็น boolean แน่ๆ
            checked={!!hasSpeaker} 
            // แก้ไขที่ 2: เช็คให้แน่ใจว่าค่าที่เข้า setValue คือ boolean แน่นอน (checked === true)
            onCheckedChange={(checked) => setValue(`${coursePath}.hasSpeakerCost`, checked === true)} 
          />
          <Label htmlFor={`has-spk-${index}`} className="font-bold text-md cursor-pointer text-foreground">ตารางค่าสมนาคุณวิทยากร (ถ้ามี) <span className="text-muted-foreground font-normal">(วิทยากรต้องไม่ใช่บุคลากรที่ใช้ในการพัฒนาระบบ)</span></Label>
        </div>

        {hasSpeaker && (
          <div className="pl-6 border-l-2 border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-2">
            <div className="overflow-x-auto border border-border rounded-md">
              <table className="w-full text-left min-w-200 text-xs">
                <thead className="bg-surface-container-low text-slate-gray text-center">
                  <tr>
                    <th className="p-2 w-12" rowSpan={2}>ลำดับ</th>
                    <th className="p-2 w-1/3" rowSpan={2}>รายการ</th>
                    <th className="p-2 border-b border-surface-variant" colSpan={2}>อัตราค่าใช้จ่าย</th>
                    <th className="p-2 w-24" rowSpan={2}>ระยะเวลา(วัน)</th>
                    <th className="p-2 w-32" rowSpan={2}>จำนวนเงิน(บาท)</th>
                    <th className="p-2 w-10" rowSpan={2}>ลบ</th>
                  </tr>
                  <tr>
                    <th className="p-2 border-r border-surface-variant w-28">จำนวนชั่วโมง</th>
                    <th className="p-2 w-32">อัตราชั่วโมงละ(บาท)</th>
                  </tr>
                </thead>
                <tbody>
                  {spkFields.map((field, sIdx) => {
                    const row = watchedSpeakerCosts[sIdx] || {};
                    const spkRowErrors = rowErrors?.speakerCosts?.[sIdx] || {};
                    const rowTotal = (row.hours || 0) * (row.ratePerHour || 0) * (row.days || 0);
                    return (
                      <tr key={field.id} className="border-t border-surface-variant">
                        <td className="p-1 text-center">{sIdx + 1}</td>
                        <td className="p-1"><Input {...register(`${coursePath}.speakerCosts.${sIdx}.itemName`)} className={`h-8 text-xs bg-surface ${spkRowErrors.itemName ? 'border-status-orange' : ''}`} /></td>
                        <td className="p-1"><Input type="number" {...register(`${coursePath}.speakerCosts.${sIdx}.hours`, { valueAsNumber: true })} className={`h-8 text-xs bg-surface text-center ${spkRowErrors.hours ? 'border-status-orange' : ''}`} /></td>
                        <td className="p-1"><Input type="number" {...register(`${coursePath}.speakerCosts.${sIdx}.ratePerHour`, { valueAsNumber: true })} className={`h-8 text-xs bg-surface text-center ${spkRowErrors.ratePerHour ? 'border-status-orange' : ''}`} /></td>
                        <td className="p-1"><Input type="number" {...register(`${coursePath}.speakerCosts.${sIdx}.days`, { valueAsNumber: true })} className={`h-8 text-xs bg-surface text-center ${spkRowErrors.days ? 'border-status-orange' : ''}`} /></td>
                        <td className="p-1 text-right font-medium text-primary pr-3">{rowTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                        <td className="p-1 text-center"><Button type="button" onClick={() => removeSpk(sIdx)} variant="ghost" size="icon" className="h-7 w-7 text-status-orange"><Trash2 className="w-3 h-3" /></Button></td>
                      </tr>
                    );
                  })}
                  <tr className="bg-surface-container-lowest">
                    <td colSpan={7} className="p-2"><Button type="button" onClick={() => appendSpk({ itemName: "", hours: "", ratePerHour: "", days: "" } as any)} variant="soft" size="sm" className="text-xs h-7">+ เพิ่มรายการวิทยากร</Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div>
              <Label className="mb-1 block">เหตุผลความจำเป็นที่ต้องใช้วิทยากรเชี่ยวชาญเฉพาะด้าน <span className="text-status-orange">*</span></Label>
              <Textarea {...register(`${coursePath}.speakerReason`)} className={`bg-surface min-h-15 ${rowErrors.speakerReason ? 'border-status-orange' : ''}`} placeholder="ระบุเหตุผล..." />
              {rowErrors.speakerReason && <p className="text-status-orange text-xs mt-1">{rowErrors.speakerReason.message}</p>}
            </div>
            <div className="text-right text-sm font-bold text-foreground">รวมค่าวิทยากร: {totalSpkCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</div>
          </div>
        )}
      </div>

      <div>
        <Label className="font-bold text-md text-foreground block mb-3">ตารางค่าอาหาร อาหารว่างและเครื่องดื่ม<span className="text-muted-foreground font-normal"> (ถ้าไม่มีค่าใช้จ่าย ให้ใส่ 0)</span></Label>
        <div className="overflow-x-auto border border-border rounded-md">
          <table className="w-full text-left min-w-200 text-xs">
            <thead className="bg-surface-container-low text-slate-gray text-center">
              <tr>
                <th className="p-2 w-12" rowSpan={2}>ลำดับ</th>
                <th className="p-2 w-[30%]" rowSpan={2}>รายการ</th>
                <th className="p-2 border-b border-surface-variant" colSpan={3}>อัตราค่าใช้จ่าย</th>
                <th className="p-2 w-20" rowSpan={2}>ระยะเวลา(วัน)</th>
                <th className="p-2 w-32" rowSpan={2}>จำนวนเงิน(บาท)</th>
              </tr>
              <tr>
                <th className="p-2 border-r border-surface-variant w-20">จำนวน(มื้อ)</th>
                <th className="p-2 border-r border-surface-variant w-24">อัตรามื้อละ(บาท)</th>
                <th className="p-2 w-32">จำนวนผู้ฝึกอบรม(คน)</th>
              </tr>
            </thead>
            <tbody>
              {foodFields.map((field, fIdx) => {
                const row = watchedFoodCosts[fIdx] || {};
                const rowTotal = (row.mealsCount || 0) * (row.ratePerMeal || 0) * (row.traineesCount || 0) * (row.days || 0);
                return (
                  <tr key={field.id} className="border-t border-surface-variant">
                    <td className="p-2 text-center text-muted-foreground">{fIdx + 1}</td>
                    <td className="p-2 font-medium">{foodTypeLabels[row.itemName] ?? row.itemName} <input type="hidden" {...register(`${coursePath}.foodCosts.${fIdx}.itemName`)} value={row.itemName} /></td>
                    <td className="p-1"><Input type="number" {...register(`${coursePath}.foodCosts.${fIdx}.mealsCount`, { valueAsNumber: true })} className="h-8 text-xs bg-surface text-center" /></td>
                    <td className="p-1"><Input type="number" {...register(`${coursePath}.foodCosts.${fIdx}.ratePerMeal`, { valueAsNumber: true })} className="h-8 text-xs bg-surface text-center" /></td>
                    <td className="p-1"><Input type="number" {...register(`${coursePath}.foodCosts.${fIdx}.traineesCount`, { valueAsNumber: true })} className="h-8 text-xs bg-surface text-center" /></td>
                    <td className="p-1"><Input type="number" {...register(`${coursePath}.foodCosts.${fIdx}.days`, { valueAsNumber: true })} className="h-8 text-xs bg-surface text-center" /></td>
                    <td className="p-2 text-right font-medium text-primary">{rowTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">หมายเหตุ: ระเบียบกรุงเทพมหานครว่าด้วยค่าใช้จ่ายในการฝึกอบรม พ.ศ. 2541</div>
        <div className="text-right text-sm font-bold text-foreground mt-2">รวมค่าอาหาร: {totalFoodCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท</div>
      </div>
      
      <div className="mt-6 bg-primary/10 p-3 rounded-md text-right font-bold text-primary">
        รวมงบประมาณหลักสูตรที่ {index + 1}: {(totalSpkCost + totalFoodCost).toLocaleString('th-TH', { minimumFractionDigits: 2 })} บาท
      </div>
    </div>
  );
};

export const TrainingCostSection = () => {
  const { control, register, setValue, watch, formState: { errors } } = useFormContext<ProposalStep4Values>();
  const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({ control, name: "trainingCourses" });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Label className="text-md font-bold text-foreground">ค่าใช้จ่ายการฝึกอบรม (หลักสูตร วิธีการฝึกอบรม ระยะเวลา ค่าใช้จ่าย จำนวนผู้ฝึกอบรมและวิทยากร)</Label>
        <Button 
          type="button" 
          onClick={() => appendCourse({ 
            courseName: "", trainingMethod: "", locationType: "GOVERNMENT",
            hasSpeakerCost: false, speakerReason: "", speakerCosts: [], 
            foodCosts: [
              { itemName: "PARTIAL_MEAL", mealsCount: "", ratePerMeal: "", traineesCount: "", days: "" },
              { itemName: "FULL_MEAL", mealsCount: "", ratePerMeal: "", traineesCount: "", days: "" },
              { itemName: "SNACK", mealsCount: "", ratePerMeal: "", traineesCount: "", days: "" }
            ] 
          } as any)} 
          size="sm" 
          className="rounded-full gap-2"
        >
          <Plus className="w-4 h-4"/> เพิ่มหลักสูตร
        </Button>
      </div>

      {courseFields.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground bg-surface">
          ไม่มีหลักสูตรฝึกอบรมในโครงการนี้
        </div>
      ) : (
        courseFields.map((field, index) => (
          <TrainingCourseItem key={field.id} index={index} control={control} register={register} setValue={setValue} watch={watch} remove={removeCourse} errors={errors} />
        ))
      )}
    </div>
  );
};
