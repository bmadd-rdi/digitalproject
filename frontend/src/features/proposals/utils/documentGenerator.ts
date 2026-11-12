// src/features/proposals/utils/documentGenerator.ts
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { ProposalDraftValues } from "@/features/proposals/types";
import { prepareTemplateData } from "@/features/proposals/utils/template-adapter";

// @ts-expect-error - ImageModule ไม่มี Type definition ของ TypeScript อย่างเป็นทางการ
import ImageModule from "docxtemplater-image-module-free";

const BLANK_IMAGE_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const MAX_IMAGE_WIDTH = 600;

type LoadedImage = { dataUrl: string; width: number; height: number };

const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

/**
 * แหล่งรูปที่เป็นไปได้ (ลองตามลำดับ):
 *  1) attachment.file เป็น File/Blob (เพิ่งเลือกในหน้าจอ)
 *  2) attachment.file เป็นสตริง (data URL หรือ URL ของไฟล์ที่อัปโหลดแล้ว)
 *  3) attachment.file เป็น object ที่มี url/fileUrl/downloadUrl
 *  4) ฟิลด์ *Url ของโครงการ (เมื่อโหลดจากฐานข้อมูล)
 */
const resolveImageSource = (attachment: unknown, fallbackUrl: unknown): Blob | string | null => {
  const file = isRecord(attachment) ? attachment.file : undefined;

  if (typeof Blob !== "undefined" && file instanceof Blob) return file;
  if (typeof file === "string" && file) return file;
  if (isRecord(file)) {
    for (const key of ["url", "fileUrl", "downloadUrl", "previewUrl"]) {
      const candidate = file[key];
      if (typeof candidate === "string" && candidate) return candidate;
    }
  }
  if (isRecord(attachment)) {
    for (const key of ["url", "fileUrl", "downloadUrl"]) {
      const candidate = attachment[key];
      if (typeof candidate === "string" && candidate) return candidate;
    }
  }
  if (typeof fallbackUrl === "string" && fallbackUrl) return fallbackUrl;
  return null;
};

const loadHtmlImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("โหลดรูปภาพไม่สำเร็จ"));
    img.src = src;
  });

/**
 * แปลงรูปทุกชนิดที่เบราว์เซอร์แสดงได้ (PNG/JPG/WebP/GIF) ให้เป็น PNG data URL
 * พร้อมย่อให้พอดีหน้ากระดาษ เพราะ Word ฝัง WebP ไม่ได้
 * คืน null ถ้าโหลดไม่ได้ (เอกสารยังสร้างต่อได้ ไม่ล้มทั้งไฟล์)
 */
const loadImage = async (source: Blob | string | null, label: string): Promise<LoadedImage | null> => {
  if (!source) return null;
  try {
    let dataUrl: string;
    if (typeof source === "string") {
      if (source.startsWith("data:")) {
        dataUrl = source;
      } else {
        const response = await fetch(source, { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        dataUrl = await blobToDataUrl(await response.blob());
      }
    } else {
      dataUrl = await blobToDataUrl(source);
    }

    const img = await loadHtmlImage(dataUrl);
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;
    if (!naturalW || !naturalH) throw new Error("ขนาดรูปไม่ถูกต้อง");

    const scale = naturalW > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / naturalW : 1;
    const width = Math.round(naturalW * scale);
    const height = Math.round(naturalH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("ไม่สามารถสร้าง canvas ได้");
    // พื้นหลังขาว กันรูปโปร่งใสกลายเป็นพื้นดำ
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    return { dataUrl: canvas.toDataURL("image/png"), width, height };
  } catch (error) {
    console.warn(`ไม่สามารถนำรูป "${label}" ลงเอกสารได้:`, error);
    return null;
  }
};

type DiagramSpec = {
  /** ชื่อแท็กรูปในเทมเพลต เช่น systemImage -> {%systemImage} */
  tag: string;
  fileKey: string;
  urlKey: string;
  label: string;
  /** รูปที่เทมเพลตไม่ได้ซ่อนเมื่อว่าง: ใส่รูปว่างแทน / รูปที่เทมเพลตมี {#hasXxx} ครอบ: ซ่อนทั้งหัวข้อ */
  flag?: string;
};

const DIAGRAMS: DiagramSpec[] = [
  { tag: "systemImage", fileKey: "systemDiagramFile", urlKey: "systemDiagramUrl", label: "System Diagram" },
  { tag: "networkImage", fileKey: "networkDiagramFile", urlKey: "networkDiagramUrl", label: "Network Diagram" },
  { tag: "useCaseImage", fileKey: "useCaseDiagramFile", urlKey: "useCaseDiagramUrl", label: "Use Case Diagram" },
  { tag: "securityImage", fileKey: "securityDiagramFile", urlKey: "securityDiagramUrl", label: "Security Diagram" },
  { tag: "erImage", fileKey: "erDiagramFile", urlKey: "erDiagramUrl", label: "ER Diagram", flag: "hasErImage" },
  { tag: "dfdImage", fileKey: "dataFlowDiagramFile", urlKey: "dataFlowDiagramUrl", label: "Data Flow Diagram", flag: "hasDfdImage" },
  { tag: "currentImage", fileKey: "currentDiagramFile", urlKey: "currentDiagramUrl", label: "Current System Diagram", flag: "hasCurrentImage" },
];

export type GenerateProposalDocxOptions = {
  /** ใช้เมื่อ formData.agencyName ว่าง */
  agencyNameFallback?: string;
  /** ชื่อหน่วยงาน/ส่วนราชการ ที่แปลงจาก department_id / division_id แล้ว (แท็ก {departmentName} {divisionName}) */
  departmentName?: string;
  divisionName?: string;
};

export const generateProposalDocx = async (
  formData: ProposalDraftValues,
  options: GenerateProposalDocxOptions = {},
) => {
  try {
    const response = await fetch("/templates/project-proposal.docx");

    if (!response.ok) {
      throw new Error(`ดาวน์โหลด Template ไม่สำเร็จ (Status: ${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    const source = formData as unknown as Record<string, unknown>;
    const imageDimensions: Record<string, { width: number; height: number }> = {};
    const imageData: Record<string, string | boolean> = {};
    const failedImages: string[] = [];

    await Promise.all(
      DIAGRAMS.map(async (spec) => {
        const attachment = source[spec.fileKey];
        const hadSource = resolveImageSource(attachment, source[spec.urlKey]);
        const loaded = await loadImage(hadSource, spec.label);

        if (hadSource && !loaded) failedImages.push(spec.label);

        const description =
          isRecord(attachment) && typeof attachment.description === "string" && attachment.description.trim()
            ? attachment.description
            : "-";

        imageData[spec.tag] = loaded ? loaded.dataUrl : BLANK_IMAGE_BASE64;
        imageData[`${spec.tag}Desc`] = loaded ? description : "-";
        if (loaded) imageDimensions[spec.tag] = { width: loaded.width, height: loaded.height };
        if (spec.flag) imageData[spec.flag] = !!loaded;
      }),
    );

    const imageOptions = {
      centered: true,
      getImage: function (tagValue: string): ArrayBuffer {
        try {
          const value = !tagValue || typeof tagValue !== "string" ? BLANK_IMAGE_BASE64 : tagValue;
          const base64Data = value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
          const binaryString = window.atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes.buffer;
        } catch (err) {
          console.error("Error converting image:", err);
          return new ArrayBuffer(0);
        }
      },
      getSize: function (img: ArrayBuffer, tagValue: string, tagName: string): [number, number] {
        if (img.byteLength === 0 || tagValue === BLANK_IMAGE_BASE64) return [1, 1];
        const dim = imageDimensions[tagName];
        return dim ? [dim.width, dim.height] : [400, 300];
      },
    };

    const imageModule = new ImageModule(imageOptions);

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule],
      nullGetter: function () {
        return "";
      },
    });

    const baseTemplateData = prepareTemplateData(formData);

    const finalTemplateData = {
      ...baseTemplateData,
      agencyName: formData.agencyName?.trim() ? formData.agencyName : (options.agencyNameFallback ?? ""),
      departmentName: options.departmentName ?? "",
      divisionName: options.divisionName ?? "",
      totalBudgetFormatted: formData.totalBudget
        ? new Intl.NumberFormat("th-TH").format(formData.totalBudget)
        : "0.00",
      budgets: formData.budgetsByYear?.map(b => ({
        year: b.year,
        amount: new Intl.NumberFormat("th-TH").format(b.amount)
      })) || [],
      currentDate: new Date().toLocaleDateString("th-TH", {
        year: "numeric", month: "long", day: "numeric"
      }),
      ...imageData,
    };

    doc.render(finalTemplateData);

    const output = doc.getZip().generate({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const fileName = formData.projectName
      ? `แบบเสนอโครงการ_${formData.projectName}.docx`
      : "แบบเสนอโครงการ.docx";

    saveAs(output, fileName);

    return {
      success: true,
      // รูปที่มีไฟล์แต่โหลดไม่สำเร็จ (ให้ผู้เรียกแจ้งผู้ใช้ได้)
      failedImages,
    } as { success: boolean; error?: string; failedImages: string[] };
  } catch (error) {
    console.error("Error generating document:", error);
    return { success: false, error: String(error), failedImages: [] as string[] } as {
      success: boolean;
      error?: string;
      failedImages: string[];
    };
  }
};
