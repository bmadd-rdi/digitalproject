import type { ProjectAttachmentTypeResponse } from "../types/project-attachment-type";
import { CLIENT_API_BASE } from "@/lib/client-api";

export async function fetchProjectAttachmentTypesFromBrowser(): Promise<ProjectAttachmentTypeResponse> {
  const response = await fetch(
    `${CLIENT_API_BASE}/lookups/project-attachment-types`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      payload.message ??
        payload.error ??
        `ไม่สามารถโหลดประเภทเอกสารได้ (${response.status})`,
    );
  }

  if (!Array.isArray(payload.data)) {
    throw new Error("รูปแบบข้อมูลประเภทเอกสารจากระบบไม่ถูกต้อง");
  }

  return payload as ProjectAttachmentTypeResponse;
}
