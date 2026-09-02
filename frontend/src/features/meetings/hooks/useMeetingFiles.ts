"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CLIENT_API_BASE } from "@/lib/client-api";

export type MeetingFile = {
  id: string;
  meetingId: string;
  documentType: "MEETING_DOCUMENT" | "MEETING_MINUTES";
  originalFileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

export type MeetingFilePolicy = {
  acceptedExtensions: string[];
  acceptedMimeTypes: string[];
  limits: { pdfBytes: number; imageBytes: number; documentBytes: number };
};

async function parse(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(payload.message ?? "ไม่สามารถจัดการเอกสารการประชุมได้"), {
      status: response.status,
    });
  }
  return payload;
}

export function useMeetingFiles(meetingId: string) {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryKey = ["meetings", meetingId, "files"];
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await fetch(`${CLIENT_API_BASE}/meetings/${meetingId}/files`, {
        credentials: "include",
      });
      return (await parse(response)).data as MeetingFile[];
    },
  });
  const policyQuery = useQuery({
    queryKey: ["meetings", meetingId, "files", "policy"],
    queryFn: async () => {
      const response = await fetch(`${CLIENT_API_BASE}/meetings/${meetingId}/files/policy`, { credentials: "include" });
      return (await parse(response)).data as MeetingFilePolicy;
    },
    enabled: !!meetingId,
    staleTime: 5 * 60_000,
  });
  const upload = useMutation({
    mutationFn: async ({ file, documentType }: {
      file: File;
      documentType: MeetingFile["documentType"];
    }) => new Promise<unknown>((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${CLIENT_API_BASE}/meetings/${meetingId}/files`);
      xhr.withCredentials = true;
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100));
      };
      xhr.onload = () => {
        const payload = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) resolve(payload);
        else reject(Object.assign(new Error(payload.message ?? payload.error ?? "ไม่สามารถอัปโหลดไฟล์ได้"), { status: xhr.status }));
      };
      xhr.onerror = () => reject(new Error("ไม่สามารถเชื่อมต่อเพื่ออัปโหลดไฟล์ได้"));
      xhr.send(formData);
    }),
    onMutate: () => setUploadProgress(0),
    onSettled: () => {
      setUploadProgress(0);
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const remove = useMutation({
    mutationFn: (fileId: string) => fetch(
      `${CLIENT_API_BASE}/meetings/${meetingId}/files/${fileId}`,
      { method: "DELETE", credentials: "include" },
    ).then(parse),
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
  return {
    ...query,
    files: query.data ?? [],
    policy: policyQuery.data,
    isPolicyLoading: policyQuery.isLoading,
    uploadFile: upload.mutateAsync,
    deleteFile: remove.mutateAsync,
    isUploading: upload.isPending,
    uploadProgress,
    uploadError: upload.error,
    isDeleting: remove.isPending,
  };
}
