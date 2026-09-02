"use server";

import { serverFetch } from "@/lib/server-fetch";
import { schemas } from "@/types/api-schemas";
import { z } from "zod";

type LookupResponse = z.infer<
  typeof schemas.ProjectAttachmentTypeLookupResponse
>;

export async function getProjectAttachmentTypesAction(): Promise<LookupResponse> {
  return serverFetch<LookupResponse>("/api/v1/lookups/project-attachment-types", {
    skipToken: true,
  });
}
