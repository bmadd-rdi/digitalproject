// src/lib/documentGenerator.ts
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";
import { ProposalDraftValues } from "@/features/proposals/types";
import { prepareTemplateData } from "@/features/proposals/utils/template-adapter";

// @ts-expect-error - ImageModule ไม่มี Type definition ของ TypeScript อย่างเป็นทางการ
import ImageModule from "docxtemplater-image-module-free";

const fileToBase64 = (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const attachmentToBase64 = async (attachment: unknown): Promise<string> => {
  if (typeof Blob !== "undefined" && attachment instanceof Blob) {
    return fileToBase64(attachment);
  }

  if (typeof attachment === "string") {
    if (attachment.startsWith("data:")) return attachment;

    const response = await fetch(attachment, { credentials: "include" });
    if (!response.ok) {
      throw new Error(`Unable to load image attachment (${response.status})`);
    }
    return fileToBase64(await response.blob());
  }

  throw new Error("Image attachment is not a File or URL");
};

// อ่านขนาด Original ของภาพจาก Base64 (รันบน Browser)
const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 }); // Fallback กรณีโหลดภาพล้มเหลว
    img.src = base64;
  });
};

// คำนวณสัดส่วนภาพไม่ให้ล้น A4 (สมมติจำกัดกว้างสุด 600px)
const calculateScaledDimensions = (originalW: number, originalH: number, maxWidth = 600): [number, number] => {
  if (originalW === 0 || originalH === 0) return [1, 1];
  if (originalW <= maxWidth) return [originalW, originalH]; // ถ้าภาพเล็กกว่า A4 อยู่แล้ว ให้ใช้ขนาดจริง
  const scale = maxWidth / originalW;
  return [maxWidth, Math.round(originalH * scale)];
};

const getBlankImageBase64 = (): string => {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
};

export const generateProposalDocx = async (formData: ProposalDraftValues) => {
  try {
    const response = await fetch("/templates/project-proposal.docx");

    if (!response.ok) {
      throw new Error(`ดาวน์โหลด Template ไม่สำเร็จ (Status: ${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const zip = new PizZip(arrayBuffer);
    const blankImageBase64 = getBlankImageBase64();

    // สร้าง Object ไว้เก็บขนาด Original ของแต่ละภาพ
    const imageDimensions: Record<string, { width: number; height: number }> = {};

    let systemImageBase64 = blankImageBase64;
    if (formData.systemDiagramFile?.file) {
      systemImageBase64 = await attachmentToBase64(formData.systemDiagramFile.file);
      imageDimensions["systemImage"] = await getImageDimensions(systemImageBase64);
    }

    let networkImageBase64 = blankImageBase64;
    if (formData.networkDiagramFile?.file) {
      networkImageBase64 = await attachmentToBase64(formData.networkDiagramFile.file);
      imageDimensions["networkImage"] = await getImageDimensions(networkImageBase64);
    }

    let useCaseImageBase64 = blankImageBase64;
    if (formData.useCaseDiagramFile?.file) {
      useCaseImageBase64 = await attachmentToBase64(formData.useCaseDiagramFile.file);
      imageDimensions["useCaseImage"] = await getImageDimensions(useCaseImageBase64);
    }

    let securityImageBase64 = blankImageBase64;
    if (formData.securityDiagramFile?.file) {
      securityImageBase64 = await attachmentToBase64(formData.securityDiagramFile.file);
      imageDimensions["securityImage"] = await getImageDimensions(securityImageBase64);
    }

    const imageOptions = {
      centered: true,
      getImage: function (tagValue: string): ArrayBuffer {
        try {
          if (!tagValue || typeof tagValue !== 'string') {
             tagValue = blankImageBase64;
          }

          const base64Data = tagValue.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
          const binaryString = window.atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes.buffer;
        } catch (err) {
           console.error("Error converting image:", err);
           return new ArrayBuffer(0);
        }
      },
      getSize: function (img: ArrayBuffer, tagValue: string, tagName: string): [number, number] {
        if (img.byteLength === 0 || tagValue === blankImageBase64) return [1, 1];

        // ดึงสัดส่วนภาพที่คำนวณเก็บไว้มาใช้งาน แล้ว Scale ให้พอดีหน้ากระดาษ (600px)
        const dim = imageDimensions[tagName];
        if (dim) {
          return calculateScaledDimensions(dim.width, dim.height, 600);
        }

        return [400, 300]; // ค่าดีฟอลต์เผื่อฉุกเฉิน
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
      totalBudgetFormatted: formData.totalBudget
        ? new Intl.NumberFormat('th-TH').format(formData.totalBudget)
        : "0.00",
      budgets: formData.budgetsByYear?.map(b => ({
        year: b.year,
        amount: new Intl.NumberFormat('th-TH').format(b.amount)
      })) || [],
      currentDate: new Date().toLocaleDateString('th-TH', {
        year: 'numeric', month: 'long', day: 'numeric'
      }),

      systemImage: systemImageBase64,
      systemImageDesc: formData.systemDiagramFile?.description || "-",

      networkImage: networkImageBase64,
      networkImageDesc: formData.networkDiagramFile?.description || "-",

      useCaseImage: useCaseImageBase64,
      useCaseImageDesc: formData.useCaseDiagramFile?.description || "-",

      securityImage: securityImageBase64,
      securityImageDesc: formData.securityDiagramFile?.description || "-",
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

    return { success: true };
  } catch (error) {
    console.error("Error generating document:", error);
    return { success: false, error: String(error) };
  }
};
