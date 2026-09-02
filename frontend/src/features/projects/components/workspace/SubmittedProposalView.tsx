"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ClipboardList, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ProjectDetail } from "../../types/workspace";
import { formatAttachmentSize, formatCurrency, formatDate, normalizeSubmittedProposal, displayValue, type RawSubmittedProposal, type ProposalRow } from "./proposal-view.utils";
import { BooleanStatus, CopyValueButton, ProposalArrayTable, ProposalField, ProposalLongText, ProposalStepSection, ReviewSubsection } from "./ProposalReviewPrimitives";

const steps = [
  { number: 1, id: "proposal-step-1", title: "ข้อมูลทั่วไปของโครงการ" },
  { number: 2, id: "proposal-step-2", title: "หลักการ เหตุผล และขอบเขต" },
  { number: 3, id: "proposal-step-3", title: "ยุทธศาสตร์ สถาปัตยกรรม และข้อมูล" },
  { number: 4, id: "proposal-step-4", title: "งบประมาณและค่าใช้จ่าย" },
  { number: 5, id: "proposal-step-5", title: "ความพร้อมและแผนดำเนินงาน" },
];

export function SubmittedProposalView({
  project,
  proposal,
  onEdit,
}: {
  project: ProjectDetail;
  proposal: RawSubmittedProposal;
  onEdit?: () => void;
}) {
  const normalized = useMemo(() => normalizeSubmittedProposal(proposal), [proposal]);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const sections = steps
      .map((step) => document.getElementById(step.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const step = steps.find((item) => item.id === visible.target.id);
        if (step) setActiveStep(step.number);
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: [0.1, 0.5, 0.9] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const attachments = project.attachments ?? [];
  const editAllowed = project.permissions?.canEditProposal === true;

  return (
    <div className="min-w-0 space-y-5">
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">ข้อเสนอที่ส่งแล้ว</Badge>
              <span className="text-xs text-muted-foreground">อัปเดตล่าสุด {formatDate(normalized.updatedAt)}</span>
            </div>
            <h2 className="break-words text-xl font-bold text-foreground sm:text-2xl">
              {displayValue(normalized.projectName, displayValue(project.projectName))}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="group inline-flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" /> Proposal ID: {displayValue(normalized.id)}
                {normalized.id !== null && normalized.id !== undefined && normalized.id !== "" && (
                  <CopyValueButton value={String(normalized.id)} label="Proposal ID" />
                )}
              </span>
              <span className="group inline-flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Project ID: {displayValue(normalized.projectId, project.id)}
                <CopyValueButton value={String(normalized.projectId ?? project.id)} label="Project ID" />
              </span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> สร้างเมื่อ {formatDate(normalized.createdAt)}</span>
            </div>
          </div>
          {editAllowed && onEdit && (
            <Button variant="outline" className="shrink-0 gap-2" onClick={onEdit}>
              <Pencil className="h-4 w-4" /> แก้ไขข้อเสนอ
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
        <nav aria-label="ขั้นตอนข้อเสนอ" className="lg:sticky lg:top-5 lg:z-20 lg:self-start lg:max-h-[calc(100dvh-2.5rem)]">
          <Card className="rounded-2xl border-border/70 shadow-sm lg:max-h-[calc(100dvh-2.5rem)]">
            <CardContent className="flex gap-2 overflow-x-auto p-3 lg:block lg:max-h-[calc(100dvh-2.5rem)] lg:space-y-1 lg:overflow-y-auto lg:overscroll-contain">
              {steps.map((step) => (
                <a
                  key={step.id}
                  href={`#${step.id}`}
                  aria-current={activeStep === step.number ? "step" : undefined}
                  onClick={() => setActiveStep(step.number)}
                  className={`flex min-w-max items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors lg:min-w-0 ${
                    activeStep === step.number
                      ? "bg-primary text-white"
                      : "text-primary-foreground hover:bg-muted/60 hover:text-primary-foreground"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      activeStep === step.number
                        ? "border-2 border-white text-white"
                        : "border border-primary-foreground"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span className={`whitespace-nowrap lg:whitespace-normal ${
                    activeStep === step.number 
                      ? "text-white" 
                      : "text-black"}`}>{step.title}</span>
                </a>
              ))}
            </CardContent>
          </Card>
        </nav>

        <div className="min-w-0 space-y-5">
          <ProposalStepSection id="proposal-step-1" number={1} title={steps[0].title} description="ข้อมูลพื้นฐานและกรอบงบประมาณของโครงการ">
            <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
              <ProposalField label="ชื่อโครงการ" value={normalized.projectName} className="sm:col-span-2 xl:col-span-3" />
              <ProposalField label="หน่วยงาน" value={normalized.agencyName} />
              <ProposalField label="หัวหน้าหน่วยงาน" value={normalized.headOfAgency} />
              <ProposalField label="DCIO" value={normalized.dcioName} />
              <ProposalField label="ผู้จัดการโครงการ" value={normalized.projectManager} />
              <ProposalField label="งบประมาณรวม" value={formatCurrency(normalized.totalBudget)} />
            </div>
            <ProposalArrayTable
              title="แผนงบประมาณรายปี"
              rows={normalized.budgets}
              columns={[
                { key: "year", label: "ปีงบประมาณ" },
                { key: "amount", label: "จำนวนเงิน", render: (row) => formatCurrency(row.amount) },
                { key: "budgetType", label: "ประเภทงบประมาณ" },
              ]}
            />
          </ProposalStepSection>

          <ProposalStepSection id="proposal-step-2" number={2} title={steps[1].title} description="เหตุผล ความต้องการ และขอบเขตการดำเนินงาน">
            <div className="grid gap-2 md:grid-cols-2">
              <ProposalLongText label="ความเป็นมา" value={normalized.background} />
              <ProposalLongText label="วัตถุประสงค์" value={normalized.objective} />
              <ProposalLongText label="กลุ่มเป้าหมาย" value={normalized.target} />
              <ProposalLongText label="ขอบเขตโครงการ" value={normalized.scope} />
              <ProposalField label="ประเภทโครงการ" value={normalized.projectType} />
              <ProposalLongText label="สถานะระบบปัจจุบัน" value={normalized.currentSystemStatus} />
              <ProposalLongText label="ปัญหาปัจจุบัน" value={normalized.currentProblems} className="md:col-span-2" />
            </div>
            <ProposalArrayTable title="โครงการที่เกี่ยวข้อง" rows={normalized.relatedProjects} columns={[
              { key: "projectName", label: "ชื่อโครงการ" },
              { key: "agency", label: "หน่วยงาน" },
              { key: "fiscalYear", label: "ปีงบประมาณ" },
              { key: "relationType", label: "ความสัมพันธ์" },
              { key: "remark", label: "หมายเหตุ" },
            ]} />
            <ProposalArrayTable title="กำลังคน" rows={normalized.manpower} columns={[
              { key: "agencyPart", label: "หน่วยงาน/ส่วนงาน" },
              { key: "positionLimit", label: "กรอบอัตรา" },
              { key: "occupied", label: "มีผู้ครอง" },
              { key: "vacant", label: "ว่าง" },
            ]} />
            <ProposalArrayTable title="อุปกรณ์เดิม" rows={normalized.existingEquipments} columns={[
              { key: "itemName", label: "รายการ" },
              { key: "ageYears", label: "อายุ (ปี)" },
              { key: "quantity", label: "จำนวน" },
              { key: "user", label: "ผู้ใช้งาน" },
              { key: "location", label: "สถานที่" },
              { key: "remark", label: "หมายเหตุ" },
            ]} />
          </ProposalStepSection>

          <ProposalStepSection id="proposal-step-3" number={3} title={steps[2].title} description="ความสอดคล้องเชิงนโยบาย ระบบ และการแลกเปลี่ยนข้อมูล">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              <ProposalField label="แผน BMA" value={normalized.isBmaPlan} render={() => <BooleanStatus value={normalized.isBmaPlan} />} />
              <ProposalField label="แผนของหน่วยงาน" value={normalized.isAgencyPlan} render={() => <BooleanStatus value={normalized.isAgencyPlan} />} />
              <ProposalField label="นโยบายผู้ว่าฯ" value={normalized.isGovernorPolicy} render={() => <BooleanStatus value={normalized.isGovernorPolicy} />} />
              <ProposalLongText label="ยุทธศาสตร์หน่วยงาน" value={normalized.agencyStrategy} />
              <ProposalLongText label="ประเด็นยุทธศาสตร์/ปัญหา" value={normalized.agencyIssue} />
              <ProposalLongText label="ตัวชี้วัด (KPI)" value={normalized.agencyKpi} />
              <ProposalField label="รหัสนโยบาย" value={normalized.governorPolicyCode} copyable />
              <ProposalLongText label="ชื่อนโยบาย" value={normalized.governorPolicyName} />
              <ProposalLongText label="กฎหมายหรืออุปสรรค" value={normalized.obstacleLaws} />
              <ProposalLongText label="สถาปัตยกรรมระบบ" value={normalized.appArchitecture} className="sm:col-span-2 xl:col-span-3" />
              <ProposalField label="เจ้าของข้อมูล" value={normalized.dataOwner} />
              <ProposalLongText label="แผนการแลกเปลี่ยนข้อมูล" value={normalized.dataExchangePlan} className="sm:col-span-2" />
            </div>
            <ReviewSubsection title="เอกสารและแผนภาพประกอบ">
              {attachments.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">ไม่มีเอกสารแนบ</p>
              ) : (
                <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70">
                  {attachments.map((attachment) => (
                    <div key={attachment.id} className="flex flex-col gap-2 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <a href={attachment.fileUrl} target="_blank" rel="noreferrer" className="block truncate text-sm font-semibold text-foreground hover:text-primary">
                            {attachment.fileName}
                          </a>
                          <p className="text-xs text-muted-foreground">
                            อัปโหลดโดย {attachment.uploader ? `${attachment.uploader.firstName} ${attachment.uploader.lastName}` : "-"} · {formatDate(attachment.createdAt)} · {formatAttachmentSize(attachment.fileSize)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-fit">{displayValue(attachment.docTypeName)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </ReviewSubsection>
          </ProposalStepSection>

          <ProposalStepSection id="proposal-step-4" number={4} title={steps[3].title} description="รายละเอียดค่าใช้จ่ายและทรัพยากรที่ต้องใช้">
            <ProposalArrayTable title="ค่าใช้จ่ายด้าน Hardware" rows={normalized.hardwareCosts} columns={[
              { key: "itemName", label: "รายการ" },
              { key: "quantity", label: "จำนวน" },
              { key: "unitPrice", label: "ราคาต่อหน่วย", render: (row) => formatCurrency(row.unitPrice) },
              { key: "referenceType", label: "แหล่งอ้างอิง" },
            ]} />
            <ProposalArrayTable title="ค่าใช้จ่ายด้าน Software" rows={normalized.softwareCosts} columns={[
              { key: "itemName", label: "รายการ" },
              { key: "quantity", label: "จำนวน" },
              { key: "unitPrice", label: "ราคาต่อหน่วย", render: (row) => formatCurrency(row.unitPrice) },
              { key: "referenceType", label: "แหล่งอ้างอิง" },
            ]} />
            <ProposalArrayTable title="บุคลากรหลัก" rows={normalized.personnelCoreCosts} columns={[
              { key: "position", label: "ตำแหน่ง" },
              { key: "degree", label: "วุฒิการศึกษา" },
              { key: "baseSalary", label: "เงินเดือนฐาน", render: (row) => formatCurrency(row.baseSalary) },
              { key: "personCount", label: "จำนวนคน" },
              { key: "durationMonths", label: "ระยะเวลา (เดือน)" },
            ]} />
            <ProposalArrayTable title="บุคลากรผู้ช่วย" rows={normalized.personnelAsstCosts} columns={[
              { key: "position", label: "ตำแหน่ง" },
              { key: "degree", label: "วุฒิการศึกษา" },
              { key: "baseSalary", label: "เงินเดือนฐาน", render: (row) => formatCurrency(row.baseSalary) },
              { key: "personCount", label: "จำนวนคน" },
            ]} />
            <ProposalArrayTable title="บุคลากรสนับสนุน" rows={normalized.personnelSuppCosts} columns={[
              { key: "position", label: "ตำแหน่ง" },
              { key: "degree", label: "วุฒิการศึกษา" },
              { key: "baseSalary", label: "เงินเดือนฐาน", render: (row) => formatCurrency(row.baseSalary) },
              { key: "personCount", label: "จำนวนคน" },
            ]} />
            <ProposalArrayTable title="หน้าที่ความรับผิดชอบ" rows={normalized.personnelResponsibilities} columns={[
              { key: "position", label: "ตำแหน่ง" },
              { key: "responsibility", label: "ความรับผิดชอบ" },
            ]} />
            <ProposalArrayTable title="หลักสูตรฝึกอบรม" rows={normalized.trainingCourses} columns={[
              { key: "courseName", label: "หลักสูตร" },
              { key: "trainingMethod", label: "รูปแบบ" },
              { key: "locationType", label: "สถานที่" },
              { key: "hasSpeakerCost", label: "มีค่าวิทยากร", render: (row) => <BooleanStatus value={row.hasSpeakerCost} /> },
            ]} />
            <ProposalArrayTable title="ค่าใช้จ่ายอื่น ๆ" rows={normalized.otherCosts} columns={[
              { key: "itemName", label: "รายการ" },
              { key: "costType", label: "ประเภท" },
              { key: "quantity", label: "จำนวน" },
              { key: "unitPrice", label: "ราคาต่อหน่วย", render: (row) => formatCurrency(row.unitPrice) },
              { key: "remark", label: "หมายเหตุ" },
            ]} />
          </ProposalStepSection>

          <ProposalStepSection id="proposal-step-5" number={5} title={steps[4].title} description="ความพร้อม ทรัพยากร และผลลัพธ์ที่คาดว่าจะได้รับ">
            <div className="grid gap-2 sm:grid-cols-2">
              <ProposalField label="ระยะเวลาดำเนินการ" value={normalized.durationDays ? `${displayValue(normalized.durationDays)} วัน` : "-"} />
              <ProposalField label="อยู่ใน Roadmap" value={normalized.isInRoadmap} render={() => <BooleanStatus value={normalized.isInRoadmap} />} />
              <ProposalLongText label="ความพร้อมด้านอื่น ๆ" value={normalized.otherReadiness} />
              <ProposalLongText label="ผลประโยชน์ที่คาดว่าจะได้รับ" value={normalized.expectedBenefits} />
            </div>
            <ProposalArrayTable title="บุคลากร ICT" rows={normalized.ictPersonnel} columns={[
              { key: "position", label: "ตำแหน่ง" },
              { key: "level", label: "ระดับ" },
              { key: "count", label: "จำนวน" },
            ]} />
            <ReviewSubsection title="คำขอใช้ Cloud และ VM">
              {normalized.cloudRequests.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">ไม่มีข้อมูล</p>
              ) : (
                <div className="space-y-3">
                  {normalized.cloudRequests.map((request, index) => {
                    const vms = Array.isArray(request.vms) ? request.vms.map((row) => (row && typeof row === "object" ? row as ProposalRow : {})) : [];
                    return (
                      <Card key={String(request.id ?? index)} size="sm" className="rounded-xl border-border/70 bg-muted/10">
                        <CardContent className="space-y-3 p-4">
                          <div className="grid gap-2 sm:grid-cols-3">
                            <ProposalField label="ชื่อระบบ" value={request.systemName} />
                            <ProposalField label="วันที่ขอใช้บริการ" value={formatDate(request.requestedServiceDate)} />
                            <ProposalField label="วันที่บันทึกคำขอ" value={formatDate(request.recordedRequestDate)} />
                          </div>
                          <ProposalArrayTable title="รายละเอียด VM" rows={vms} columns={[
                            { key: "vmDescription", label: "รายละเอียด" },
                            { key: "osDatabase", label: "OS/ฐานข้อมูล" },
                            { key: "vcpu", label: "vCPU" },
                            { key: "ramGb", label: "RAM (GB)" },
                            { key: "storageGb", label: "Storage (GB)" },
                            { key: "price", label: "ราคา", render: (row) => formatCurrency(row.price) },
                          ]} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ReviewSubsection>
          </ProposalStepSection>
        </div>
      </div>
    </div>
  );
}
