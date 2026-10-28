import { useQuery } from "@tanstack/react-query";
import {
  getFourQuadrantsAction,
  getDeputyGovernorsAction,
  getDepartmentsAction,
  getRolesAction,
  getDivisionsAction,
  getProjectTypesAction,
  getBudgetTypesAction,
  getAnalystsLookupAction,
} from "../actions/lookup.actions";

// ตั้งค่า Stale Time ฝั่ง Client (เช่น 24 ชั่วโมง ให้สอดคล้องกับ Backend)
const STALE_TIME = 1000 * 60 * 60 * 24;

export function useFourQuadrants() {
  return useQuery({
    queryKey: ["lookups", "fourQuadrants"],
    queryFn: () => getFourQuadrantsAction(),
    staleTime: STALE_TIME,
  });
}

export function useDeputyGovernors() {
  return useQuery({
    queryKey: ["lookups", "deputyGovernors"],
    queryFn: () => getDeputyGovernorsAction(),
    staleTime: STALE_TIME,
  });
}

export function useDepartments() {
  return useQuery({
    queryKey: ["lookups", "departments"],
    queryFn: () => getDepartmentsAction(),
    staleTime: STALE_TIME,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["lookups", "roles"],
    queryFn: () => getRolesAction(),
    staleTime: STALE_TIME,
  });
}

// Hook นี้จะดึงข้อมูลใหม่ทุกครั้งที่ departmentId เปลี่ยนแปลง
export function useDivisions(departmentId?: number) {
  return useQuery({
    queryKey: ["lookups", "divisions", departmentId],
    queryFn: () => getDivisionsAction(departmentId),
    staleTime: STALE_TIME,
    enabled: !!departmentId, // จะทำงานก็ต่อเมื่อมีการเลือกหน่วยงานหลักแล้วเท่านั้น
  });
}

export function useProjectTypes() {
  return useQuery({
    queryKey: ["lookups", "projectTypes"],
    queryFn: () => getProjectTypesAction(),
    staleTime: STALE_TIME,
  });
}

export function useBudgetTypes() {
  return useQuery({
    queryKey: ["lookups", "budgetTypes"],
    queryFn: () => getBudgetTypesAction(),
    staleTime: STALE_TIME,
  });
}

// รายชื่อผู้วิเคราะห์ (id + ชื่อ) — ต้องล็อกอิน, อายุสั้นกว่า lookup อื่นให้ตรงกับ cache ฝั่ง backend (5 นาที)
export function useAnalystsLookup(enabled = true) {
  return useQuery({
    queryKey: ["lookups", "analysts"],
    queryFn: () => getAnalystsLookupAction(),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}
