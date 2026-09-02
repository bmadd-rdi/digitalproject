// src/shared/auth/permission.helper.ts
import { HTTPException } from "hono/http-exception";
import { permissionMatrix, Role, Resource, Action } from "../../config/permissions.config";

export interface UserContext {
  userId: string;
  roles: Role[];
  divisionId: number;
  departmentId: number;
}

export interface ResourceData {
  divisionId?: number;
  departmentId?: number;
  status?: string;
}

/**
 * Submission permissions are additive. A Secretary-only account cannot
 * submit as a project owner, while Secretary combined with another role can.
 */
export const isSecretaryOnlyUser = (
  user: Pick<UserContext, "roles">,
): boolean => {
  const normalizedRoles = user.roles.map((role) => String(role).toLowerCase());

  return normalizedRoles.length > 0 && normalizedRoles.every(
    (role) => role === "secretary",
  );
};

/**
 * ฟังก์ชันกลางสำหรับตรวจสอบสิทธิ์การเข้าถึงและการจัดการข้อมูล
 * @param user ข้อมูลผู้ใช้งานปัจจุบัน (ดึงจาก JWT)
 * @param action การกระทำ (create, read, update, delete)
 * @param resource ประเภทของข้อมูล (project, proposal_form, ฯลฯ)
 * @param resourceData (Optional) ข้อมูลเฉพาะของรายการนั้นๆ เช่น แผนกเจ้าของ, สถานะปัจจุบัน
 */
export const checkPermission = (
  user: UserContext,
  action: Action,
  resource: Resource,
  resourceData?: ResourceData
): boolean => {
  // 1. ตรวจสอบสิทธิ์ระดับ Role (RBAC) - เช็คว่ามีอย่างน้อย 1 Role ที่มีสิทธิ์หรือไม่
  const hasPermission = user.roles.some((role) => {
    const allowedActions = permissionMatrix[role]?.[resource] || [];
    return allowedActions.includes(action);
  });

  if (!hasPermission) {
    throw new HTTPException(403, { 
      message: `Forbidden: บัญชีของคุณไม่มีสิทธิ์ ${action} ข้อมูลประเภท ${resource}` 
    });
  }

  // 2. ข้ามการตรวจสอบเงื่อนไขเชิงลึก หากเป็น Role ส่วนกลางที่ต้องจัดการข้ามแผนกได้
  const isCentralRole = user.roles.some(r => 
    ['super_admin', 'admin', 'analyst', 'secretary'].includes(r)
  );
  
  if (isCentralRole) {
    return true; 
  }

  // 3. ตรวจสอบเงื่อนไขเชิงลึก (ABAC) สำหรับผู้ใช้งานทั่วไป (Local Roles)
  if (resourceData) {
    
    // 3.1 Check DepartMent เดียวกันหรือไม่
    if (resourceData.departmentId && resourceData.departmentId !== user.departmentId) {
      throw new HTTPException(403, { 
        // message: "Forbidden: คุณไม่มีสิทธิ์เข้าถึงหรือจัดการข้อมูลของหน่วยงานอื่น" 
        message: `Forbidden: คุณไม่มีสิทธิ์เข้าถึงหรือจัดการข้อมูลของส่วนราชการอื่น (Department ID: ${resourceData.departmentId} ไม่ตรงกับ Department ID ของคุณ: ${user.departmentId})` 
      });
    }

    // 3.2 กฎการลบ: ผู้ใช้ทั่วไปจะลบข้อมูลสำคัญได้ก็ต่อเมื่อยังเป็นสถานะ Draft
    if (action === 'delete') {
      if (resource === 'project' || resource === 'proposal_form') {
        if (resourceData.status !== 'draft') {
          throw new HTTPException(403, { 
            message: "Forbidden: ไม่สามารถลบข้อมูลที่ถูกยื่นเสนอหรือดำเนินการไปแล้วได้ (อนุญาตเฉพาะสถานะ Draft)" 
          });
        }
      }
    }
  }

  return true; // ผ่านการตรวจสอบทุกเงื่อนไข
};
