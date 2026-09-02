// components/EAStrategySection.tsx
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProposalStep3Values } from "../types";

export const EAStrategySection = () => {
  const { register, setValue, control, formState: { errors } } = useFormContext<ProposalStep3Values>();

  const isBmaPlan = useWatch({ control, name: "isBmaPlan" });
  const isAgencyPlan = useWatch({ control, name: "isAgencyPlan" });
  const isGovernorPolicy = useWatch({ control, name: "isGovernorPolicy" });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          ความสอดคล้องเชิงยุทธศาสตร์ <span className="text-status-orange">*</span>
        </h3>
        {errors.isBmaPlan && <p className="text-sm text-status-orange mb-3">{errors.isBmaPlan.message as string}</p>}
        
        <div className="space-y-4">
          
          {/* ข้อ 1 */}
          <div className="flex flex-row items-center space-x-3 rounded-md border border-border p-4 shadow-sm bg-surface">
            <Checkbox 
              id="isBmaPlan" 
              checked={isBmaPlan} 
              onCheckedChange={(checked) => setValue("isBmaPlan", checked as boolean, { shouldValidate: true })} 
            />
            <Label htmlFor="isBmaPlan" className="font-normal cursor-pointer text-sm flex-1">
              บรรจุในแผนปฏิบัติราชการ กทม.
            </Label>
          </div>

          {/* ข้อ 2 */}
          <div className="flex flex-col rounded-md border border-border p-4 shadow-sm bg-surface overflow-hidden transition-all">
            <div className="flex flex-row items-center space-x-3">
              <Checkbox 
                id="isAgencyPlan" 
                checked={isAgencyPlan} 
                onCheckedChange={(checked) => {
                  setValue("isAgencyPlan", checked as boolean, { shouldValidate: true });
                  if (!checked) {
                    setValue("agencyStrategy", "");
                    setValue("agencyIssue", "");
                    setValue("agencyKpi", "");
                  }
                }} 
              />
              <Label htmlFor="isAgencyPlan" className="font-normal cursor-pointer text-sm flex-1">
                บรรจุในแผนปฏิบัติราชการประจำปีของหน่วยงาน
              </Label>
            </div>

            {/* Sub-fields ของข้อ 2 */}
            {isAgencyPlan && (
              <div className="pl-7 grid gap-4 pt-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">แผนงานการพัฒนาด้าน</Label>
                  <Input placeholder="ระบุแผนงาน..." {...register("agencyStrategy")} />
                  {errors.agencyStrategy && <p className="text-xs text-status-orange">{errors.agencyStrategy.message as string}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ประเด็นการพัฒนา</Label>
                  <Input placeholder="ระบุประเด็น..." {...register("agencyIssue")} />
                  {errors.agencyIssue && <p className="text-xs text-status-orange">{errors.agencyIssue.message as string}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ตัววัดผลหลัก (KPI)</Label>
                  <Input placeholder="ระบุตัวชี้วัด..." {...register("agencyKpi")} />
                  {errors.agencyKpi && <p className="text-xs text-status-orange">{errors.agencyKpi.message as string}</p>}
                </div>
              </div>
            )}
          </div>

          {/* ข้อ 3 */}
          <div className="flex flex-col rounded-md border border-border p-4 shadow-sm bg-surface overflow-hidden transition-all">
            <div className="flex flex-row items-center space-x-3">
              <Checkbox 
                id="isGovernorPolicy" 
                checked={isGovernorPolicy} 
                onCheckedChange={(checked) => {
                  setValue("isGovernorPolicy", checked as boolean, { shouldValidate: true });
                  if (!checked) {
                    setValue("governorPolicyCode", "");
                    setValue("governorPolicyName", "");
                  }
                }} 
              />
              <Label htmlFor="isGovernorPolicy" className="font-normal cursor-pointer text-sm flex-1">
                เป็นโครงการตามนโยบายผู้ว่าฯ กทม.
              </Label>
            </div>

            {/* Sub-fields ของข้อ 3 */}
            {isGovernorPolicy && (
              <div className="pl-7 grid gap-4 pt-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">รหัสนโยบาย</Label>
                  <Input placeholder="ระบุรหัส..." {...register("governorPolicyCode")} />
                  {errors.governorPolicyCode && <p className="text-xs text-status-orange">{errors.governorPolicyCode.message as string}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ชื่อนโยบายผู้ว่าฯ</Label>
                  <Input placeholder="ระบุชื่อนโยบาย..." {...register("governorPolicyName")} />
                  {errors.governorPolicyName && <p className="text-xs text-status-orange">{errors.governorPolicyName.message as string}</p>}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
