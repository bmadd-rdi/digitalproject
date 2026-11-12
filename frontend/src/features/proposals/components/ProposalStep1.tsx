// src/features/projects/components/ProjectStep1.tsx
import { useEffect } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { ProposalStep1Values } from "../types";
import { useDepartments, useDivisions } from "@/features/lookups/hooks/useLookups";
import { LookupCombobox } from "./LookupCombobox";
import type { ProjectDetail } from "@/features/projects/types/workspace";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ค่าที่ระบบบังคับใส่จากข้อมูลโครงการ (แก้ไม่ได้ในฟอร์ม) มีเฉพาะชื่อโครงการ
// ผู้รับผิดชอบโครงการ (projectManager) ผู้ใช้กรอกเองได้ จึงต้องไม่ถูกเขียนทับที่นี่
export type ProposalStep1ContextValues = Pick<ProposalStep1Values, "projectName">;

export function getProposalStep1ContextValues(project: ProjectDetail): ProposalStep1ContextValues {
  return {
    projectName: project.projectName?.trim() ?? "",
  };
}

// ค่าเริ่มต้นของ "ผู้รับผิดชอบโครงการ" ใช้เฉพาะตอนที่แบบร่างยังไม่มีค่านี้
export function getDefaultProjectManager(project: ProjectDetail): string {
  return project.owner
    ? `${project.owner.firstName} ${project.owner.lastName}`.trim()
    : "";
}

interface ProposalStep1Props {
  project?: ProjectDetail | null;
}

const readOnlyContextClass = "mt-1.5 cursor-not-allowed bg-slate-100 text-slate-500";

export const ProposalStep1 = ({ project }: ProposalStep1Props) => {
  const { register, control, watch, setValue, clearErrors, formState: { errors } } = useFormContext<ProposalStep1Values>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "budgetsByYear",
  });

  // โหมดชื่อโครงการในส่วนประวัติการนำเสนอ (ส่วนที่ 4) — เป็น state ของหน้าจอเท่านั้น ยังไม่ถูกบันทึก

  const selectedDepartmentId = Number(watch("departmentId")) || 0;
  const { data: deptsRes } = useDepartments();
  const { data: divsRes } = useDivisions(selectedDepartmentId);
  const departments = deptsRes?.data ?? [];
  const divisions = divsRes?.data ?? [];

  const updateAgencyName = (departmentName?: string, divisionName?: string) => {
    const name = [departmentName, divisionName].filter(Boolean).join(" - ");
    setValue("agencyName", name, { shouldDirty: true, shouldValidate: true });
  };

  const watchedBudgets = watch("budgetsByYear") || [];
  const calculatedTotal = watchedBudgets.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

  useEffect(() => {
    if (!project) return;

    const contextValues = getProposalStep1ContextValues(project);
    setValue("projectName", contextValues.projectName, { shouldDirty: false, shouldValidate: false });
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
        <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2 mb-8">ก. ข้อมูลทั่วไป</h2>
        <div className="w-full">
          <h3 className="text-lg font-bold text-foreground mb-4">
            1. ชื่อโครงการ <span className="text-status-orange"></span>
          </h3>
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
        <h3 className="text-lg font-bold text-foreground mb-4">2. ส่วนราชการที่รับผิดชอบ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
          <div>
            <Label htmlFor="agencyName" className="text-sm font-medium text-foreground">
              2.1 ชื่อหน่วยงาน <span className="text-status-orange"></span>
            </Label>
            <div className="mt-1.5">
              <Controller
                control={control}
                name="departmentId"
                render={({ field }) => (
                  <LookupCombobox
                    options={departments}
                    value={Number(field.value) || 0}
                    onChange={(id) => {
                      field.onChange(id);
                      setValue("divisionId", 0, { shouldDirty: true, shouldValidate: true });
                      updateAgencyName(undefined, undefined);
                    }}
                    placeholder="ค้นหาหรือเลือกหน่วยงาน..."
                    error={!!errors.departmentId}
                  />
                )}
              />
            </div>
            {errors.departmentId && (
              <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.departmentId.message}
              </p>
            )}
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground">
              ส่วนราชการ <span className="text-status-orange">*</span>
            </Label>
            <div className="mt-1.5">
              <Controller
                control={control}
                name="divisionId"
                render={({ field }) => (
                  <LookupCombobox
                    options={divisions}
                    value={Number(field.value) || 0}
                    onChange={(id) => {
                      field.onChange(id);
                      const department = departments.find((item) => item.id === selectedDepartmentId);
                      const division = divisions.find((item) => item.id === id);
                      updateAgencyName(department?.name, division?.name);
                    }}
                    placeholder={selectedDepartmentId ? "ค้นหาหรือเลือกส่วนราชการ..." : "กรุณาเลือกหน่วยงานก่อน"}
                    error={!!errors.divisionId}
                    disabled={!selectedDepartmentId}
                  />
                )}
              />
            </div>
            {errors.divisionId && (
              <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.divisionId.message}
              </p>
            )}
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
              className={cn("mt-1.5", errors.projectManager && "border-status-orange focus-visible:ring-status-orange")}
              placeholder="ex. นายสมชาย ใจดี"
            />
            {errors.projectManager && (
              <p className="mt-1 text-sm text-status-orange flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.projectManager.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* --- ส่วนที่ 3: งบประมาณรายปี (Budget) --- */}
      <div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
          <h3 className="text-lg font-bold text-foreground">3. งบประมาณรายปี</h3>
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

      <div className="border-t border-border" />
      {/* --- ส่วนที่ 4: ประวัติการนำเสนอโครงการเข้ารับการพิจารณาของคณะกรรมการดิจิทัลกรุงเทพมหานคร --- */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-4">4. ประวัติการนำเสนอโครงการเข้ารับการพิจารณาของคณะกรรมการดิจิทัลกรุงเทพมหานคร</h3>
        <div className="w-full mb-4 gap-4 p-3">
          <Controller
            control={control}
            name="projectEverPassed"
            render={({ field: { onChange, value } }) => (
              <RadioGroup
                className="flex flex-col sm:flex-row gap-4"
                value={value ?? "NEVER"}
                onValueChange={(v) => {
                  onChange(v);
                  // เลือก "ไม่เคย" -> ล้างรายละเอียดประวัติเพื่อไม่ให้ค่าเก่าค้าง
                  if (v === "NEVER") {
                    setValue("prevYear", "", { shouldDirty: true });
                    setValue("prevProjectNameMode", "SAME", { shouldDirty: true });
                    setValue("prevProject", "", { shouldDirty: true });
                    setValue("prevResolution", "", { shouldDirty: true });
                    clearErrors(["prevYear", "prevProject", "prevResolution"]);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="NEVER" id="project-ever-never" />
                  <Label htmlFor="project-ever-never">ไม่เคยผ่านการพิจารณา</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="EVER" id="project-ever-ever" />
                  <Label htmlFor="project-ever-ever">เคยผ่านการพิจารณา</Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        {/* แสดงรายการประวัติเฉพาะเมื่อเลือก "เคยผ่านการพิจารณา" */}
        {watch("projectEverPassed") === "EVER" && (
          <div className="space-y-2.5 animate-in fade-in duration-300 mt-4 rounded-lg border border-border shadow-sm">
            <div>{/* สร้างแถว  */}
              {/* แถวแรก  */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-4"> {/* สร้างคอลัมธ์  */}
                <div>
                  <Label htmlFor="historyYear" className="text-sm font-medium text-foreground">
                    ปี พ.ศ. <span className="text-status-orange">*</span>
                  </Label>
                  <Input
                    id="historyYear"
                    type="number"
                    placeholder="เช่น 2567"
                    className={cn("mt-1.5", errors.prevYear && "border-status-orange focus-visible:ring-status-orange")}
                    {...register("prevYear")}
                  />
                  {errors.prevYear && (
                    <p className="text-sm text-status-orange mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.prevYear.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-foreground block mb-1">
                    ชื่อโครงการ <span className="text-status-orange">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="prevProjectNameMode"
                    render={({ field: { onChange, value } }) => (
                      <RadioGroup
                        className="flex flex-col sm:flex-row gap-4"
                        value={value ?? "SAME"}
                        onValueChange={(v) => {
                          onChange(v);
                          if (v === "SAME") {
                            setValue("prevProject", "", { shouldDirty: true });
                            clearErrors("prevProject");
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="SAME" id="history-same" />
                          <Label htmlFor="history-same">เหมือนกับที่เสนอ</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="DIFFERENT" id="history-diff" />
                          <Label htmlFor="history-diff">ไม่เหมือนกับที่เสนอ</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
              </div>
              {/* แถวสอง  */}
              {watch("prevProjectNameMode") === "DIFFERENT" && (
                <div className="grid gap-x-6 p-4">
                  <Label htmlFor="historyProjectName" className="text-sm font-medium text-foreground">
                    ชื่อโครงการที่เคยเสนอ
                  </Label>
                  <Input
                    id="historyProjectName"
                    placeholder="ชื่อโครงการที่เคยเสนอ"
                    className={cn("mt-1.5", errors.prevProject && "border-status-orange focus-visible:ring-status-orange")}
                    {...register("prevProject")}
                  />
                  {errors.prevProject && (
                    <p className="text-sm text-status-orange mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.prevProject.message}
                    </p>
                  )}
                </div>
              )}
              {/* แถวสาม  */}
              <div className="grid gap-x-6 p-4">
                <Label className="text-sm font-medium text-foreground block mb-1">
                  มติที่ประชุม <span className="text-status-orange">*</span>
                </Label>
                <div>
                  <Controller
                    control={control}
                    name="prevResolution"
                    render={({ field: { onChange, value } }) => (
                      <RadioGroup
                        className="flex flex-col sm:flex-row gap-4"
                        value={value ?? ""}
                        onValueChange={onChange}
                      >
                        {[
                          { value: "APPROVED", label: "เห็นชอบในหลักการ" },
                          { value: "APPROVED_WITH_CONDITIONS", label: "เห็นชอบแบบมีเงื่อนไข" },
                          { value: "UNDER_REVIEW", label: "ทบทวน" },
                          { value: "NOT_APPROVED", label: "ไม่เห็นชอบในหลักการ" },
                          { value: "RETURNED", label: "คืนเรื่องหรือไม่เป็นไปตามหลักเกณฑ์" },
                        ].map((opt) => (
                          <div key={opt.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={opt.value} id={`history-resolution-${opt.value}`} />
                            <Label htmlFor={`history-resolution-${opt.value}`}>{opt.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  />
                  {errors.prevResolution && (
                    <p className="text-sm text-status-orange mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.prevResolution.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
