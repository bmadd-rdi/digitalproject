import { and, eq, isNull } from "drizzle-orm";
import { basename, join } from "node:path";
import { db } from "../index";
import { projectAttachments } from "../schema/projects";

const uploadStorageDir =
  process.env.UPLOAD_STORAGE_DIR ?? join(process.cwd(), "uploads");

async function backfillAttachmentSizes() {
  const attachments = await db
    .select({
      id: projectAttachments.id,
      fileUrl: projectAttachments.fileUrl,
    })
    .from(projectAttachments)
    .where(isNull(projectAttachments.fileSize));

  let updated = 0;
  let unavailable = 0;

  for (const attachment of attachments) {
    const rawName = attachment.fileUrl.split("/").pop() ?? "";
    const fileName = decodeURIComponent(rawName);
    if (!fileName || basename(fileName) !== fileName) {
      unavailable += 1;
      continue;
    }

    const file = Bun.file(join(uploadStorageDir, fileName));
    if (!(await file.exists())) {
      unavailable += 1;
      continue;
    }

    await db
      .update(projectAttachments)
      .set({ fileSize: file.size })
      .where(
        and(
          eq(projectAttachments.id, attachment.id),
          isNull(projectAttachments.fileSize),
        ),
      );
    updated += 1;
  }

  console.log(
    `Attachment size backfill complete: ${updated} updated, ${unavailable} unavailable`,
  );
}

try {
  await backfillAttachmentSizes();
} finally {
  await db.$client.end();
}
