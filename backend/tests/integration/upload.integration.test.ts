import { expect, test } from "bun:test";
import { unlink } from "node:fs/promises";
import { getIntegrationContext } from "../setup/integration";

test("PDF upload uses the injectable compressor and falls back safely on failure", async () => {
  const context = await getIntegrationContext();
  const { UploadService } = await import("../../src/modules/uploads/upload.service");
  const original = new Uint8Array(32).fill(7);
  const file = new File([original], "test-document.pdf", { type: "application/pdf" });
  const createdPaths: string[] = [];

  try {
    context.pdfCompressor.shouldFail = false;
    context.pdfCompressor.compressedBytes = new ArrayBuffer(2);
    const compressed = await UploadService.processAndUploadDocument(file, context.pdfCompressor);
    createdPaths.push(compressed.storagePath);
    expect(compressed.compressionApplied).toBe(true);
    expect(compressed.fileSize).toBe(2);
    expect(context.pdfCompressor.calls.length).toBeGreaterThan(0);

    context.pdfCompressor.shouldFail = true;
    const fallback = await UploadService.processAndUploadDocument(file, context.pdfCompressor);
    createdPaths.push(fallback.storagePath);
    expect(fallback.compressionApplied).toBe(false);
    expect(fallback.fileSize).toBe(original.byteLength);
  } finally {
    await Promise.all(createdPaths.map((path) => unlink(path).catch(() => undefined)));
    context.pdfCompressor.shouldFail = false;
  }
});
