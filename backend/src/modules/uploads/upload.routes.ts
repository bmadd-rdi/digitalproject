import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { deleteUploadedFile, getUploadedFile, uploadDocument } from "./upload.controller";
import {
  UploadDocumentRequestSchema,
  UploadDocumentResponseSchema,
  UploadErrorSchema,
  UploadedFileParamsSchema,
  DeleteUploadedFileParamsSchema,
} from "./upload.schema";
import { authMiddleware } from "../../middlewares/auth.middleware";

const uploadRoutes = new OpenAPIHono();
uploadRoutes.use("*", authMiddleware);

const getUploadedFileRoute = createRoute({
  method: "get",
  path: "/files/{fileName}",
  tags: ["Uploads"],
  summary: "Download or preview an uploaded project file",
  request: { params: UploadedFileParamsSchema },
  responses: {
    200: { description: "Uploaded file" },
    404: {
      description: "Uploaded file not found",
      content: { "application/json": { schema: UploadErrorSchema } },
    },
  },
});

uploadRoutes.openapi(getUploadedFileRoute, (c) => getUploadedFile(c));

const uploadDocumentRoute = createRoute({
  method: "post",
  path: "/document",
  tags: ["Uploads"],
  summary: "Upload, optimize, and store a project document",
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UploadDocumentRequestSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Upload successful",
      content: {
        "application/json": { schema: UploadDocumentResponseSchema },
      },
    },
    400: {
      description: "Missing file/project ID or invalid file type for the document category",
      content: {
        "application/json": { schema: UploadErrorSchema },
      },
    },
    403: {
      description: "The authenticated user cannot upload for this project",
      content: {
        "application/json": { schema: UploadErrorSchema },
      },
    },
    404: {
      description: "Project not found",
      content: {
        "application/json": { schema: UploadErrorSchema },
      },
    },
    409: {
      description: "Uploads are locked for the current project stage",
      content: {
        "application/json": { schema: UploadErrorSchema },
      },
    },
    413: {
      description: "File exceeds the supported size limit",
      content: {
        "application/json": { schema: UploadErrorSchema },
      },
    },
  },
});

uploadRoutes.openapi(uploadDocumentRoute, (c) => uploadDocument(c));

const deleteUploadedFileRoute = createRoute({
  method: "delete",
  path: "/files/{fileId}",
  tags: ["Uploads"],
  summary: "Delete a project attachment",
  request: { params: DeleteUploadedFileParamsSchema },
  responses: {
    200: {
      description: "File deleted",
      content: { "application/json": { schema: UploadErrorSchema } },
    },
    403: {
      description: "The authenticated user cannot delete this file",
      content: { "application/json": { schema: UploadErrorSchema } },
    },
    404: {
      description: "File not found",
      content: { "application/json": { schema: UploadErrorSchema } },
    },
    409: {
      description: "File management is locked for the current project stage",
      content: { "application/json": { schema: UploadErrorSchema } },
    },
  },
});

uploadRoutes.openapi(deleteUploadedFileRoute, (c) => deleteUploadedFile(c));

export default uploadRoutes;
