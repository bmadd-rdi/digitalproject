// src/features/projects/components/ProjectStep1.tsx
import { useEffect } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { ProposalStep1Values } from "../types";
import type { ProjectDetail } from "@/features/projects/types/workspace";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ProposalStep1ContextValues = Pick<
  ProposalStep1Values,
  "projectName" | "agencyName" | "projectManager"
>;

export function getProposalStep1ContextValues(project: ProjectDetail): ProposalStep1ContextValues {
  const agencyName = [project.division?.departmentName, project.division?.name]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" - ");
  const projectManager = project.owner
    ? `${project.owner.firstName} ${project.owner.lastName}`.trim()
    : "";

  return {
    projectName: project.projectName?.trim() ?? "",
    agencyName,
    projectManager,
  };
}

interface ProposalStep1Props {
  project?: ProjectDetail | null;
}

const readOnlyContextClass = "mt-1.5 cursor-not-allowed bg-slate-100 text-slate-500";

export const ProposalStep1 = ({ project }: ProposalStep1Props) => {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<ProposalStep1Values>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "budgetsByYear",
  });

  const watchedBudgets = watch("budgetsByYear") || [];
  const calculatedTotal = watchedBudgets.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

  useEffect(() => {
    if (!project) return;

    const contextValues = getProposalStep1ContextValues(project);
    setValue("projectName", contextValues.projectName, { shouldDirty: false, shouldValidate: false });
    setValue("agencyName", contextValues.agencyName, { shouldDirty: false, shouldValidate: false });
    setValue("projectManager", contextValues.projectManager, { shouldDirty: false, shouldValidate: false });
  }, [project, setValue]);

  // คอยส่งค่าผลรวมกลับเข้าไปอัปเดตในระบบฟอร์มเบื้องหลัง เพื่อให้ Zod เอาไป Validate ได้ตามปกติ
  useEffect(() => {
    setValue("totalBudget", calculatedTotal, { shouldValidate: true });
  }, [calculatedTotal, setValue]);

  // ตัวแปรช่วยดึง Error ของตาราง (ป้องกัน TypeScript บ่นตอน map)
  const budgetErrors = (errors.budgetsByYear ?? []) as Array<{
    year?: { message?: string };
    amount?: { message?: string };
  }>;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0">

      {/* --- ส่วนที่ 1: ข้อมูลโครงการ (Project Info) --- */}
      <div>
        <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2 mb-8">1. ข้อมูลทั่วไป</h2>
        <div className="w-full">
          <Label htmlFor="projectName" className="text-sm font-medium text-foreground">
            ชื่อโครงการ <span className="text-status-orange">*</span>
          </Label>
          <Input
            id="projectName"
            {...register("projectName")}
            placeholder="ระบุชื่อโครงการ"
            readOnly
            tabIndex={-1}
            onMouseDown={(event) => event.preventDefault()}
            aria-readonly="true"
            className={readOnlyContextClass}
          />
        </div>
      </div>

      {/* --- ส่วนที่ 2: ส่วนราชการ (Agency Group) --- */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">ส่วนราชการที่รับผิดชอบ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <Label htmlFor="agencyName" className="text-sm font-medium text-foreground">
              ชื่อหน่วยงาน <span className="text-status-orange">*</span>
            </Label>
            <Input
              id="agencyName"
              {...register("agencyName")}
              readOnly
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              aria-readonly="true"
              className={readOnlyContextClass}
            />
          </div>
          <div>
            <Label htmlFor="headOfAgency" className="text-sm font-medium text-foreground">
              หัวหน้าส่วนราชการ <span className="text-status-orange">*</span>
            </Label>
            <Input
              id="headOfAgency"
              {...register("headOfAgency")}
              className={cn("mt-1.5", errors.headOfAgency && "border-status-orange focus-visible:ring-status-orange")}
              placeholder="ex. นายสมชาย ใจดี"
            />
            {errors.headOfAgency && (
              <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.headOfAgency.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="dcioName" className="text-sm font-medium text-foreground">
              ผู้บริหารเทคโนโลยีสารสนเทศระดับสูง (DCIO) <span className="text-status-orange">*</span>
            </Label>
            <Input
              id="dcioName"
              {...register("dcioName")}
              className={cn("mt-1.5", errors.dcioName && "border-status-orange focus-visible:ring-status-orange")}
              placeholder="ex. นายสมชาย ใจดี"
            />
            {errors.dcioName && (
              <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.dcioName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="projectManager" className="text-sm font-medium text-foreground">
              ผู้รับผิดชอบโครงการ <span className="text-status-orange">*</span>
            </Label>
            <Input
              id="projectManager"
              {...register("projectManager")}
              readOnly
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              aria-readonly="true"
              className={readOnlyContextClass}
              placeholder="ex. นายสมชาย ใจดี"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* --- ส่วนที่ 3: งบประมาณรายปี (Budget) --- */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <h3 className="text-lg font-bold text-foreground">งบประมาณรายปี</h3>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => append({ year: 0, amount: 0, budgetType: "งบประมาณรายจ่ายประจำปี" })}
            className="rounded-full gap-2 pl-2.5"
          >
            <Plus className="w-4 h-4" /> เพิ่มปีงบประมาณ
          </Button>
        </div>

        {/* รายการงบประมาณ */}
        <div className="space-y-2.5">
          {fields.map((field, index) => {
            const rowErr = budgetErrors[index] || {}; // ดึง Error แต่ละแถว

            return (
              <div key={field.id} className="flex flex-wrap sm:flex-nowrap gap-3 items-start bg-surface p-4 rounded-lg border border-border shadow-sm">
                <div className="w-full sm:w-1/4">
                  <Label className="text-xs text-slate-gray mb-1 block">ปี พ.ศ. <span className="text-status-orange">*</span></Label>
                  <Input
                    type="number"
                    {...register(`budgetsByYear.${index}.year`, { valueAsNumber: true })}
                    placeholder="เช่น 2567"
                    // เปลี่ยนขอบแดงถ้าลืมกรอก หรือกรอกปีผิด
                    className={cn(rowErr.year && "border-status-orange bg-orange-50/50 focus-visible:ring-status-orange")}
                  />
                  {rowErr.year && <span className="text-[10px] text-status-orange mt-1 block">{rowErr.year.message}</span>}
                </div>
                <div className="w-full sm:flex-1">
                  <Label className="text-xs text-slate-gray mb-1 block">จำนวนเงิน (บาท) <span className="text-status-orange">*</span></Label>
                  <Input
                    type="number"
                    {...register(`budgetsByYear.${index}.amount`, { valueAsNumber: true })}
                    placeholder="0.00"
                    // เปลี่ยนขอบแดงถ้าลืมกรอกจำนวนเงิน
                    className={cn(rowErr.amount && "border-status-orange bg-orange-50/50 focus-visible:ring-status-orange")}
                  />
                  {rowErr.amount && <span className="text-[10px] text-status-orange mt-1 block">{rowErr.amount.message}</span>}
                </div>

                <div className="w-full sm:flex-1">
                  <Label className="text-xs text-slate-gray mb-1 block">ประเภทงบประมาณ</Label>
                  <Controller
                    control={control}
                    name={`budgetsByYear.${index}.budgetType`}
                    render={({ field: { onChange, value } }) => (
                      <Select onValueChange={onChange} value={value || "งบประมาณรายจ่ายประจำปี"}>
                        <SelectTrigger className="w-full h-10 bg-background border-input focus:ring-primary-light focus:border-primary-container">
                          <SelectValue placeholder="เลือกประเภทงบประมาณ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="งบประมาณรายจ่ายประจำปี">งบประมาณรายจ่ายประจำปี</SelectItem>
                          <SelectItem value="งบกลาง">งบกลาง</SelectItem>
                          <SelectItem value="งบประมาณรายจ่ายประจำปี(เพิ่มเติม)">งบประมาณรายจ่ายประจำปี(เพิ่มเติม)</SelectItem>
                          <SelectItem value="งบแปรญัตติ">งบแปรญัตติ</SelectItem>
                          <SelectItem value="เงินนอกงบประมาณ">เงินนอกงบประมาณ</SelectItem>
                          <SelectItem value="งบประมาณแผ่นดิน">งบประมาณแผ่นดิน</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="w-full my-auto md:ml-6 sm:w-auto flex flex-col items-center justify-center pt-5">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="w-full sm:w-10 rounded-md h-10"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ส่วนสรุปรวมงบประมาณที่ปรับปรุงใหม่ (Read-only + จัดฟอร์แมตข้อความแบบใหม่) */}
        <div className={`mt-6 p-5 rounded-md border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors duration-300
          ${errors.totalBudget ? 'bg-orange-50/50 border-status-orange' : 'bg-primary-container/20 border-primary/20'}
        `}>
          <div className="text-md font-bold text-foreground">
            รวมวงเงินงบประมาณทั้งโครงการ เป็นจำนวน{" "}
            <span className="text-2xl font-black text-primary mx-1">
              {calculatedTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>{" "}
            บาท
          </div>

          {errors.totalBudget && (
            <div className="text-status-orange text-sm font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.totalBudget.message}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
