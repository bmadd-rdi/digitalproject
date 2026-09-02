// src/modules/lookups/lookup.controller.ts
import type { Context } from "hono";
import {
  getDivisionsLookup,
  getFourQuadrantsLookup,
  getDeputyGovernorsLookup,
  getDepartmentsLookup,
  getRolesLookup,
  getProjectStatusesLookup,
  getProjectTypesLookup,
  getProjectAttachmentTypesLookup,
} from "../lookups/lookup.service";

export const lookupController = {
  async getDivisions(c: Context) {
    const queryId = c.req.query("departmentId");
    const departmentId = queryId ? Number(queryId) : undefined;
    const result = await getDivisionsLookup(departmentId);
    return c.json({ data: result }, 200);
  },

  async getDepartments(c: Context) {
    const result = await getDepartmentsLookup();
    return c.json({ data: result }, 200);
  },

  async getRoles(c: Context) {
    const result = await getRolesLookup();
    return c.json({ data: result }, 200);
  },

  async getFourQuadrants(c: Context) {
    const result = await getFourQuadrantsLookup();
    return c.json({ data: result }, 200);
  },

  async getDeputyGovernors(c: Context) {
    const result = await getDeputyGovernorsLookup();
    return c.json({ data: result }, 200);
  },

  async getProjectStatuses(c: Context) {
    const result = await getProjectStatusesLookup();
    return c.json({ data: result }, 200);
  },

  async getProjectTypes(c: Context) {
    const result = await getProjectTypesLookup();
    return c.json({ data: result }, 200);
  },

  async getProjectAttachmentTypes(c: Context) {
    const result = await getProjectAttachmentTypesLookup();
    return c.json({ data: result }, 200);
  },
};
