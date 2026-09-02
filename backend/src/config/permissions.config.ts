// src/config/permissions.config.ts

export type Role = 'super_admin' | 'admin' | 'secretary' | 'analyst' | 'user';

export type Resource = 
  | 'profile'           // Manage Own Profile
  | 'user_management'   // CRUD User
  | 'rbac'              // จัดการ Role (Assign)
  | 'project'           // CRUD Project (ข้อมูลหลักโครงการ)
  | 'proposal_form'     // CRUD Form (เอกสารประกอบการพิจารณา)
  | 'market'            // Market (การสืบราคา)
  | 'project_assign'    // Assign Proj (มอบหมายผู้วิเคราะห์)
  | 'document_status'   // Status Doc (สถานะการตรวจสอบเอกสาร)
  | 'project_status'    // Status Project (ยืนยันความพร้อมของโครงการ)
  | 'book_receive'      // หนังสือรับ
  | 'book_send'         // หนังสือส่ง
  | 'agenda'            // ระเบียบวาระการประชุม
  | 'meeting_minutes'   // รายงานการประชุม
  | 'meeting_summary'   // รายงานสรุปผลการประชุม
  | 'share_folder'      // Sharing folders
  | 'calendar_event'    // กิจกรรม (Event)
  | 'calendar_period';  // รอบปฏิทิน (Period)

export type Action = 'create' | 'read' | 'update' | 'delete';

type PermissionMatrix = Record<Role, Partial<Record<Resource, Action[]>>>;

export const permissionMatrix: PermissionMatrix = {
  super_admin: {
    // Super Admin ได้สิทธิ์ทั้งหมด
    profile: ['read', 'update'],
    user_management: ['create', 'read', 'update', 'delete'],
    rbac: ['create', 'read', 'update', 'delete'], // Assign Role ได้เต็ม 100%
    project: ['create', 'read', 'update', 'delete'],
    proposal_form: ['create', 'read', 'update', 'delete'],
    market: ['create', 'read', 'update', 'delete'],
    project_assign: ['create', 'read', 'update', 'delete'],
    document_status: ['create', 'read', 'update', 'delete'],
    project_status: ['create', 'read', 'update', 'delete'],
    book_receive: ['create', 'read', 'update', 'delete'], // not sure
    book_send: ['create', 'read', 'update', 'delete'],    // not sure
    agenda: ['create', 'read', 'update', 'delete'],
    meeting_minutes: ['create', 'read', 'update', 'delete'],
    meeting_summary: ['create', 'read', 'update', 'delete'],
    share_folder: ['create', 'read', 'update', 'delete'], // จัดการเรื่อง public/private folder
    calendar_event: ['create', 'read', 'update', 'delete'],
    calendar_period: ['create', 'read', 'update', 'delete'],
  },
  
  admin: {
    profile: ['read', 'update'],
    user_management: ['create', 'read', 'update'], // Admin ลบ User ไม่ได้
    rbac: ['read', 'update'], // Assign Role ได้
    project: ['read', 'delete'], // อ่าน Project List และ Delete ได้
    proposal_form: ['read', 'delete'], // ลบ Form ได้
    project_assign: ['create', 'read', 'update', 'delete'], // จัดการ Assign ได้เต็ม 100%
    calendar_event: ['create', 'read', 'update', 'delete'],
    calendar_period: ['create', 'update'], 
  },
  
  secretary: {
    profile: ['read', 'update'],
    user_management: ['read'], // ดู User Profile/List ได้
    project: ['read', 'update'], // ดูและแก้ไขข้อมูลโครงการได้ทุกสถานะ
    proposal_form: ['read', 'update'], // ตรวจสอบและแก้ไขข้อมูลข้อเสนอได้ทุกสถานะ
    market: ['create', 'read', 'update', 'delete'],
    book_receive: ['create', 'read', 'update', 'delete'], // พระเอกเรื่องหนังสือรับ
    book_send: ['create', 'read', 'update', 'delete'], // พระเอกเรื่องหนังสือส่ง
    agenda: ['create', 'read', 'update', 'delete'], // จัดการวาระ
    meeting_minutes: ['create', 'read', 'update', 'delete'], // จัดการรายงานการประชุม
    meeting_summary: ['create', 'read', 'update', 'delete'], // จัดการสรุปผลการประชุม
    share_folder: ['create', 'read', 'update', 'delete'], // จัดการโฟลเดอร์แชร์
    calendar_event: ['create', 'read', 'update', 'delete'], // จัดการกิจกรรม
  },
  
  analyst: {
    profile: ['read', 'update'],
    project: ['read', 'update'], // ดูและแก้ไขโปรเจกต์คนอื่นได้ (เฉพาะที่ได้รับมอบหมาย)
    proposal_form: ['read', 'update'], // ดูและแก้ไขเอกสารคนอื่นได้ (เฉพาะที่ได้รับมอบหมาย)
    document_status: ['read', 'update'], // แก้ไข Status Document
    project_status: ['read', 'update'], // แก้ไข Status Project (Confirm ความพร้อม)
    calendar_event: ['read'],
  },
  
  user: {
    profile: ['read', 'update'],
    project: ['create', 'read', 'update', 'delete'], // เจ้าของโครงการ
    proposal_form: ['create', 'read', 'update', 'delete'], // กรอกฟอร์มเอกสาร
    calendar_event: ['read'], // ดูปฏิทินกิจกรรม
  },
};
