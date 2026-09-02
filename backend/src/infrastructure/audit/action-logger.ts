// src/infrastructure/audit/action-logger.ts
import { db } from "@/db";
// import { auditLogs, notifications } from "@/db/schema";

export class ActionService {
  // ฟังก์ชันส่วนกลางสำหรับบันทึก Log และส่งแจ้งเตือนพร้อมกัน
  static async logAndNotify({
    actorId, // คนทำ
    targetUserId, // คนรับแจ้งเตือน
    action, // เช่น 'UPDATE_PROJECT_STATUS'
    entityType, // 'PROJECT'
    entityId, // 12
    diffPayload, // สิ่งที่เปลี่ยน
    notifyTitle, // หัวข้อแจ้งเตือน
    notifyMessage, // ข้อความแจ้งเตือน
    linkUrl, // ลิงก์ไปหน้าโปรเจกต์
  }: any) {
    
    // // 1. บันทึก Audit Log แบบเงียบๆ
    // await db.insert(auditLogs).values({
    //   userId: actorId,
    //   action,
    //   entityType,
    //   entityId,
    //   diffPayload, // โยน JSON ก้อนเล็กๆ ลงไป
    // });

    // // 2. ถ้ามีเป้าหมายให้แจ้งเตือน ก็สร้าง Notification ด้วยเลย
    // if (targetUserId) {
    //   await db.insert(notifications).values({
    //     userId: targetUserId,
    //     title: notifyTitle,
    //     message: notifyMessage,
    //     linkUrl,
    //   });
      
    //   // 🌟 อนาคต: สามารถเพิ่มโค้ดส่ง Email หรือ LINE Notify ไว้ตรงนี้จุดเดียวได้เลย!
    // }
  }
}
