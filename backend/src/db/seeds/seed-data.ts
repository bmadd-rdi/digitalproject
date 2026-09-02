// src/db/seeds/seed-data.ts

import { PROJECT_ATTACHMENT_TYPES } from "../../modules/lookups/project-attachment-types";
import {
  deputyGovernorSeedData,
  fourQuadrantSeedData,
} from "./data/organization-lookup-data";

export const agendaTypeSeedData = [
  { id: 1, code: "FOR_INFORMATION", name: "Chairman's Announcements" },
  { id: 2, code: "APPROVE_MINUTES", name: "Adoption of Minutes" },
  { id: 3, code: "FOLLOW_UP", name: "Matters Arising / Follow-up" },
  { id: 4, code: "FOR_CONSIDERATION", name: "Matters for Consideration" },
  { id: 5, code: "OTHER", name: "Any Other Business" },
];

export const seedData = {
  roles: [
    { roleId: 1, code: "USER", roleName: "USER" },
    { roleId: 2, code: "ANALYST", roleName: "ANALYST" },
    { roleId: 3, code: "SECRETARY", roleName: "SECRETARY" },
    { roleId: 4, code: "ADMIN", roleName: "ADMIN" },
    { roleId: 5, code: "SUPER_ADMIN", roleName: "SUPER_ADMIN" }
  ],

  projectTypes: [
    { id: 1, code: "HARDWARE", typeName: "Hardware" },
    { id: 2, code: "SOFTWARE", typeName: "Software" },
  ],

  fourQuadrants: fourQuadrantSeedData,

  deputyGovernors: deputyGovernorSeedData,

mockUsers: [
    {
      username: "test_user",
      firstName: "Test",
      lastName: "User",
      email: "user@system.com",
      rawPassword: "password123",
      roleId: 1, // USER
      divisionCode: "26020000", // กองยุทธศาสตร์ดิจิทัล
      departmentCode: "26000000" // สำนักดิจิทัลกรุงเทพมหานคร
    },
    {
      username: "test_analyst",
      firstName: "Test",
      lastName: "Analyst",
      email: "analyst@system.com",
      rawPassword: "password123",
      roleId: 2, // ANALYST
      divisionCode: "26020000",
      departmentCode: "26000000"
    },
    {
      username: "test_secretary",
      firstName: "Test",
      lastName: "Secretary",
      email: "secretary@system.com",
      rawPassword: "password123",
      roleId: 3, // SECRETARY
      divisionCode: "26020000",
      departmentCode: "26000000"
    },
    {
      username: "test_admin",
      firstName: "Test",
      lastName: "Admin",
      email: "admin@system.com",
      rawPassword: "password123",
      roleId: 4, // ADMIN
      divisionCode: "26020000",
      departmentCode: "26000000"
    },
    {
      username: "test_super_admin",
      firstName: "Test",
      lastName: "SuperAdmin",
      email: "superadmin@system.com",
      rawPassword: "password123",
      roleId: 5, // SUPER_ADMIN
      divisionCode: "26020000",
      departmentCode: "26000000"
    }
  ],

  projectStatuses: [
    { id: 1, code: "PROJECT_DRAFT", statusName: "Draft" },
    { id: 2, code: "PROJECT_PENDING_SECRETARY", statusName: "Pending Secretary" },
    { id: 3, code: "PROJECT_RETURNED_SECRETARY", statusName: "Returned by Secretary" },
    { id: 4, code: "PROJECT_REJECTED_SECRETARY", statusName: "Rejected by Secretary" },
    { id: 5, code: "PROJECT_PENDING_ASSIGNMENT", statusName: "Pending Assignment" },
    { id: 6, code: "PROJECT_IN_ANALYSIS", statusName: "In Analysis" },
    { id: 7, code: "PROJECT_RETURNED_ANALYST", statusName: "Returned by Analyst" },
    { id: 8, code: "PROJECT_REJECTED_ANALYST", statusName: "Rejected by Analyst" },
    { id: 9, code: "PROJECT_PENDING_SMALL_BOARD", statusName: "Pending Small Board" },
    { id: 10, code: "PROJECT_RETURNED_FROM_SMALL_BOARD", statusName: "Returned from Small Board" },
    { id: 11, code: "PROJECT_REJECTED_BY_SMALL_BOARD", statusName: "Rejected by Small Board" },
    { id: 12, code: "PROJECT_PENDING_BIG_BOARD", statusName: "Pending Big Board" },
    { id: 13, code: "PROJECT_RETURNED_FROM_BIG_BOARD", statusName: "Returned from Big Board" },
    { id: 14, code: "PROJECT_REJECTED_BY_BIG_BOARD", statusName: "Rejected by Big Board" },
    { id: 15, code: "PROJECT_APPROVED", statusName: "Approved" },
    { id: 16, code: "PROJECT_ACKNOWLEDGED", statusName: "Acknowledged" },
  ],

  projectAttachmentTypes: PROJECT_ATTACHMENT_TYPES,

  meetingStatuses: [
    { id: 1, code: "SCHEDULED", name: "Scheduled" },
    { id: 2, code: "IN_PROGRESS", name: "In Progress" },
    { id: 3, code: "COMPLETED", name: "Completed" },
    { id: 4, code: "CANCELLED", name: "Cancelled" },
    { id: 5, code: "DRAFT", name: "Draft" },
  ],

  meetingTypes: [
    { id: 1, code: "SMALL_BOARD", name: "Small Board" },
    { id: 2, code: "BIG_BOARD", name: "Big Board" },
  ],

  meetingAttachmentTypes: [
    { id: 1, code: "MEETING_DOCUMENT", name: "Meeting Document" },
    { id: 2, code: "MEETING_MINUTES", name: "Meeting Minutes" },
    { id: 3, code: "SUPPORTING_DOCUMENT", name: "Supporting Document" },
  ],

  agendaTypes: [
    { id: 1, name: "วาระแจ้งเพื่อทราบ" },
    { id: 2, name: "วาระรับรองรายงานการประชุม" },
    { id: 3, name: "วาระเพื่อพิจารณา" },
    { id: 4, name: "วาระอื่นๆ" }
  ],

  resolutionStatuses: [
    { id: 1, code: "APPROVED", name: "Approved" },
    { id: 2, code: "CONDITIONAL_APPROVAL", name: "Conditional Approval" },
    { id: 3, code: "NOT_APPROVED", name: "Not Approved" },
    { id: 4, code: "ACKNOWLEDGED", name: "Acknowledged" },
    { id: 5, code: "PENDING_LEGACY", name: "Pending (Legacy)" },
    { id: 6, code: "RECONSIDER", name: "Reconsider" },
    { id: 7, code: "NOT_CONSIDERED", name: "Not Considered" },
  ]
};
