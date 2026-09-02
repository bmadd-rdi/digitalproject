import { eq } from "drizzle-orm";
import { db } from "../../db";
import { proposalCloudRequests, proposalCloudVms, proposals } from "../../db/schema/proposals"; 
import { projects } from "../../db/schema/projects";

export const getCloudRequests = async (projectId?: string, projectCode?: string) => {
  
  // 1. Left Join ไปที่ proposals และลากต่อไปที่ projects
  let query = db.select({
    cloudRequest: proposalCloudRequests,
    proposal: {
      projectName: proposals.projectName,
      agencyName: proposals.agencyName
    },
    project: {
      id: projects.id,
      projectCode: projects.projectCode
    }
  })
  .from(proposalCloudRequests)
  .leftJoin(proposals, eq(proposalCloudRequests.proposalId, proposals.id))
  .leftJoin(projects, eq(proposals.projectId, projects.id)); // Join ตาราง Project

  // 2. กรองข้อมูลตามสิ่งที่ Client ส่งมา (รองรับทั้งคู่)
  if (projectId) {
    query = query.where(eq(projects.id, projectId)) as any;
  }
  if (projectCode) {
    query = query.where(eq(projects.projectCode, projectCode)) as any;
  }
  
  const requests = await query;

  if (requests.length === 0) return [];

  const vms = await db.select().from(proposalCloudVms);

  return requests.map(row => {
    const req = row.cloudRequest;
    
    const relatedVms = vms
      .filter(vm => vm.cloudRequestId === req.id)
      .map(vm => ({
        ...vm,
        vcpu: vm.vcpu ?? 0,
        ramGb: vm.ramGb ?? 0,
        gpuGb: vm.gpuGb ?? 0,
        storageGb: vm.storageGb ?? 0,
        price: vm.price ?? "0"
      }));

    const totalPrice = relatedVms.reduce((sum, vm) => sum + (parseFloat(vm.price) || 0), 0).toFixed(2);

    return {
      id: req.id,
      systemName: req.systemName,
      projectId: row.project?.id || "",              // คืนค่า projectId 
      projectCode: row.project?.projectCode || null, // คืนค่ารหัส BMA-XX-XXXX
      projectName: row.proposal?.projectName || null,
      agencyName: row.proposal?.agencyName || null,
      totalPrice, 
      requestedServiceDate: req.requestedServiceDate?.toISOString() || null,
      recordedRequestDate: req.recordedRequestDate?.toISOString() || null,
      vms: relatedVms
    };
  });
};