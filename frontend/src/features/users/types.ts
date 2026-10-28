// src/features/users/types.ts
export interface User {
  user_id: string | number;
  username: string; 
  email: string;
  first_name: string;
  last_name: string;
  position: string | null;
  department_name: string;
  division_name: string;
  roles: string[]; // 1 user can have multiple roles
  role_ids?: number[];
  mobile_phone?: string;
  office_phone?: string;
  internal_extension?: string;
  is_active: boolean;
  is_verified: boolean; // false = Pending Verification (ยังไม่ยืนยันอีเมล)
  last_login: string | null;
  created_at?: string;
}
