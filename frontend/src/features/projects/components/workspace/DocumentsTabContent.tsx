"use client";

import { useQueryClient } from "@tanstack/react-query";
import { FileCheck2, History, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useProjectDocuments, type ProjectAttachment } from "../../hooks/useProjectDocuments";
import { deleteProjectFile, FileAttachment, FileUploadField } from "./ui/FileUploadField";
import type { DocumentFile } from "../../types/workspace";
import { useProjectAttachmentTypes } from "../../hooks/useProjectAttachmentTypes";
import {
  PROJECT_ATTACHMENT_TYPE_NAMES,
  type ProjectAttachmentTypeName,
} from "../../types/project-attachment-type";

const EMPTY_ATTACHMENTS: ProjectAttachment[] = [];

type DocumentField = {
  docTypeName: ProjectAttachmentTypeName;
  title: string;
  accept: string;
  file: DocumentFile | null;
  setFile: (file: DocumentFile | null) => void;
};

function formatDate(value: string | Date | undefined) {
  if (!value) return "ไม่ระบุวันที่";
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

export function DocumentsTabContent({
  projectId,
  initialAttachments = EMPTY_ATTACHMENTS,
  canManage = true,
}: {
  projectId: string;
  initialAttachments?: ProjectAttachment[];
  canManage?: boolean;
}) {
  const queryClient = useQueryClient();
  const {
    data: attachmentTypesResponse,
    isPending: isAttachmentTypesPending,
    isError: isAttachmentTypesError,
    error: attachmentTypesError,
    refetch: refetchAttachmentTypes,
  } = useProjectAttachmentTypes();
  const documents = useProjectDocuments(
    initialAttachments,
    attachmentTypesResponse?.data ?? [],
  );
  const hasAttachmentTypes = (attachmentTypesResponse?.data.length ?? 0) > 0;

  const invalidateProjectData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["proposals", "draft", projectId] }),
      queryClient.invalidateQueries({ queryKey: ["proposals", "submitted", projectId] }),
    ]);
  };

  const handleRemoveFile = async (id: string, removeLocal?: () => void) => {
    try {
      if (id !== "uploaded") await deleteProjectFile(id);
      removeLocal?.();
      await invalidateProjectData();
    } catch (error) {
      toast.error("ลบเอกสารไม่สำเร็จ", {
        description:
          error instanceof Error ? error.message : "กรุณาลองใหม่อีกครั้ง",
      });
      throw error instanceof Error ? error : new Error("File deletion failed.");
    }
  };

  const requiredDocuments: DocumentField[] = [
    {
      docTypeName: PROJECT_ATTACHMENT_TYPE_NAMES.presentation,
      title: "Presentation",
      accept: ".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation",
      file: documents.presentation,
      setFile: documents.setPresentation,
    },
    {
      docTypeName: PROJECT_ATTACHMENT_TYPE_NAMES.quotation,
      title: "ใบเสนอราคา",
      accept: ".pdf",
      file: documents.quotation,
      setFile: documents.setQuotation,
    },
    {
      docTypeName: PROJECT_ATTACHMENT_TYPE_NAMES.onePageSummary,
      title: "One page",
      accept: ".pdf",
      file: documents.onePage,
      setFile: documents.setOnePage,
    },
    {
      docTypeName: PROJECT_ATTACHMENT_TYPE_NAMES.bmaDcUsage,
      title: "การใช้ BMA DC",
      accept: ".pdf,application/pdf",
      file: documents.bmaDcUsage,
      setFile: documents.setBmaDcUsage,
    },
  ];

  const diagrams: DocumentField[] = [
    {
      docTypeName: PROJECT_ATTACHMENT_TYPE_NAMES.systemDiagram,
      title: "System Diagram",
      accept: ".png,.jpg,.jpeg,.webp",
      file: documents.systemDiagram,
      setFile: documents.setSystemDiagram,
    },
    {
      docTypeName: PROJECT_ATTACHMENT_TYPE_NAMES.networkDiagram,
      title: "Network Diagram",
      accept: ".png,.jpg,.jpeg,.webp",
      file: documents.networkDiagram,
      setFile: documents.setNetworkDiagram,
    },
    {
      docTypeName: PROJECT_ATTACHMENT_TYPE_NAMES.useCaseDiagram,
      title: "Use Case Diagram",
      accept: ".png,.jpg,.jpeg,.webp",
      file: documents.useCaseDiagram,
      setFile: documents.setUseCaseDiagram,
    },
    {
      docTypeName: PROJECT_ATTACHMENT_TYPE_NAMES.securityDiagram,
      title: "Security Diagram",
      accept: ".png,.jpg,.jpeg,.webp",
      file: documents.securityDiagram,
      setFile: documents.setSecurityDiagram,
    },
  ];

  return (
    <div className="space-y-6">
      {isAttachmentTypesPending && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          กำลังโหลดประเภทเอกสาร...
        </div>
      )}
      {isAttachmentTypesError && (
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">ไม่สามารถโหลดประเภทเอกสารได้</p>
            <p className="text-xs text-red-700">
              {attachmentTypesError instanceof Error
                ? attachmentTypesError.message
                : "กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง"}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetchAttachmentTypes()}
            className="w-full border-red-300 text-red-700 hover:bg-red-100 sm:w-auto"
          >
            ลองใหม่
          </Button>
        </div>
      )}
      {!isAttachmentTypesError && attachmentTypesResponse && !hasAttachmentTypes && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          ไม่พบข้อมูลประเภทเอกสารจากระบบ จึงยังไม่สามารถอัปโหลดเอกสารได้
        </div>
      )}
      {documents.unclassifiedDocs.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-red-800">
              Unclassified attachments
            </CardTitle>
            <p className="text-xs text-red-700">
              These files do not match a known attachment type and were not placed under Other Documents.
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {documents.unclassifiedDocs.map((document) => (
              <FileAttachment key={document.id} value={document} canManage={false} />
            ))}
          </CardContent>
        </Card>
      )}
      <Card className="overflow-hidden border-amber-200 border bg-amber-50">
        <CardHeader className="border-b border-amber-200 b-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-lg font-extrabold text-slate-900">
                    เอกสารประกอบการพิจารณาพร้อมลายเซ็นรับรอง
                  </CardTitle>
                  <Badge className="border-amber-300 bg-amber-100 text-amber-800">
                    จำเป็น
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  กรุณาexportแบบฟอร์มที่ท่านกรอกในระบบ และอัปโหลดเอกสารที่มีลายเซ็นรับรองจากผู้มีอำนาจลงนาม
                </p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit border-amber-300 bg-white/70">
              {documents.approvalDocuments.length > 0
                ? `${documents.approvalDocuments.length} เวอร์ชัน`
                : "ยังไม่มีเอกสาร"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 sm:p-5">
          <FileUploadField
            projectId={projectId}
            docTypeName={PROJECT_ATTACHMENT_TYPE_NAMES.approvalDocument}
            title="เอกสารประกอบการพิจารณาพร้อมลายเซ็นรับรอง"
            accept=".pdf"
            value={documents.latestApprovalDocument}
            onChange={(file) => documents.setApprovalDoc(file as DocumentFile | null)}
            canManage={canManage}
            allowNewVersion
            uploadButtonLabel="อัปโหลดเวอร์ชันใหม่"
            showDescription
            className="border-amber-200 bg-white/80"
          />

          {documents.approvalDocumentHistory.length > 0 && (
            <Accordion type="single" collapsible className="rounded-lg border border-amber-200 bg-white/70 px-3">
              <AccordionItem value="approval-history" className="border-0">
                <AccordionTrigger className="py-3 font-bold text-slate-800 hover:no-underline">
                  <span className="flex items-center gap-2">
                    <History className="h-4 w-4 text-amber-700" />
                    ประวัติเวอร์ชัน ({documents.approvalDocumentHistory.length})
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {documents.approvalDocumentHistory.map((document) => (
                      <div key={document.id} className="space-y-1">
                        <FileAttachment
                          value={document}
                          canManage={canManage || document.canDelete === true}
                          onRemove={() =>
                            void handleRemoveFile(document.id)
                          }
                        />
                        <p className="pl-12 text-[11px] text-slate-500">
                          อัปโหลดเมื่อ {formatDate(document.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">เอกสารประกอบโครงการ</h2>
            <p className="text-sm text-slate-500">เอกสารที่ใช้ประกอบการพิจารณาโครงการ</p>
          </div>
          <Badge variant="outline">
            อัปโหลดแล้ว {requiredDocuments.filter((document) => document.file).length} / {requiredDocuments.length}
          </Badge>
        </div>
        <Card className="rounded-md border-[#D1CDC7] bg-white shadow-sm">
          <CardContent className="grid gap-4 p-4 md:grid-cols-2">
            {requiredDocuments.map((field) => (
              <FileUploadField
                key={field.docTypeName}
                projectId={projectId}
                docTypeName={field.docTypeName}
                title={field.title}
                accept={field.accept}
                value={field.file}
                onChange={(file) => field.setFile(file as DocumentFile | null)}
                canManage={canManage}
                showDescription
              />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">แผนภาพระบบ</h2>
          <p className="text-sm text-slate-500">รูปภาพจะถูกปรับขนาดและบีบอัดก่อนอัปโหลด</p>
        </div>
        <Card className="rounded-md border-[#D1CDC7] bg-white shadow-sm">
          <CardContent className="grid gap-4 p-4 md:grid-cols-2">
            {diagrams.map((field) => (
              <FileUploadField
                key={field.docTypeName}
                projectId={projectId}
                docTypeName={field.docTypeName}
                title={field.title}
                accept={field.accept}
                value={field.file}
                onChange={(file) => field.setFile(file as DocumentFile | null)}
                canManage={canManage}
                showDescription
              />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">เอกสารเพิ่มเติม</h2>
          <p className="text-sm text-slate-500">
            เอกสารรูปแบบอื่นจะถูกดาวน์โหลดโดยตรงเมื่อเลือกไฟล์
          </p>
        </div>
        <FileUploadField
          projectId={projectId}
          docTypeName={PROJECT_ATTACHMENT_TYPE_NAMES.other}
          title="เอกสารเพิ่มเติม"
          accept="*/*"
          value={null}
          onChange={(file) =>
            file && documents.addAdditionalDocument(file as DocumentFile)
          }
          canManage={canManage}
          showDescription
        />
        <Card className="rounded-md border-[#D1CDC7] bg-white shadow-sm">
          <CardContent className="space-y-3 p-4">
            {documents.additionalDocs.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center text-slate-400">
                <Paperclip className="mb-2 h-7 w-7" />
                <p className="text-sm">ยังไม่มีเอกสารแนบ</p>
              </div>
            ) : (
              documents.additionalDocs.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <FileAttachment
                    value={document}
                    canManage={canManage}
                    onRemove={() =>
                      void handleRemoveFile(document.id, () =>
                        documents.removeAdditionalDoc(document.id),
                      )
                    }
                    className="w-full"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
