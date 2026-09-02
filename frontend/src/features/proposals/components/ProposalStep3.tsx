// ProjectStep3.tsx
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  useFormContext,
  UseFormWatch,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import { ProposalStep3Values } from "../types";
import { Input } from "@/components/ui/input";
import { RichTextarea } from "@/components/custom/RichTextarea";
import { Label } from "@/components/ui/label";
import { EAStrategySection } from "./EAStrategySection";
import { CloudUpload, FileImage, X, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";
import { FileUploadField, type SharedFileValue } from "@/features/projects/components/workspace/ui/FileUploadField";
import { CLIENT_API_BASE } from "@/lib/client-api";
import type { ProjectAttachmentTypeName } from "@/features/projects/types/project-attachment-type";

// กำหนดโครงสร้างข้อมูลไฟล์ที่เก็บใน React Hook Form ให้ชัดเจน
interface MappedFile {
  id: string;
  file: File | string;
  description: string;
  url?: string;
}

interface SingleFileUploadWithDescBoxProps {
  projectId: string;
  title: string;
  docTypeName: ProjectAttachmentTypeName;
  name: keyof ProposalStep3Values;
  watch: UseFormWatch<ProposalStep3Values>;
  setValue: UseFormSetValue<ProposalStep3Values>;
  errors: FieldErrors<ProposalStep3Values>;
  onUploadingChange?: (uploading: boolean) => void;
}

async function uploadImage(
  file: File,
  projectId: string,
  docTypeName: ProjectAttachmentTypeName,
): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("projectId", projectId);
  body.append("docTypeName", docTypeName);
  const response = await fetch(`${CLIENT_API_BASE}/uploads/document`, {
    method: "POST",
    credentials: "include",
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.data?.url) {
    throw new Error(payload.message ?? payload.error ?? "Image upload failed");
  }
  return payload.data.url;
}

// --- Component สำหรับอัปโหลด 1 ไฟล์รูปภาพ + คำอธิบาย ---
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */
const LegacySingleFileUploadWithDescBox = ({
  projectId,
  title,
  docTypeName,
  name,
  watch,
  setValue,
  errors,
  onUploadingChange,
}: SingleFileUploadWithDescBoxProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // นำมาสร้าง UI Loading ด้านล่างแล้ว
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const localPreviewUrlRef = useRef<string | null>(null);

  const clearLocalPreview = () => {
    if (localPreviewUrlRef.current) {
      URL.revokeObjectURL(localPreviewUrlRef.current);
      localPreviewUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  // ดึงค่ามาเช็คและ Cast ไทป์ให้ตรงตาม Interface
  const watchedFile = watch(name);
  const currentFile = useMemo(
    () => (typeof watchedFile === "string"
      ? { id: `${String(name)}-server`, file: watchedFile, description: "" }
      : watchedFile) as MappedFile | null | undefined,
    [name, watchedFile],
  );
  const isFull = !!currentFile;

  // Effect: สำหรับคอยจัดการเปิด/ปิด Object URL เพื่อทำภาพพรีวิว
  useEffect(() => {
    // 1. จัดการกรณีไม่มีไฟล์
    if (!currentFile || !currentFile.file) {
      clearLocalPreview();
      setPreviewUrl(null);
      return;
    }

    // บังคับ Cast ข้อมูลให้เป็น any ก่อนเช็ค instanceof
    const fileData = currentFile.file as any;

    if (typeof fileData === "string") {
      setPreviewUrl(localPreviewUrlRef.current ?? fileData);
      return;
    }

    if (!(fileData instanceof File || fileData instanceof Blob)) {
      console.warn(
        `[Auto-Clean] ตรวจพบไฟล์ที่ไม่สมบูรณ์ในฟิลด์ ${name} ระบบทำการล้างค่า...`,
      );

      // รวมการล้าง State และล้าง Form Value ไว้ใน Timeout เดียวกันเพื่อลดการ Render ซ้ำซ้อน
      const timer = setTimeout(() => {
        setPreviewUrl(null);
        setValue(name, null as any, { shouldValidate: true });
      }, 0);
      return () => clearTimeout(timer);
    }

    // 3. สร้าง Preview URL เมื่อข้อมูลเป็น File/Blob ที่สมบูรณ์
    try {
      const objectUrl = URL.createObjectURL(fileData);
      setPreviewUrl(objectUrl);

      // คืนค่าฟังก์ชันสำหรับล้าง Memory
      return () => URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("ไม่สามารถสร้าง Preview ภาพได้:", error);
      setPreviewUrl(null);
    }
  }, [currentFile, name, setValue]);

  const handleFilesAdded = async (files: FileList | File[]) => {
    if (isFull || files.length === 0) return;

    const originalFile = Array.from(files)[0];

    if (!originalFile.type.startsWith("image/")) {
      alert("รองรับเฉพาะไฟล์รูปภาพเท่านั้น (เช่น PNG, JPG)");
      return;
    }

    setIsCompressing(true);
    onUploadingChange?.(true);

    try {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType:
          originalFile.type === "image/png" ? "image/png" : "image/jpeg",
      };

      const compressedBlob = await imageCompression(originalFile, options);

      const compressedFile = new File([compressedBlob], originalFile.name, {
        type: compressedBlob.type,
        lastModified: Date.now(),
      });

      clearLocalPreview();
      localPreviewUrlRef.current = URL.createObjectURL(compressedFile);
      setPreviewUrl(localPreviewUrlRef.current);

      const mappedFile: MappedFile = {
        id: Math.random().toString(36).substring(7),
        file: "",
        description: "",
      };

      const url = await uploadImage(compressedFile, projectId, docTypeName);
      const urlField = `${String(name).replace("File", "Url")}` as keyof ProposalStep3Values;
      setValue(name, { ...mappedFile, file: url, url } as any, { shouldValidate: true });
      setValue(urlField, url as any, { shouldValidate: true });
    } catch (error) {
      console.error("Image compression error:", error);
      clearLocalPreview();
      setPreviewUrl(null);
      alert("เกิดข้อผิดพลาดในการบีบอัดรูปภาพ กรุณาลองใหม่อีกครั้ง");
    } finally {
      onUploadingChange?.(false);
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const removeFile = () => {
    clearLocalPreview();
    setPreviewUrl(null);
    setValue(name, null as any, { shouldValidate: true });
  };

  const updateDescription = (newDesc: string) => {
    if (currentFile) {
      setValue(name, { ...currentFile, description: newDesc } as any, {
        shouldValidate: true,
      });
    }
  };

  // ดึงข้อความ Error แบบปลอดภัยตามกลุ่มฟิลด์ฟอร์ม
  const fieldError = errors[name] as { description?: { message?: string } } | undefined;

  return (
    <div className="flex flex-col gap-3 p-4 border border-border rounded-xl bg-surface">
      <Label className="text-sm font-bold text-foreground">{title}</Label>

      {/* แก้ไข Warning Next.js: ใช้แท็กภาพดิบได้ปลอดภัยโดยระบุ unoptimized
          หรือปิดแจ้งเตือนทางอ้อมผ่านสไตล์สำหรับภาพประเภท Dynamic blob */}
      {previewUrl && (
        <div className="relative w-full h-48 bg-slate-100 border-b border-border/50 flex items-center justify-center p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview Diagram"
            className="max-w-full max-h-full object-contain drop-shadow-sm rounded-sm"
          />
        </div>
      )}

      {!isFull && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-surface-container-low hover:bg-surface-variant/30 hover:border-primary/50",
            isCompressing && "opacity-60 pointer-events-none",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !isCompressing && fileInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
            disabled={isCompressing}
          />
          {isCompressing ? (
            <>
              <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
              <p className="text-sm font-medium text-foreground">
                กำลังบีบอัดรูปภาพ...
              </p>
            </>
          ) : (
            <>
              <CloudUpload className="w-6 h-6 text-primary/70 mb-2" />
              <p className="text-sm font-medium text-foreground">
                คลิก หรือ ลากรูปภาพมาวางที่นี่
              </p>
              <p className="text-xs mt-1 text-muted-foreground">
                รองรับ 1 ไฟล์รูปภาพ (PNG, JPG)
              </p>
            </>
          )}
        </div>
      )}

      {isFull && currentFile && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 p-3 bg-surface-container-low border border-border/50 rounded-lg animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileImage className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">
                  {typeof currentFile.file === "string" ? "Uploaded image" : currentFile.file.name}
                </span>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 rounded-full text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Input
                placeholder="กรุณาระบุคำอธิบายรูปภาพ (บังคับ) *"
                value={currentFile.description}
                onChange={(e) => updateDescription(e.target.value)}
                className={cn(
                  "bg-surface text-sm h-9",
                  fieldError?.description &&
                    "border-status-orange focus-visible:ring-status-orange",
                )}
              />
              {fieldError?.description && (
                <p className="text-xs text-status-orange mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{" "}
                  {fieldError.description.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Component หลัก ---
/* eslint-enable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect, @typescript-eslint/no-unused-vars */
const SingleFileUploadWithDescBox = ({
  projectId,
  title,
  docTypeName,
  name,
  watch,
  setValue,
  errors,
  onUploadingChange,
}: SingleFileUploadWithDescBoxProps) => {
  const watchedFile = watch(name);
  const value = (typeof watchedFile === "string"
    ? { id: `${String(name)}-server`, name: "Uploaded image", url: watchedFile, file: watchedFile, type: "image", description: "" }
    : watchedFile) as SharedFileValue | null | undefined;
  const fieldError = errors[name] as { description?: { message?: string } } | undefined;
  const urlField = `${String(name).replace("File", "Url")}` as keyof ProposalStep3Values;

  return (
    <FileUploadField
      projectId={projectId}
      docTypeName={docTypeName}
      title={title}
      accept="image/png,image/jpeg,image/webp"
      value={value}
      showDescription
      descriptionRequired
      descriptionError={fieldError?.description?.message as string | undefined}
      onUploadingChange={onUploadingChange}
      onChange={(uploaded) => {
        if (!uploaded) {
          setValue(name, null as never, { shouldValidate: true });
          setValue(urlField, null as never, { shouldValidate: true });
          return;
        }
        setValue(name, { ...uploaded, file: uploaded.url || uploaded.file || "" } as never, { shouldValidate: true });
        if (uploaded.url) setValue(urlField, uploaded.url as never, { shouldValidate: true });
      }}
    />
  );
};

export const ProposalStep3 = ({
  projectId,
  onUploadingChange,
}: {
  projectId: string;
  onUploadingChange?: (uploading: boolean) => void;
}) => {
  const [uploadingCount, setUploadingCount] = useState(0);
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProposalStep3Values>();

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0);
  }, [onUploadingChange, uploadingCount]);

  const handleChildUploadingChange = (uploading: boolean) => {
    setUploadingCount((count) =>
      Math.max(0, count + (uploading ? 1 : -1)),
    );
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">
        3. สถาปัตยกรรมองค์กร (EA)
      </h2>

      <EAStrategySection />

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label>ระเบียบ/กฎหมาย/ข้อบังคับที่เป็นอุปสรรภูมิ</Label>
          <RichTextarea
            {...register("obstacleLaws")}
            placeholder="ระบุรายละเอียด หรือพิมพ์ 'ไม่มี' (กด Tab เพื่อย่อหน้า)"
            rows={3}
            className="resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label>
            สถาปัตยกรรมด้านระบบสารสนเทศ (Application Architecture){" "}
            <span className="text-status-orange">*</span>
          </Label>
          <RichTextarea
            {...register("appArchitecture")}
            placeholder="อธิบายการทำงานร่วมกันโดยการแลกเปลี่ยนข้อมูล (กด Tab เพื่อย่อหน้า)"
            rows={4}
            className={cn(
              "resize-none",
              errors.appArchitecture &&
                "border-status-orange focus-visible:ring-status-orange",
            )}
          />
          {errors.appArchitecture && (
            <p className="text-sm text-status-orange flex items-center gap-1 mt-1">
              <AlertCircle className="w-4 h-4" />{" "}
              {errors.appArchitecture.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            หน่วยงานเจ้าของข้อมูล <span className="text-status-orange">*</span>
          </Label>
          <Input
            {...register("dataOwner")}
            placeholder="ระบุชื่อหน่วยงาน"
            className={cn(
              errors.dataOwner &&
                "border-status-orange focus-visible:ring-status-orange",
            )}
          />
          {errors.dataOwner && (
            <p className="text-sm text-status-orange flex items-center gap-1 mt-1">
              <AlertCircle className="w-4 h-4" /> {errors.dataOwner.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>
            แนวทางการแลกเปลี่ยน/เชื่อมโยงข้อมูล{" "}
            <span className="text-status-orange">*</span>
          </Label>
          <RichTextarea
            {...register("dataExchangePlan")}
            placeholder="ระบุแนวทางการเชื่อมโยงข้อมูล (กด Tab เพื่อย่อหน้า)"
            rows={4}
            className={cn(
              "resize-none",
              errors.dataExchangePlan &&
                "border-status-orange focus-visible:ring-status-orange",
            )}
          />
          {errors.dataExchangePlan && (
            <p className="text-sm text-status-orange flex items-center gap-1 mt-1">
              <AlertCircle className="w-4 h-4" />{" "}
              {errors.dataExchangePlan.message}
            </p>
          )}
        </div>
      </div>

      {/* --- ส่วนแนบไฟล์ (UI อัปโหลด 1 รูป + คำอธิบาย) --- */}
      <div className="border-t border-border pt-6 mt-2">
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground">
            แนบไฟล์แผนภาพรูปภาพ (Diagrams)
          </h3>
          <p className="text-sm text-slate-gray">
            รองรับ 1 ไฟล์รูปภาพต่อหัวข้อ พร้อมบังคับระบุคำอธิบาย
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SingleFileUploadWithDescBox
            projectId={projectId}
            title="System Diagram"
            docTypeName="system_diagram"
            name="systemDiagramFile"
            watch={watch}
            setValue={setValue}
            errors={errors}
            onUploadingChange={handleChildUploadingChange}
          />
          <SingleFileUploadWithDescBox
            projectId={projectId}
            title="Network Diagram"
            docTypeName="network_diagram"
            name="networkDiagramFile"
            watch={watch}
            setValue={setValue}
            errors={errors}
            onUploadingChange={handleChildUploadingChange}
          />
          <SingleFileUploadWithDescBox
            projectId={projectId}
            title="Use Case Diagram"
            docTypeName="use_case_diagram"
            name="useCaseDiagramFile"
            watch={watch}
            setValue={setValue}
            errors={errors}
            onUploadingChange={handleChildUploadingChange}
          />
          <SingleFileUploadWithDescBox
            projectId={projectId}
            title="Security Diagram"
            docTypeName="security_diagram"
            name="securityDiagramFile"
            watch={watch}
            setValue={setValue}
            errors={errors}
            onUploadingChange={handleChildUploadingChange}
          />
        </div>
      </div>
    </div>
  );
};
