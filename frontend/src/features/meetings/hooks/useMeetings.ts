"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Meeting, MeetingStatus } from "../types";
import { CLIENT_API_BASE } from "@/lib/client-api";

const API_BASE = CLIENT_API_BASE;

type ApiMeeting = {
  id: string;
  meetingNo: string;
  title: string;
  meetingTypeId: number;
  meetingDate: string;
  location?: string | null;
  meetingStatusId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  unresolvedResolutionCount?: number;
  creator?: { userId: string; firstName: string; lastName: string } | null;
  meetingStatus?: { id: number; code?: string | null; name: string } | null;
  meetingType?: { id: number; code?: string | null; name: string } | null;
};

export type CreateMeetingPayload = {
  meetingNo: string;
  title: string;
  meetingTypeId: number;
  meetingDate: string;
  location?: string | null;
  description?: string | null;
  startTime?: string;
  endTime?: string | null;
  meetingStatusId?: number;
};

export type UpdateMeetingPayload = Partial<CreateMeetingPayload>;
export type MeetingFilterStatus = MeetingStatus | "ALL";
export type MeetingListPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw Object.assign(new Error(payload.message ?? payload.error ?? "Meeting request failed"), {
      status: response.status,
      data: payload,
    });
  }
  return payload as T;
}

function statusFromId(id: number): MeetingStatus {
  switch (id) {
    case 1: return MeetingStatus.SCHEDULED;
    case 2: return MeetingStatus.IN_PROGRESS;
    case 3: return MeetingStatus.COMPLETED;
    case 4: return MeetingStatus.CANCELLED;
    default: return MeetingStatus.DRAFT;
  }
}

function statusFromApi(meeting: ApiMeeting): MeetingStatus {
  const code = meeting.meetingStatus?.code;
  return code && Object.values(MeetingStatus).includes(code as MeetingStatus)
    ? code as MeetingStatus
    : statusFromId(meeting.meetingStatusId ?? 5);
}

export function normalizeMeeting(meeting: ApiMeeting): Meeting {
  const creatorName = meeting.creator
    ? `${meeting.creator.firstName} ${meeting.creator.lastName}`.trim()
    : "-";

  return {
    meeting_id: meeting.id,
    meeting_no: meeting.meetingNo,
    title: meeting.title,
    meeting_date: meeting.meetingDate,
    location: meeting.location ?? "-",
    chairman: creatorName || "-",
    meeting_status: statusFromApi(meeting),
    meeting_status_id: meeting.meetingStatusId,
    meeting_type_id: meeting.meetingTypeId,
    meeting_type: meeting.meetingType?.code === "BIG_BOARD" ? "BIG_BOARD" : "SMALL_BOARD",
    unresolved_resolution_count: meeting.unresolvedResolutionCount ?? 0,
    created_by: meeting.createdBy,
    updated_at: meeting.updatedAt,
  };
}

async function fetchMeetings(searchQuery: string, filterStatus: MeetingFilterStatus, page: number, limit: number) {
  const params = new URLSearchParams();
  const search = searchQuery.trim();
  if (search) params.set("search", search);
  if (filterStatus !== "ALL") params.set("status", filterStatus);
  params.set("page", String(page));
  params.set("limit", String(limit));
  const query = params.toString();
  const response = await request<{ data: ApiMeeting[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }>(
    `/meetings?${query}`,
  );
  return {
    meetings: response.data.map(normalizeMeeting),
    pagination: response.pagination ?? { page, limit, total: response.data.length, totalPages: 1 },
  };
}

async function fetchMeeting(id: string) {
  const response = await request<{ data: ApiMeeting }>(`/meetings/${id}`);
  return normalizeMeeting(response.data);
}

export function useMeetings() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<MeetingFilterStatus>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const updateSearchQuery = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);
  const updateFilterStatus = useCallback((value: MeetingFilterStatus) => {
    setFilterStatus(value);
    setPage(1);
  }, []);
  const query = useQuery({
    queryKey: ["meetings", { search: searchQuery.trim(), status: filterStatus, page, limit: pageSize }],
    queryFn: () => fetchMeetings(searchQuery, filterStatus, page, pageSize),
    staleTime: 30_000,
    refetchOnMount: "always",
  });

  const meetings = useMemo(() => query.data?.meetings ?? [], [query.data?.meetings]);
  const filteredMeetings = useMemo(() => meetings, [meetings]);

  const getMeetingById = useCallback(
    (id: string) => meetings.find((meeting) => meeting.meeting_id === id),
    [meetings],
  );

  return {
    meetings,
    filteredMeetings,
    searchQuery,
    filterStatus,
    setSearchQuery: updateSearchQuery,
    setFilterStatus: updateFilterStatus,
    page,
    setPage,
    pagination: query.data?.pagination ?? { page, limit: pageSize, total: 0, totalPages: 0 },
    getMeetingById,
    ...query,
  };
}

export function useMeeting(id: string | undefined) {
  return useQuery({
    queryKey: ["meetings", id],
    queryFn: () => fetchMeeting(id!),
    enabled: !!id,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMeetingPayload) =>
      request<{ data: ApiMeeting }>("/meetings", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useUpdateMeeting(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateMeetingPayload) =>
      request<{ data: ApiMeeting }>(`/meetings/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: async (response) => {
      queryClient.setQueryData(["meetings", id], normalizeMeeting(response.data));
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useDeleteMeeting(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => request(`/meetings/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meetings"] }),
        queryClient.removeQueries({ queryKey: ["meetings", id] }),
        queryClient.removeQueries({ queryKey: ["meetings", id, "agendas"] }),
      ]);
    },
  });
}

export function useTransitionMeeting(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED") =>
      request<{ data: ApiMeeting }>(`/meetings/${id}/status`, {
        method: "POST",
        body: JSON.stringify({ status }),
      }),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meetings"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", id] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", id, "eligible-projects"] }),
      ]);
    },
  });
}

export function useCancelMeeting(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) => request<{ data: ApiMeeting }>(`/meetings/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["meetings"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", id] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", id, "agendas"] }),
        queryClient.invalidateQueries({ queryKey: ["meetings", id, "eligible-projects"] }),
      ]);
    },
  });
}
