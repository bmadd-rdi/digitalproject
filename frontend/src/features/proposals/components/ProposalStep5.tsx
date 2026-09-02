// src/features/projects/components/ProjectStep5.tsx
"use client";

import {
  useFormContext,
  useFieldArray,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormWatch,
} from "react-hook-form";
import { ProposalStep5Values } from "../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus, AlertCircle, Calculator } from "lucide-react";
import { ProposalExportButton } from "./ProposalExportButton";

// ---------------------------------------------------------------------------
// Sub-Component: สำหรับจัดการตาราง VM ภายในแต่ละระบบงาน
// ---------------------------------------------------------------------------
type CloudSystemItemProps = {
  nestIndex: number;
  control: Control<ProposalStep5Values>;
  register: UseFormRegister<ProposalStep5Values>;
  errors: FieldErrors<ProposalStep5Values>;
  watch: UseFormWatch<ProposalStep5Values>;
  removeSystem: (index: number) => void;
};

const CloudSystemItem = ({ nestIndex, control, register, errors, watch, removeSystem }: CloudSystemItemProps) => {
  const { fields: vmFields, append: appendVm, remove: removeVm } = useFieldArray({
    control,
    name: `cloudRequests.${nestIndex}.vms`,
  });

  const vms = watch(`cloudRequests.${nestIndex}.vms`) || [];

  // คำนวณผลรวมรายกลุ่ม (Group Total)
  const groupTotal = vms.reduce(
    (acc, vm) => ({
      vcpu: acc.vcpu + (Number(vm.vcpu) || 0),
      ramGb: acc.ramGb + (Number(vm.ramGb) || 0),
      gpuGb: acc.gpuGb + (Number(vm.gpuGb) || 0),
      storageGb: acc.storageGb + (Number(vm.storageGb) || 0),
      price: acc.price + (Number(vm.price) || 0),
    }),
    { vcpu: 0, ramGb: 0, gpuGb: 0, storageGb: 0, price: 0 }
  );

  return (
    <div className="border border-border p-5 rounded-lg bg-surface-container-lowest shadow-sm">
      
      {/* ส่วน Header ของกล่อง (แสดงลำดับ และ ปุ่มลบ) */}
      <div className="flex justify-between items-center mb-5 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
            {nestIndex + 1}
          </div>
          <h4 className="font-bold text-foreground text-lg">
            รายละเอียดระบบงานที่ {nestIndex + 1}
          </h4>
        </div>
        
        <Button 
          type="button" 
          onClick={() => removeSystem(nestIndex)} 
          variant="ghost" 
          size="sm" 
          className="text-status-orange hover:bg-red-100 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4 mr-2" /> ลบระบบงานที่ {nestIndex + 1}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <Label className="mb-2 block">ชื่อโครงการ/ระบบงาน <span className="text-status-orange">*</span></Label>
          <Input 
            {...register(`cloudRequests.${nestIndex}.systemName`)} 
            placeholder="เช่น ระบบจัดการเอกสารอิเล็กทรอนิกส์" 
            className={errors?.cloudRequests?.[nestIndex]?.systemName ? 'border-status-orange' : ''}
          />
          {errors?.cloudRequests?.[nestIndex]?.systemName && <p className="text-status-orange text-xs mt-1">{errors.cloudRequests[nestIndex].systemName.message}</p>}
        </div>
        <div>
          <Label className="mb-2 block">วันที่ต้องการขอใช้บริการ <span className="text-status-orange">*</span></Label>
          <Input 
            type="date" 
            {...register(`cloudRequests.${nestIndex}.requestedServiceDate`)} 
            className={errors?.cloudRequests?.[nestIndex]?.requestedServiceDate ? 'border-status-orange' : ''}
          />
          {errors?.cloudRequests?.[nestIndex]?.requestedServiceDate && <p className="text-status-orange text-xs mt-1">{errors.cloudRequests[nestIndex].requestedServiceDate.message}</p>}
        </div>
        <div>
          <Label className="mb-2 block">วันที่บันทึกคำขอ <span className="text-status-orange">*</span></Label>
          <Input 
            type="date" 
            {...register(`cloudRequests.${nestIndex}.recordedRequestDate`)} 
            className={errors?.cloudRequests?.[nestIndex]?.recordedRequestDate ? 'border-status-orange' : ''}
          />
          {errors?.cloudRequests?.[nestIndex]?.recordedRequestDate && <p className="text-status-orange text-xs mt-1">{errors.cloudRequests[nestIndex].recordedRequestDate.message}</p>}
        </div>
      </div>

      <div className="mb-2 flex justify-between items-center mt-8">
        <Label className="font-semibold text-foreground">รายละเอียด VM (Virtual Machine)</Label>
        <Button 
          type="button" 
          onClick={() => appendVm({ vmDescription: "", osDatabase: "", vcpu: 0, ramGb: 0, gpuGb: 0, storageGb: 0, price: 0 })} 
          size="sm" 
          variant="outline" 
          className="gap-2"
        >
          <Plus className="w-3 h-3" /> เพิ่ม VM ในระบบงานนี้
        </Button>
      </div>

      <div className="overflow-x-auto border border-border rounded-md">
        <table className="w-full text-left min-w-225 text-sm">
          <thead className="bg-surface-container-low text-slate-gray">
            <tr>
              <th className="p-3 w-12 text-center">ลำดับ</th>
              <th className="p-3">รายละเอียด/หน้าที่ VM</th>
              <th className="p-3 w-48">OS / Database</th>
              <th className="p-3 w-20 text-center">vCPU</th>
              <th className="p-3 w-20 text-center">RAM (GB)</th>
              <th className="p-3 w-20 text-center">GPU (GB)</th>
              <th className="p-3 w-24 text-center">Storage (GB)</th>
              <th className="p-3 w-32 text-center">ราคา (บาท)</th>
              <th className="p-3 w-12 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {vmFields.length === 0 && (
              <tr><td colSpan={9} className="p-6 text-center text-muted-foreground">ยังไม่มีรายการ VM</td></tr>
            )}
            {vmFields.map((vm, index) => {
              const vmErrors = errors?.cloudRequests?.[nestIndex]?.vms?.[index] || {};
              return (
                <tr key={vm.id} className="border-t border-surface-variant">
                  <td className="p-2 text-center text-muted-foreground">{index + 1}</td>
                  <td className="p-2"><Input {...register(`cloudRequests.${nestIndex}.vms.${index}.vmDescription`)} className={vmErrors.vmDescription ? 'border-status-orange' : ''} placeholder="เช่น Web Server" /></td>
                  <td className="p-2"><Input {...register(`cloudRequests.${nestIndex}.vms.${index}.osDatabase`)} className={vmErrors.osDatabase ? 'border-status-orange' : ''} placeholder="เช่น Ubuntu 24.04" /></td>
                  <td className="p-2"><Input type="number" {...register(`cloudRequests.${nestIndex}.vms.${index}.vcpu`, { valueAsNumber: true })} className={`text-center ${vmErrors.vcpu ? 'border-status-orange' : ''}`} /></td>
                  <td className="p-2"><Input type="number" {...register(`cloudRequests.${nestIndex}.vms.${index}.ramGb`, { valueAsNumber: true })} className={`text-center ${vmErrors.ramGb ? 'border-status-orange' : ''}`} /></td>
                  <td className="p-2"><Input type="number" {...register(`cloudRequests.${nestIndex}.vms.${index}.gpuGb`, { valueAsNumber: true })} className={`text-center ${vmErrors.gpuGb ? 'border-status-orange' : ''}`} /></td>
                  <td className="p-2"><Input type="number" {...register(`cloudRequests.${nestIndex}.vms.${index}.storageGb`, { valueAsNumber: true })} className={`text-center ${vmErrors.storageGb ? 'border-status-orange' : ''}`} /></td>
                  <td className="p-2"><Input type="number" {...register(`cloudRequests.${nestIndex}.vms.${index}.price`, { valueAsNumber: true })} className={`text-right ${vmErrors.price ? 'border-status-orange' : ''}`} /></td>
                  <td className="p-2 text-center">
                    <Button type="button" onClick={() => removeVm(index)} variant="ghost" size="icon" className="text-status-orange hover:bg-red-100 rounded-full"><Trash2 className="w-4 h-4" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* แถวสรุปผลรวมรายกลุ่ม (ถ้ามีข้อมูล) */}
          {vmFields.length > 0 && (
            <tfoot className="bg-surface-variant/50 font-semibold text-foreground">
              <tr>
                <td colSpan={3} className="p-3 text-right">รวมระบบงานที่ {nestIndex + 1}:</td>
                <td className="p-3 text-center text-primary-dark">{groupTotal.vcpu}</td>
                <td className="p-3 text-center text-primary-dark">{groupTotal.ramGb}</td>
                <td className="p-3 text-center text-primary-dark">{groupTotal.gpuGb}</td>
                <td className="p-3 text-center text-primary-dark">{groupTotal.storageGb}</td>
                <td className="p-3 text-right text-primary-dark">{groupTotal.price.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export const ProposalStep5 = () => {
  const { register, control, setValue, watch, getValues, formState: { errors } } = useFormContext<ProposalStep5Values>();

  const { fields: personnelFields, append: appendPersonnel, remove: removePersonnel } = useFieldArray({
    control,
    name: "ictPersonnel",
  });

  const { fields: cloudFields, append: appendCloud, remove: removeCloud } = useFieldArray({
    control,
    name: "cloudRequests",
  });

  const watchedDurationDays = watch("durationDays");
  const isOverLimit = watchedDurationDays > 270;
  
  const watchedCloudRequests = watch("cloudRequests") || [];

  // คำนวณผลรวมทั้งหมด (Grand Total)
  const grandTotal = watchedCloudRequests.reduce((acc, req) => {
    const reqVms = req.vms || [];
    reqVms.forEach((vm) => {
      acc.vcpu += Number(vm.vcpu) || 0;
      acc.ramGb += Number(vm.ramGb) || 0;
      acc.gpuGb += Number(vm.gpuGb) || 0;
      acc.storageGb += Number(vm.storageGb) || 0;
      acc.price += Number(vm.price) || 0;
    });
    return acc;
  }, { vcpu: 0, ramGb: 0, gpuGb: 0, storageGb: 0, price: 0 });

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full min-w-0 pb-10">
      
      <div>
        <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">5. ความพร้อมและประโยชน์ที่คาดว่าจะได้รับ</h2>
      </div>

      {/* --- 1. ระยะเวลาดำเนินงาน --- */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <Label className="text-lg font-bold text-foreground block mb-2">1. ระยะเวลาดำเนินงาน <span className="text-status-orange">*</span></Label>
        <p className="text-sm text-muted-foreground mb-4">
          (โครงการปีเดียว งบประมาณรายจ่ายประจำปี หรืองบกลาง ระยะเวลาไม่เกิน 270 วัน)
        </p>
        
        <div className="flex items-center gap-3">
          <div className="w-32">
            <Input 
              type="number" 
              {...register("durationDays", { valueAsNumber: true })} 
              className={`bg-surface text-center ${errors.durationDays ? 'border-status-orange' : ''}`}
              placeholder="เช่น 180" 
            />
          </div>
          <span className="text-md font-medium text-foreground">วัน</span>
        </div>
        {errors.durationDays && <p className="text-status-orange text-sm mt-2">{errors.durationDays.message}</p>}
        {isOverLimit && (
          <div className="flex items-center gap-2 text-yellow-700 mt-4 text-sm bg-yellow-50 p-3 rounded-md border border-yellow-200 animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span><strong>หมายเหตุ:</strong> ระยะเวลาที่ระบุเกินกว่า 270 วัน โปรดตรวจสอบความถูกต้องของประเภทโครงการอีกครั้ง</span>
          </div>
        )}
      </div>

      {/* --- 2. ความพร้อมของหน่วยงาน --- */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <Label className="text-lg font-bold text-foreground block mb-4">2. ความพร้อมของหน่วยงาน</Label>

        {/* 2.1 ตารางบุคลากร ICT */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <Label className="text-md font-medium text-foreground">บุคลากร ICT ที่มีอยู่ในปัจจุบัน</Label>
            <Button type="button" onClick={() => appendPersonnel({ position: "", level: "", count: 0 })} size="sm" className="rounded-full gap-2">
              <Plus className="w-4 h-4"/> เพิ่มบุคลากร
            </Button>
          </div>
          
          <div className="overflow-x-auto border border-border rounded-md">
            <table className="w-full text-left min-w-150 text-sm">
              <thead className="bg-surface-container-low text-slate-gray">
                <tr>
                  <th className="p-3 w-16 text-center">ลำดับ</th>
                  <th className="p-3 w-[40%]">ตำแหน่ง</th>
                  <th className="p-3 w-[30%]">ระดับ</th>
                  <th className="p-3 w-32 text-center">จำนวน (คน)</th>
                  <th className="p-3 w-16 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody>
                {personnelFields.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">ไม่มีข้อมูลบุคลากร</td></tr>
                )}
                {personnelFields.map((field, index) => {
                  const rowErrors = errors?.ictPersonnel?.[index] || {};
                  return (
                    <tr key={field.id} className="border-t border-surface-variant">
                      <td className="p-2 text-center text-muted-foreground">{index + 1}</td>
                      <td className="p-2"><Input {...register(`ictPersonnel.${index}.position`)} className={`bg-surface ${rowErrors.position ? 'border-status-orange' : ''}`} placeholder="เช่น นักวิชาการคอมพิวเตอร์" /></td>
                      <td className="p-2"><Input {...register(`ictPersonnel.${index}.level`)} className={`bg-surface ${rowErrors.level ? 'border-status-orange' : ''}`} placeholder="เช่น ปฏิบัติการ" /></td>
                      <td className="p-2"><Input type="number" {...register(`ictPersonnel.${index}.count`, { valueAsNumber: true })} className={`bg-surface text-center ${rowErrors.count ? 'border-status-orange' : ''}`} /></td>
                      <td className="p-2 text-center"><Button type="button" onClick={() => removePersonnel(index)} variant="ghost" size="icon" className="text-status-orange hover:bg-red-100 hover:text-red-600 rounded-full"><Trash2 className="w-4 h-4" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2.2 ประเด็นความพร้อมด้านอื่นๆ */}
        <div>
          <Label className="text-md font-medium text-foreground block mb-2">ประเด็นความพร้อมด้านอื่น ๆ (ถ้ามี)</Label>
          <Textarea 
            {...register("otherReadiness")} 
            placeholder="อธิบายประเด็นความพร้อมด้านอื่นๆ..." 
            className="min-h-37.5 bg-surface resize-y" 
          />
        </div>
      </div>

      {/* --- 3. ประโยชน์ที่คาดว่าจะได้รับ (ขยับขึ้นมา) --- */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <Label className="text-lg font-bold text-foreground block mb-2">3. ประโยชน์ที่คาดว่าจะได้รับ <span className="text-status-orange">*</span></Label>
        <Textarea 
          {...register("expectedBenefits")} 
          placeholder="อธิบายประโยชน์ที่คาดว่าจะได้รับจากโครงการนี้อย่างชัดเจน..." 
          className={`min-h-50 bg-surface resize-y ${errors.expectedBenefits ? 'border-status-orange' : ''}`} 
        />
        {errors.expectedBenefits && <p className="text-status-orange text-sm mt-2">{errors.expectedBenefits.message}</p>}
      </div>

      {/* --- 4. โครงการนี้อยู่ใน Roadmap ของหน่วยงานหรือไม่ (ขยับขึ้นมา) --- */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm mb-4">
        <Label className="text-lg font-bold text-foreground block mb-4">4. โครงการนี้อยู่ใน Roadmap ของหน่วยงานหรือไม่ <span className="text-status-orange">*</span></Label>
        <RadioGroup 
          value={watch("isInRoadmap") !== undefined ? String(watch("isInRoadmap")) : undefined} 
          onValueChange={(val) => setValue("isInRoadmap", val === "true", { shouldValidate: true })}
          className="flex flex-col sm:flex-row gap-8 pl-2"
        >
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="true" id="roadmap-yes" className="w-5 h-5" />
            <Label htmlFor="roadmap-yes" className="text-md cursor-pointer">อยู่</Label>
          </div>
          <div className="flex items-center space-x-3">
            <RadioGroupItem value="false" id="roadmap-no" className="w-5 h-5" />
            <Label htmlFor="roadmap-no" className="text-md cursor-pointer">ไม่อยู่</Label>
          </div>
        </RadioGroup>
        {errors.isInRoadmap && <p className="text-status-orange text-sm mt-3">{errors.isInRoadmap.message}</p>}
      </div>

      {/* --- 5. คำขอใช้บริการ Cloud / ระบบงาน (ย้ายมาล่างสุด) --- */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
          <div>
            <Label className="text-lg font-bold text-foreground flex items-center gap-2">
              5. คำขอใช้บริการ Cloud / ระบบงาน
            </Label>
            <p className="text-sm text-muted-foreground mt-1">ระบุรายละเอียดระบบงานและ Virtual Machine (VM) ที่ต้องการขอรับบริการ</p>
          </div>
          <Button 
            type="button" 
            onClick={() => {
              const today = new Date().toISOString().slice(0, 10);
              appendCloud({ systemName: "", requestedServiceDate: today, recordedRequestDate: today, vms: [] });
            }}
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" /> เพิ่มระบบงานใหม่
          </Button>
        </div>

        {cloudFields.length === 0 ? (
          <div className="text-center p-10 border-2 border-dashed border-border rounded-xl text-muted-foreground">
            {/* eslint-disable react/no-unescaped-entities */}
            ยังไม่มีคำขอใช้บริการ Cloud <br/>
            <span className="text-sm">กด "เพิ่มระบบงานใหม่" เพื่อระบุรายละเอียด</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {cloudFields.map((field, index) => (
              <CloudSystemItem 
                key={field.id} 
                nestIndex={index} 
                control={control} 
                register={register} 
                errors={errors} 
                watch={watch} 
                removeSystem={removeCloud} 
              />
            ))}
            
            {/* สรุป Grand Total รวมทุกระบบงาน */}
            <div className="mt-4 bg-primary-container/10 border border-primary/20 p-5 rounded-lg">
              <h3 className="text-md font-bold text-primary-dark mb-4 flex items-center gap-2">
                <Calculator className="w-5 h-5" /> สรุปรวมทรัพยากร Cloud ทั้งโครงการ
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-surface p-3 rounded-md border border-border text-center">
                  <div className="text-xs text-muted-foreground mb-1">รวม vCPU</div>
                  <div className="text-xl font-bold">{grandTotal.vcpu} <span className="text-sm font-normal">Core</span></div>
                </div>
                <div className="bg-surface p-3 rounded-md border border-border text-center">
                  <div className="text-xs text-muted-foreground mb-1">รวม RAM</div>
                  <div className="text-xl font-bold">{grandTotal.ramGb} <span className="text-sm font-normal">GB</span></div>
                </div>
                <div className="bg-surface p-3 rounded-md border border-border text-center">
                  <div className="text-xs text-muted-foreground mb-1">รวม GPU</div>
                  <div className="text-xl font-bold">{grandTotal.gpuGb} <span className="text-sm font-normal">GB</span></div>
                </div>
                <div className="bg-surface p-3 rounded-md border border-border text-center">
                  <div className="text-xs text-muted-foreground mb-1">รวม Storage</div>
                  <div className="text-xl font-bold">{grandTotal.storageGb} <span className="text-sm font-normal">GB</span></div>
                </div>
                <div className="bg-surface p-3 rounded-md border-primary/30 bg-primary/5 text-center">
                  <div className="text-xs text-primary-dark mb-1">รวมราคา (โดยประมาณ)</div>
                  <div className="text-xl font-bold text-primary-dark">{grandTotal.price.toLocaleString()} <span className="text-sm font-normal">บาท</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- ส่วนปุ่ม Generate Document --- */}
      <div className="flex justify-end mt-4 pt-6 border-t border-border">
        <ProposalExportButton
          proposal={getValues()}
          label="สร้างแบบเสนอโครงการ (Word)"
          className="gap-2 border-primary/30 bg-primary-container/20 text-primary-dark hover:bg-primary-container/40"
        />
      </div>

    </div>
  );
};


