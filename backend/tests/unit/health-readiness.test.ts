import { expect, test } from "bun:test";
import { mkdir, readdir, rm } from "node:fs/promises";
import { join } from "node:path";

test("readiness upload probe is exclusive and cleans up its temporary file", async () => {
  const directory = join(process.cwd(), `.readiness-probe-${crypto.randomUUID()}`);
  await mkdir(directory, { recursive: true });

  try {
    const { verifyUploadStorage } = await import("../../src/modules/health/health.routes");
    await verifyUploadStorage(directory);
    expect(await readdir(directory)).toEqual([]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("readiness fails when the upload directory is unavailable", async () => {
  const directory = join(process.cwd(), `.missing-readiness-${crypto.randomUUID()}`);
  const { verifyUploadStorage } = await import("../../src/modules/health/health.routes");
  await expect(verifyUploadStorage(directory)).rejects.toBeDefined();
});
