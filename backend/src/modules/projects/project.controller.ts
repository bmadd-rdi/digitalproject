// src/modules/projects/project.controller.ts
import type { Context } from "hono";
import { getUserContext } from "../../shared/http/controller-helper";
import * as projectService from "./project.service";
import { cancelProjectSubmit } from "./project-cancel.service";
import type {
  AssignProjectDTO,
  CreateProjectDTO,
  SecretaryPendingProjectQueryDTO,
  SecretaryReviewDTO,
  AssignmentProjectQueryDTO,
  BulkAssignProjectDTO,
  UpdateProjectDTO,
  UpdateProjectStatusDTO,
  UpdateProjectTypeDTO,
  AnalystAssignedProjectQueryDTO,
  AnalystReassignmentDTO,
  AnalystReviewDTO,
  UpdateProjectVisibilityDTO,
  ReopenRejectedProjectDTO,
} from "./project.schema";

export const getProjects = async (c: Context, query: any) => {
  const user = getUserContext(c);
  const result = await projectService.findAllProjects(user, query);
  return c.json(result, 200);
};

export const getProjectById = async (c: Context, id: string) => {
  const user = getUserContext(c);
  const project = await projectService.findProjectById(id, user);
  return c.json(project, 200);
};

export const getPendingSecretaryProjects = async (
  c: Context,
  query: SecretaryPendingProjectQueryDTO,
) => {
  const user = getUserContext(c);
  const result = await projectService.getPendingSecretaryProjects(query, user);
  return c.json(result, 200);
};

export const getPendingAssignmentProjects = async (
  c: Context,
  query: AssignmentProjectQueryDTO,
) => {
  const user = getUserContext(c);
  const result = await projectService.getPendingAssignmentProjects(query, user);
  return c.json(result, 200);
};

export const getAnalystAssignedProjects = async (
  c: Context,
  query: AnalystAssignedProjectQueryDTO,
) => {
  const user = getUserContext(c);
  const result = await projectService.getAnalystAssignedProjects(query, user);
  return c.json(result, 200);
};

export const createProject = async (c: Context, body: CreateProjectDTO) => {
  const user = getUserContext(c);
  const newProject = await projectService.createProject(user, body);
  return c.json({ message: "สร้างโครงการสำเร็จ", project: newProject }, 201);
};

export const updateProject = async (
  c: Context,
  id: string,
  body: UpdateProjectDTO,
) => {
  const user = getUserContext(c);
  const updatedProject = await projectService.updateProject(id, body, user);
  return c.json({ message: "อัปเดตข้อมูลโครงการสำเร็จ", project: updatedProject }, 200);
};

export const updateProjectStatus = async (c: Context, id: string, body: UpdateProjectStatusDTO) => {
  const user = getUserContext(c);
  const updatedProject = await projectService.updateProjectStatus(id, body, user);
  return c.json({ message: "อัปเดตสถานะโครงการสำเร็จ", project: updatedProject }, 200);
};

export const reviewSecretaryProject = async (
  c: Context,
  id: string,
  body: SecretaryReviewDTO,
) => {
  const user = getUserContext(c);
  const result = await projectService.reviewSecretaryProject(id, body, user);
  return c.json({
    message: "Secretary review completed successfully",
    ...result,
  }, 200);
};

export const updateProjectType = async (c: Context, id: string, body: UpdateProjectTypeDTO) => {
  const user = getUserContext(c);
  const updatedProject = await projectService.updateProjectType(id, body, user);
  return c.json({ message: "อัปเดตประเภทโครงการสำเร็จ", project: updatedProject }, 200);
};

export const assignProject = async (c: Context, id: string, body: AssignProjectDTO) => {
  const user = getUserContext(c);
  const updatedProject = await projectService.assignProject(id, body, user);
  return c.json({ message: "มอบหมายโครงการสำเร็จ", project: updatedProject }, 200); 
};

export const cancelSubmitProject = async (c: Context, id: string) => {
  const user = getUserContext(c);
  await cancelProjectSubmit(id, user);
  const project = await projectService.findProjectById(id, user);
  return c.json({
    message: "ยกเลิกการส่งโครงการสำเร็จ และคืนข้อมูลเป็นแบบร่างแล้ว",
    projectId: id,
    project,
  }, 200);
};

export const updateProjectVisibility = async (
  c: Context,
  id: string,
  body: UpdateProjectVisibilityDTO,
) => {
  const user = getUserContext(c);
  const result = await projectService.updateProjectVisibility(id, body, user);
  return c.json(result, 200);
};

export const getPublicProjects = async (c: Context, query: any) => {
  const result = await projectService.getPublicProjects(query);
  return c.json(result, 200);
};

export const getPublicProjectById = async (c: Context, id: string) => {
  const project = await projectService.getPublicProjectById(id);
  return c.json(project, 200);
};

export const bulkAssignProjects = async (c: Context, body: BulkAssignProjectDTO) => {
  const user = getUserContext(c);
  const result = await projectService.bulkAssignProjects(body, user);
  return c.json(result, 200);
};

export const requestAnalystReassignment = async (
  c: Context,
  id: string,
  body: AnalystReassignmentDTO,
) => {
  const user = getUserContext(c);
  const result = await projectService.requestAnalystReassignment(id, body, user);
  return c.json(result, 200);
};

export const reviewAnalystProject = async (
  c: Context,
  id: string,
  body: AnalystReviewDTO,
) => {
  const user = getUserContext(c);
  const result = await projectService.reviewAnalystProject(id, body, user);
  return c.json(result, 200);
};

export const deleteProject = async (c: Context, id: string) => {
  const user = getUserContext(c); 
  await projectService.removeProject(id, user);
  return c.json({ message: "ลบโครงการสำเร็จ" }, 200);
};

export const reopenRejectedProject = async (c: Context, id: string, body: ReopenRejectedProjectDTO) => {
  const project = await projectService.reopenRejectedProject(id, body, getUserContext(c));
  return c.json({ message: "เปิดโครงการที่ถูกปฏิเสธเพื่อแก้ไขอีกครั้งสำเร็จ", project }, 200);
};
