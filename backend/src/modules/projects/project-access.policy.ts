import { HTTPException } from "hono/http-exception";
import type { UserContext } from "../../shared/auth/permission.helper";
import { OWNER_EDITABLE_STATUS_IDS } from "./project-workflow";

export function isSameDepartmentUser(user: UserContext, departmentId: number | null | undefined) {
  return user.roles.some((role) => String(role).toLowerCase() === "user") &&
    departmentId !== null && departmentId !== undefined &&
    user.departmentId === departmentId;
}

export function canEditProjectByDepartment(
  user: UserContext,
  project: { ownerId: string; departmentId: number | null | undefined; statusId: number },
) {
  if (project.ownerId === user.userId) return true;
  return isSameDepartmentUser(user, project.departmentId) &&
    OWNER_EDITABLE_STATUS_IDS.includes(project.statusId as typeof OWNER_EDITABLE_STATUS_IDS[number]);
}

export function assertProjectProposalEditable(
  user: UserContext,
  project: { ownerId: string; departmentId: number | null | undefined; statusId: number },
) {
  if (!canEditProjectByDepartment(user, project)) {
    throw new HTTPException(403, {
      message: "Only the owner or an eligible USER in the same Department can edit this Project",
    });
  }
  if (!OWNER_EDITABLE_STATUS_IDS.includes(project.statusId as typeof OWNER_EDITABLE_STATUS_IDS[number])) {
    throw new HTTPException(409, { message: "This Project is not currently editable" });
  }
}
