import { useQuery } from "@tanstack/react-query";
import { getLoginHistoryAction } from "../actions/user.actions";

/** ดึงประวัติการเข้าสู่ระบบของผู้ใช้ปัจจุบัน (ใช้แสดงผลในหน้าโปรไฟล์) */
export function useLoginHistory() {
  return useQuery({
    queryKey: ["loginHistory"],
    queryFn: () => getLoginHistoryAction(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
