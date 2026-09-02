// src/features/projects/components/ProjectStep2.tsx
import {
  useFormContext,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { ProposalStep2Values } from "../types";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextarea } from "@/components/custom/RichTextarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AgencyComboBox } from "@/components/custom/DepartmentComboBox";

export const ProposalStep2 = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ProposalStep2Values>();

  const selectedProjectType = useWatch({
    control,
    name: "projectType",
  });

  const showRelatedProjects =
    selectedProjectType === "REPLACEMENT" ||
    selectedProjectType === "CONTINUOUS";

  // --- Field Arrays สำหรับจัดการตาราง ---
  const { fields: relatedFields, append: appendRelated, remove: removeRelated } = useFieldArray({
    control,
    name: "relatedProjects",
  });

  const { fields: manpowerFields, append: appendManpower, remove: removeManpower } = useFieldArray({
    control,
    name: "manpower",
  });

  const { fields: equipmentFields, append: appendEquipment, remove: removeEquipment } = useFieldArray({
    control,
    name: "existingEquipment",
  });

  // --- ตัวแปรช่วยดึง Error ของตาราง (ป้องกัน TypeScript บ่นตอน map) ---
  const relatedErrors = errors.relatedProjects || [];
  const manpowerErrors = errors.manpower || [];
  const equipmentErrors = errors.existingEquipment || [];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">2. สาระสำคัญและขอบเขต</h2>

      <div className="grid grid-cols-1 gap-8">

        {/* ============================================================== */}
        {/* --- ส่วนที่ 1: ข้อมูลพื้นฐาน --- */}
        {/* ============================================================== */}

        <div className="w-full">
          <Label htmlFor="background" className="text-sm font-medium text-foreground">
            หลักการและเหตุผล / ความเป็นมา <span className="text-status-orange">*</span>
          </Label>
          <RichTextarea
            id="background"
            {...register("background")}
            rows={4}
            placeholder="พิมพ์อย่างน้อย 10 ตัวอักษร (กด Tab เพื่อย่อหน้า)"
            className={cn("mt-1.5 resize-none bg-surface", errors.background && "border-status-orange focus-visible:ring-status-orange")}
          />
          {errors.background && (
            <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.background.message}
            </p>
          )}
        </div>

        <div className="w-full">
          <Label htmlFor="objective" className="text-sm font-medium text-foreground">
            วัตถุประสงค์ <span className="text-status-orange">*</span>
          </Label>
          <RichTextarea
            id="objective"
            {...register("objective")}
            rows={3}
            placeholder="พิมพ์อย่างน้อย 10 ตัวอักษร (กด Tab เพื่อย่อหน้า)"
            className={cn("mt-1.5 resize-none bg-surface", errors.objective && "border-status-orange focus-visible:ring-status-orange")}
          />
          {errors.objective && (
            <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.objective.message}
            </p>
          )}
        </div>

        <div className="w-full">
          <Label htmlFor="target" className="text-sm font-medium text-foreground">
            เป้าหมาย <span className="text-status-orange">*</span>
          </Label>
          <RichTextarea
            id="target"
            {...register("target")}
            rows={3}
            placeholder="พิมพ์อย่างน้อย 10 ตัวอักษร (กด Tab เพื่อย่อหน้า)"
            className={cn("mt-1.5 resize-none bg-surface", errors.target && "border-status-orange focus-visible:ring-status-orange")}
          />
          {errors.target && (
            <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.target.message}
            </p>
          )}
        </div>

        <div className="w-full">
          <Label htmlFor="scope" className="text-sm font-medium text-foreground">
            ขอบเขตการดำเนินงาน <span className="text-status-orange">*</span>
          </Label>
          <RichTextarea
            id="scope"
            {...register("scope")}
            rows={4}
            placeholder="พิมพ์อย่างน้อย 10 ตัวอักษร (กด Tab เพื่อย่อหน้า)"
            className={cn("mt-1.5 resize-none bg-surface", errors.scope && "border-status-orange focus-visible:ring-status-orange")}
          />
          {errors.scope && (
            <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.scope.message}
            </p>
          )}
        </div>

        <div className="border-t border-border" />

        {/* ============================================================== */}
        {/* --- ส่วนที่ 2: ลักษณะโครงการ และ โครงการที่เกี่ยวข้อง --- */}
        {/* ============================================================== */}

        <div>
          <Label className="text-sm font-medium text-foreground mb-3 block">
            ลักษณะโครงการ <span className="text-status-orange">*</span>
          </Label>
          <Controller
            control={control}
            name="projectType"
            render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col sm:flex-row gap-6">
                {[
                  { value: "NEW", label: "จัดหาใหม่" },
                  { value: "REPLACEMENT", label: "ทดแทนระบบเดิม" },
                  { value: "CONTINUOUS", label: "โครงการต่อเนื่อง" },
                ].map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={`project-type-${type.value}`} />
                    <Label htmlFor={`project-type-${type.value}`} className="font-normal cursor-pointer text-foreground">{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
          {errors.projectType && (
            <p className="mt-2 text-sm text-status-orange flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {errors.projectType.message}
            </p>
          )}
        </div>

        {/* --- ข้อมูลโครงการที่เกี่ยวข้อง (แสดงเฉพาะเมื่อเลือกทดแทน/ต่อเนื่อง) --- */}
        {showRelatedProjects && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-bold text-foreground">ข้อมูลโครงการที่เกี่ยวข้อง</h3>
              <Button
                type="button" variant="soft" size="sm" className="rounded-full gap-2"
                onClick={() => appendRelated({ projectName: "", agency: "", fiscalYear: "", relationType: "", remark: "" })}
              >
                <Plus className="w-4 h-4" /> เพิ่มโครงการ
              </Button>
            </div>

            <div className="space-y-4">
              {relatedFields.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-slate-gray">
                  {/* eslint-disable-next-line react/no-unescaped-entities */}
                  กรุณากดปุ่ม "เพิ่มโครงการ" เพื่อระบุข้อมูล
                </div>
              ) : (
                relatedFields.map((field, index) => {
                  const rowErr = relatedErrors[index] || {};

                  return (
                    <div key={field.id} className="relative p-6 bg-surface-container-low border-none rounded-[24px] shadow-sm group">
                      <div className="flex justify-between items-center mb-5 pb-3 border-b border-border/50">
                        <h4 className="font-bold text-sm text-foreground">รายการที่ {index + 1}</h4>
                        <Button
                          type="button" variant="ghost" size="icon-sm" className="text-status-orange hover:bg-error-container hover:text-error rounded-full"
                          onClick={() => removeRelated(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-12">
                          <Label className="text-xs text-slate-gray mb-1.5 block">โครงการที่เกี่ยวข้อง <span className="text-status-orange">*</span></Label>
                          <Textarea
                            {...register(`relatedProjects.${index}.projectName`)}
                            placeholder="ระบุชื่อโครงการ"
                            rows={2}
                            className={cn("resize-none bg-surface", rowErr.projectName && "border-status-orange bg-orange-50/50")}
                          />
                        </div>
                        <div className="md:col-span-8">
                          <Label className="text-xs text-slate-gray mb-1.5 block">หน่วยงาน <span className="text-status-orange">*</span></Label>
                          <Controller
                            control={control}
                            name={`relatedProjects.${index}.agency`}
                            render={({ field: { onChange, value } }) => (
                              <div className={cn("rounded-md", rowErr.agency && "ring-1 ring-status-orange")}>
                                <AgencyComboBox value={value} onChange={onChange} />
                              </div>
                            )}
                          />
                        </div>
                        <div className="md:col-span-4 flex flex-col justify-between">
                          <Label className="text-xs text-slate-gray block mb-1.5">ปีงบประมาณ <span className="text-status-orange">*</span></Label>
                          <Input
                            {...register(`relatedProjects.${index}.fiscalYear`)}
                            placeholder="เช่น 2567"
                            className={cn("bg-surface h-10", rowErr.fiscalYear && "border-status-orange bg-orange-50/50")}
                          />
                        </div>
                        <div className="md:col-span-12">
                          <Label className="text-xs text-slate-gray mb-1.5 block">เกี่ยวข้องโดย (อธิบายความสัมพันธ์) <span className="text-status-orange">*</span></Label>
                          <Textarea
                            {...register(`relatedProjects.${index}.relationType`)}
                            placeholder="เช่น ทดแทนระบบเดิม..."
                            rows={2}
                            className={cn("resize-none bg-surface", rowErr.relationType && "border-status-orange bg-orange-50/50")}
                          />
                        </div>
                        <div className="md:col-span-12">
                          <Label className="text-xs text-slate-gray mb-1.5 block">หมายเหตุ</Label>
                          <Input
                            {...register(`relatedProjects.${index}.remark`)}
                            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                            className="bg-surface"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="border-t border-border" />

        {/* ============================================================== */}
        {/* --- ส่วนที่ 3: สภาพปัจจุบัน (Current Status) --- */}
        {/* ============================================================== */}

        <div className="flex flex-col space-y-8">
          <h3 className="text-xl font-bold text-foreground">สภาพปัจจุบัน</h3>

          <div className="space-y-6">
            <div className="w-full">
              <Label htmlFor="currentSystemStatus" className="text-sm font-medium text-foreground">
                สถานภาพระบบงานคอมพิวเตอร์ปัจจุบัน <span className="text-status-orange">*</span>
              </Label>
              <Textarea
                id="currentSystemStatus"
                {...register("currentSystemStatus")}
                rows={3}
                placeholder="อธิบายสถานภาพระบบงานปัจจุบัน..."
                className={cn("mt-1.5 resize-none bg-surface", errors.currentSystemStatus && "border-status-orange focus-visible:ring-status-orange")}
              />
              {errors.currentSystemStatus && (
                <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.currentSystemStatus.message}
                </p>
              )}
            </div>

            <div className="w-full">
              <Label htmlFor="currentProblems" className="text-sm font-medium text-foreground">
                สภาพปัญหาของผู้รับบริการ / เหตุผลความจำเป็น <span className="text-status-orange">*</span>
              </Label>
              <RichTextarea
                id="currentProblems"
                {...register("currentProblems")}
                rows={4}
                placeholder="อธิบายสภาพปัญหาปัจจุบัน (กด Tab เพื่อย่อหน้า)"
                className={cn("mt-1.5 resize-none bg-surface", errors.currentProblems && "border-status-orange focus-visible:ring-status-orange")}
              />
              {errors.currentProblems && (
                <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.currentProblems.message}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-border border-dashed" />

          {/* ============================================================== */}
          {/* --- ส่วนที่ 4: ข้อมูลทรัพยากรที่มีอยู่ (Manpower & Equipment) --- */}
          {/* ============================================================== */}

          <div>
            <div className="mb-6">
              <h4 className="text-base font-bold text-foreground">คอมพิวเตอร์และอุปกรณ์ที่มีอยู่ในปัจจุบันของส่วนราชการ</h4>
              <p className="text-sm text-slate-gray">(เฉพาะกรณีโครงการที่มีการจัดหาครุภัณฑ์) (ให้ระบุรายการอุปกรณ์ของส่วนราชการที่มีอยู่ในปัจจุบัน สถานที่ติดตั้งของระบบ ส่วนที่รับผิดชอบ)</p>
            </div>

            {/* --- 4.1 ตารางแสดงอัตรากำลัง --- */}
            <div className="mb-10">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <Label className="text-sm font-bold text-foreground">1. ตารางแสดงอัตรากำลังของหน่วยงาน / ส่วนราชการ</Label>
                <Button
                  type="button" variant="soft" size="sm" className="rounded-full gap-2"
                  onClick={() => appendManpower({ agencyPart: "", positionLimit: 0, occupied: 0, vacant: 0 })}
                >
                  <Plus className="w-4 h-4" /> เพิ่มอัตรากำลัง
                </Button>
              </div>

              <div className="space-y-3">
                {manpowerFields.length === 0 ? (
                  <div className="p-4 text-center border-2 border-dashed border-border rounded-sm text-slate-gray text-sm">
                    ไม่มีข้อมูลอัตรากำลัง (กดเพิ่มถ้าต้องการระบุ)
                  </div>
                ) : (
                  manpowerFields.map((field, index) => {
                    const rowErr = manpowerErrors[index] || {};
                    return (
                      <div key={field.id} className="flex flex-wrap md:flex-nowrap gap-3 p-4 bg-surface-container-low rounded-xl items-end relative group">
                        <div className="w-full md:w-2/5">
                          <Label className="text-xs text-slate-gray mb-1.5 block">ส่วนราชการ <span className="text-status-orange">*</span></Label>
                          <Input
                            {...register(`manpower.${index}.agencyPart`)}
                            placeholder="ระบุส่วนราชการ"
                            className={cn("bg-surface", rowErr.agencyPart && "border-status-orange bg-orange-50/50")}
                          />
                        </div>
                        <div className="w-full md:flex-1">
                          <Label className="text-xs text-slate-gray mb-1.5 block">อัตราตำแหน่ง</Label>
                          <Input type="number" {...register(`manpower.${index}.positionLimit`, { valueAsNumber: true })} placeholder="0" className="bg-surface" />
                        </div>
                        <div className="w-full md:flex-1">
                          <Label className="text-xs text-slate-gray mb-1.5 block">อัตราครอง</Label>
                          <Input type="number" {...register(`manpower.${index}.occupied`, { valueAsNumber: true })} placeholder="0" className="bg-surface" />
                        </div>
                        <div className="w-full md:flex-1">
                          <Label className="text-xs text-slate-gray mb-1.5 block">อัตราว่าง</Label>
                          <Input type="number" {...register(`manpower.${index}.vacant`, { valueAsNumber: true })} placeholder="0" className="bg-surface" />
                        </div>
                        <div className="w-full md:w-auto">
                          <Button
                            type="button" variant="destructive" size="icon" className="w-full md:w-10 rounded-md"
                            onClick={() => removeManpower(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* --- 4.2 ตารางแสดงครุภัณฑ์คอมพิวเตอร์ --- */}
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                <Label className="text-sm font-bold text-foreground">2. ตารางแสดงครุภัณฑ์คอมพิวเตอร์ที่มีอยู่</Label>
                <Button
                  type="button" variant="soft" size="sm" className="rounded-full gap-2"
                  onClick={() => appendEquipment({ itemName: "", ageYears: 0, quantity: 0, user: "", location: "", remark: "" })}
                >
                  <Plus className="w-4 h-4" /> เพิ่มครุภัณฑ์
                </Button>
              </div>

              <div className="space-y-4">
                {equipmentFields.length === 0 ? (
                  <div className="p-4 text-center border-2 border-dashed border-border rounded-sm text-slate-gray text-sm">
                    ไม่มีข้อมูลครุภัณฑ์ (กดเพิ่มถ้าต้องการระบุ)
                  </div>
                ) : (
                  equipmentFields.map((field, index) => {
                    const rowErr = equipmentErrors[index] || {};
                    return (
                      <div key={field.id} className="relative p-5 bg-surface-container-low border-none rounded-[24px] shadow-sm group">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/50">
                          <h4 className="font-bold text-xs text-foreground">ครุภัณฑ์ที่ {index + 1}</h4>
                          <Button
                            type="button" variant="ghost" size="icon-sm" className="text-status-orange hover:bg-error-container hover:text-error rounded-full"
                            onClick={() => removeEquipment(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-12">
                            <Label className="text-xs text-slate-gray mb-1.5 block">รายการครุภัณฑ์ <span className="text-status-orange">*</span></Label>
                            <Textarea
                              {...register(`existingEquipment.${index}.itemName`)}
                              placeholder="ระบุรายการครุภัณฑ์..."
                              rows={2}
                              className={cn("resize-none bg-surface", rowErr.itemName && "border-status-orange bg-orange-50/50")}
                            />
                          </div>
                          <div className="md:col-span-3">
                            <Label className="text-xs text-slate-gray mb-1.5 block">อายุการใช้งาน (ปี)</Label>
                            <Input type="number" {...register(`existingEquipment.${index}.ageYears`, { valueAsNumber: true })} placeholder="0" className="bg-surface" />
                          </div>
                          <div className="md:col-span-3">
                            <Label className="text-xs text-slate-gray mb-1.5 block">จำนวน (เครื่อง)</Label>
                            <Input type="number" {...register(`existingEquipment.${index}.quantity`, { valueAsNumber: true })} placeholder="0" className="bg-surface" />
                          </div>
                          <div className="md:col-span-6">
                            <Label className="text-xs text-slate-gray mb-1.5 block">ผู้ใช้งาน <span className="text-status-orange">*</span></Label>
                            <Input
                              {...register(`existingEquipment.${index}.user`)}
                              placeholder="ระบุผู้ใช้งาน"
                              className={cn("bg-surface", rowErr.user && "border-status-orange bg-orange-50/50")}
                            />
                          </div>
                          <div className="md:col-span-6">
                            <Label className="text-xs text-slate-gray mb-1.5 block">สถานที่ตั้ง <span className="text-status-orange">*</span></Label>
                            <Input
                              {...register(`existingEquipment.${index}.location`)}
                              placeholder="ระบุสถานที่ตั้ง"
                              className={cn("bg-surface", rowErr.location && "border-status-orange bg-orange-50/50")}
                            />
                          </div>
                          <div className="md:col-span-6">
                            <Label className="text-xs text-slate-gray mb-1.5 block">หมายเหตุ</Label>
                            <Input {...register(`existingEquipment.${index}.remark`)} placeholder="หมายเหตุ (ถ้ามี)" className="bg-surface" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
