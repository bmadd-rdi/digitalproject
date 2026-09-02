import { sql } from "drizzle-orm";
import { db } from "../index";
import { projectAttachments, projectAttachmentTypes } from "../schema";
import { seedData } from "../seeds/seed-data";

function assertDevelopmentResetIsAllowed() {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Attachment type reset is allowed only when NODE_ENV=development.");
  }
  if (process.env.ALLOW_ATTACHMENT_TYPE_RESET !== "true") {
    throw new Error(
      "Set ALLOW_ATTACHMENT_TYPE_RESET=true to confirm deletion of development attachments.",
    );
  }
}

async function resetAttachmentTypes() {
  assertDevelopmentResetIsAllowed();

  await db.transaction(async (tx) => {
    await tx.delete(projectAttachments);
    await tx.delete(projectAttachmentTypes);
    await tx.insert(projectAttachmentTypes).values([...seedData.projectAttachmentTypes]);
    await tx.execute(sql`
      SELECT setval(
        pg_get_serial_sequence('project_attachment_types', 'doc_type_id'),
        GREATEST((SELECT MAX("doc_type_id") FROM "project_attachment_types"), 1),
        true
      )
    `);
  });

  console.log("Project attachment types and development attachments were reset.");
}

resetAttachmentTypes().catch((error) => {
  console.error("Attachment type reset failed:", error);
  process.exitCode = 1;
});
