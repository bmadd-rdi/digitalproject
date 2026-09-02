import { join } from "path";
import { unlink } from "node:fs/promises";
import { tmpdir } from "os";

/**
 * ฟังก์ชันบีบอัด PDF ด้วย Ghostscript บน Bun
 * @param inputFileBuffer - ไฟล์ PDF ดิบแบบ ArrayBuffer
 * @param quality - ระดับการบีบอัด (/screen = เล็กสุดแต่ภาพแตก, /ebook = กลางๆ แนะนำ, /printer = ชัดมาก)
 * @returns ArrayBuffer ของไฟล์ที่บีบอัดแล้ว
 */
export async function compressPdf(
  inputFileBuffer: ArrayBuffer,
  quality: "/screen" | "/ebook" | "/printer" = "/ebook"
): Promise<ArrayBuffer> {
  // 1. สร้างชื่อไฟล์สุ่มชั่วคราว เพื่อป้องกันการอัปโหลดพร้อมกันแล้วไฟล์ทับกัน
  const uniqueId = crypto.randomUUID();
  const inputPath = join(tmpdir(), `input-${uniqueId}.pdf`);
  const outputPath = join(tmpdir(), `output-${uniqueId}.pdf`);

  try {
    // 2. เขียน Buffer ลงไฟล์ชั่วคราว (ใช้ Bun.write จะเร็วมาก)
    await Bun.write(inputPath, inputFileBuffer);

    // 3. ใช้ Bun.spawn เรียก Ghostscript
    const proc = Bun.spawn([
      "gs",
      "-sDEVICE=pdfwrite",
      "-dCompatibilityLevel=1.4",
      `-dPDFSETTINGS=${quality}`, // ปรับระดับความคมชัดตรงนี้
      "-dNOPAUSE",
      "-dQUIET",
      "-dBATCH",
      `-sOutputFile=${outputPath}`,
      inputPath,
    ]);

    // รอจนกว่า Ghostscript จะทำงานเสร็จ
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      throw new Error("Ghostscript process failed");
    }

    // 4. อ่านไฟล์ที่บีบอัดเสร็จแล้วกลับมาเป็น Buffer
    const compressedFile = Bun.file(outputPath);
    const compressedBuffer = await compressedFile.arrayBuffer();

    return compressedBuffer;

  } catch (error) {
    console.error("PDF Compression Error:", error);
    throw error;
  } finally {
    // 5. สำคัญมาก! ต้องลบไฟล์ชั่วคราวทิ้งเสมอ ป้องกัน Docker Disk เต็ม
    await Promise.all([
      unlink(inputPath).catch(() => {}), // catch ไว้เผื่อไฟล์ไม่มีแต่แรก
      unlink(outputPath).catch(() => {}),
    ]);
  }
}