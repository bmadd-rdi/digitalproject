import { z } from "@hono/zod-openapi";

export const UploadDocumentRequestSchema = z
  .object({
    file: z.instanceof(File).openapi({
      type: "string",
      format: "binary",
      description: "Project document to upload",
    }),
    projectId: z.string().uuid().openapi({
      description: "Project that owns the uploaded document",
    }),
    docTypeName: z.string().trim().min(1).max(255).openapi({
      description: "Project attachment type name from the project attachment lookup",
    }),
    description: z.string().max(2000).optional().openapi({
      description: "Optional description for the uploaded attachment",
    }),
  })
  .openapi("UploadDocumentRequest");

export const UploadResultSchema = z.object({
  attachmentId: z.string().uuid(),
  docTypeId: z.number().int(),
  docTypeName: z.string(),
  fileName: z.string(),
  storedFileName: z.string(),
  fileSize: z.number(),
  contentType: z.string(),
  compressionApplied: z.boolean(),
  url: z.string().url(),
  canDelete: z.boolean(),
  uploader: z.object({
    userId: z.string().uuid(),
    firstName: z.string(),
    lastName: z.string(),
  }).nullable(),
});

export const UploadDocumentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: UploadResultSchema,
});

export const UploadErrorSchema = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
});

export const UploadedFileParamsSchema = z.object({
  fileName: z.string().min(1),
});

export const DeleteUploadedFileParamsSchema = z.object({
  fileId: z.string().uuid(),
});

export type UploadDocumentDTO = z.infer<typeof UploadDocumentRequestSchema>;
