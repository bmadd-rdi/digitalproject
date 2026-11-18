// components/EAStrategySection.tsx
"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGovernorPolicies } from "@/features/lookups/hooks/useLookups";
import type { ProposalStep3Values } from "../types";
import { LookupCombobox } from "./LookupCombobox";

// id สมมติของตัวเลือก "(ค่าเดิม)" กรณีข้อเสนอเก่ามีรหัส/ชื่อนโยบายที่ไม่ตรงกับรายการในระบบ
const LEGACY_OPTION_ID = -1;

export const EAStrategySection = () => {
  const { register, setValue, control, formState: { errors } } = useFormContext<ProposalStep3Values>();

  const isBmaPlan = useWatch({ control, name: "isBmaPlan" });
  const isAgencyPlan = useWatch({ control, name: "isAgencyPlan" });
  const isGovernorPolicy = useWatch({ control, name: "isGovernorPolicy" });
  const governorPolicyCode = useWatch({ control, name: "governorPolicyCode" }) ?? "";
  const governorPolicyName = useWatch({ control, name: "governorPolicyName" }) ?? "";

  // ดึงรายการนโยบายเฉพาะตอนที่ติ๊กข้อ 3 (ไม่ยิง request โดยไม่จำเป็น)
  const policiesQuery = useGovernorPolicies(Boolean(isGovernorPolicy));
  const policies = policiesQuery.data?.data ?? [];

  const matchedPolicy = policies.find((policy) => policy.code === governorPolicyCode);
  // ข้อเสนอเก่าอาจมีรหัส/ชื่อที่กรอกเองและไม่ตรงกับรายการนโยบายในระบบ
  // แสดงเป็นตัวเลือก "(ค่าเดิม)" เพื่อไม่ให้ค่าเดิมหายตอนเปิดแก้ไข
  const hasUnmatchedValue = Boolean(governorPolicyCode || governorPolicyName) && !matchedPolicy;
  const unmatchedLabel = [governorPolicyCode, governorPolicyName].filter(Boolean).join(" - ")
    + (policiesQuery.isLoading ? "" : " (ค่าเดิม)");

  // ตัวเลือกของช่องค้นหา: ข้อความ "รหัส - ชื่อ" จึงพิมพ์ค้นหาได้ทั้งรหัสและชื่อนโยบาย
  const policyOptions = [
    ...(hasUnmatchedValue ? [{ id: LEGACY_OPTION_ID, name: unmatchedLabel }] : []),
    ...policies.map((policy) => ({ id: policy.id, name: `${policy.code} - ${policy.name}` })),
  ];
  const selectedId = matchedPolicy ? matchedPolicy.id : hasUnmatchedValue ? LEGACY_OPTION_ID : 0;

  const governorError =
    (errors.governorPolicyCode?.message as string | undefined)
    ?? (errors.governorPolicyName?.message as string | undefined);

  const handlePolicyChange = (id: number) => {
    const policy = policies.find((item) => item.id === id);
    if (!policy) return; // เลือกตัวเลือก "(ค่าเดิม)" ซ้ำ = คงค่าเดิมไว้
    const options = { shouldValidate: true, shouldDirty: true };
    setValue("governorPolicyCode", policy.code, options);
    setValue("governorPolicyName", policy.name, options);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground mb-4">
        7.1 สถาปัตยกรรมด้านพันธกิจหรือภารกิจ (Business Architecture)<span className="text-status-orange"></span>
      </h3>
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          7.1.1 ความสอดคล้องเชิงยุทธศาสตร์ <span className="text-status-orange"></span>
        </h3>
        {errors.isBmaPlan && <p className="text-sm text-status-orange mb-3">{errors.isBmaPlan.message as string}</p>}

        <div className="space-y-4">

          {/* ข้อ 1 */}
          <div className="flex flex-col rounded-md border border-border p-4 shadow-sm bg-surface overflow-hidden transition-all">
            <div className="flex flex-row items-center space-x-3">
              <Checkbox
                id="isBmaPlan"
                checked={isBmaPlan}
                onCheckedChange={(checked) => {
                  setValue("isBmaPlan", checked as boolean, { shouldValidate: true });
                  if (!checked) {
                    setValue("bmaPlanStrategy", "");
                    setValue("bmaPlanIssue", "");
                    setValue("bmaPlanKpi", "");
                  }
                }}
              />
              <Label htmlFor="isBmaPlan" className="font-normal cursor-pointer text-sm flex-1">
                บรรจุในแผนปฏิบัติราชการ กทม.
              </Label>
            </div>

            {/* Sub-fields ของข้อ 1 */}
            {isBmaPlan && (
              <div className="pl-7 grid gap-4 pt-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">แผนงานการพัฒนาด้าน</Label>
                  <Input placeholder="ระบุแผนงาน..." {...register("bmaPlanStrategy")} />
                  {errors.bmaPlanStrategy && <p className="text-xs text-status-orange">{errors.bmaPlanStrategy.message as string}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ประเด็นการพัฒนา</Label>
                  <Input placeholder="ระบุประเด็น..." {...register("bmaPlanIssue")} />
                  {errors.bmaPlanIssue && <p className="text-xs text-status-orange">{errors.bmaPlanIssue.message as string}</p>}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ตัววัดผลหลัก (KPI)</Label>
                  <Input placeholder="ระบุตัวชี้วัด..." {...register("bmaPlanKpi")} />
                  {errors.bmaPlanKpi && <p className="text-xs text-status-orange">{errors.bmaPlanKpi.message as string}</p>}
                </div>
              </div>
            )}
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

            {/* Sub-fields ของข้อ 3 — dropdown เดียว เลือกแล้วเติมทั้งรหัสนโยบายและชื่อนโยบาย */}
            {isGovernorPolicy && (
              <div className="pl-7 grid gap-4 pt-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">นโยบายผู้ว่าฯ (รหัสนโยบาย - ชื่อนโยบาย)</Label>
                  <LookupCombobox
                    options={policyOptions}
                    value={selectedId}
                    onChange={handlePolicyChange}
                    placeholder={policiesQuery.isLoading ? "กำลังโหลดรายการนโยบาย..." : "พิมพ์ค้นหารหัสหรือชื่อนโยบาย หรือเลือกจากรายการ..."}
                    error={Boolean(governorError)}
                    disabled={policiesQuery.isLoading}
                  />
                  {policiesQuery.isError && (
                    <p className="text-xs text-status-orange">ไม่สามารถโหลดรายการนโยบายได้ กรุณารีเฟรชหน้าแล้วลองใหม่</p>
                  )}
                  {governorError && <p className="text-xs text-status-orange">{governorError}</p>}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
