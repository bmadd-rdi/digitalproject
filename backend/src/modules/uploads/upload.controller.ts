import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { getUserContext } from "../../shared/http/controller-helper";
import { getAppServices } from "../../shared/app/services";
import {
  UploadService,
  UploadTypeValidationError,
  UploadValidationError,
} from "./upload.service";

export const uploadDocument = async (c: Context) => {
  const user = getUserContext(c);
  const body = await c.req.parseBody();
  const file = body.file as File | undefined;
  const projectId = typeof body.projectId === "string" ? body.projectId : undefined;
  const docTypeName = typeof body.docTypeName === "string" ? body.docTypeName.trim() : undefined;
  const description = typeof body.description === "string" ? body.description : undefined;

  if (!file || !projectId || !docTypeName || typeof body.docTypeId === "string") {
    return c.json({ error: "File, projectId, and docTypeName are required" }, 400);
  }

  try {
    const result = await UploadService.uploadDocument(
      file,
      projectId,
      user,
      docTypeName,
      description,
      getAppServices(c).pdfCompressor,
    );
    return c.json(
      {
        success: true,
        message: "File compressed and uploaded successfully",
        data: result,
      },
      201,
    );
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return c.json({ error: error.message }, 413);
    }
    if (error instanceof UploadTypeValidationError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
};

export const deleteUploadedFile = async (c: Context) => {
  const user = getUserContext(c);
  const fileId = c.req.param("fileId");
  if (!fileId) throw new HTTPException(400, { message: "File ID is required" });
  await UploadService.deleteDocument(fileId, user);
  return c.json({ success: true, message: "File deleted successfully" }, 200);
};

export const getUploadedFile = async (c: Context) => {
  const fileName = c.req.param("fileName");
  if (!fileName) throw new HTTPException(400, { message: "File name is required" });
  const result = await UploadService.getStoredDocument(fileName);
  const canRenderInline = result.contentType.startsWith("image/") || result.contentType === "application/pdf";
  return new Response(result.file, {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Content-Disposition": `${canRenderInline ? "inline" : "attachment"}; filename="${result.fileName.replace(/"/g, "")}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
};
