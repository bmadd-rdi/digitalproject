"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectAttachmentTypesAction } from "../actions/project-attachment.actions";
import { fetchProjectAttachmentTypesFromBrowser } from "../api/project-attachment-types.api";
import type {
  ProjectAttachmentType,
  ProjectAttachmentTypeResponse,
  ProjectAttachmentTypeName,
} from "../types/project-attachment-type";

const QUERY_KEY = ["lookups", "project-attachment-types"] as const;

function hasLookupData(response: ProjectAttachmentTypeResponse) {
  return Array.isArray(response.data) && response.data.length > 0;
}

export function useProjectAttachmentTypes() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      let serverActionError: unknown;

      try {
        const response = await getProjectAttachmentTypesAction();
        if (hasLookupData(response)) return response;
      } catch (error) {
        serverActionError = error;
      }

      try {
        const response = await fetchProjectAttachmentTypesFromBrowser();
        if (hasLookupData(response)) return response;
        throw new Error("ไม่พบข้อมูลประเภทเอกสารจากระบบ");
      } catch (browserError) {
        if (browserError instanceof Error) throw browserError;
        if (serverActionError instanceof Error) throw serverActionError;
        throw new Error("ไม่สามารถโหลดประเภทเอกสารได้");
      }
    },
    staleTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnMount: "always",
  });

  const types = query.data?.data ?? [];
  const typeIds = new Map(
    types.map((type: ProjectAttachmentType) => [type.name, type.id]),
  );

  return {
    ...query,
    types,
    getTypeId: (name: ProjectAttachmentTypeName) => typeIds.get(name),
  };
}
