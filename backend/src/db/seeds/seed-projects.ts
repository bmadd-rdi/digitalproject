// src/db/seeds/seed-projects.ts
import { db } from "../index";
import { projects, projectSequences } from "../schema/projects";
import { v7 as uuidv7 } from "uuid";
import { eq, sql } from "drizzle-orm";
import { users } from "../schema/users";

export const mockProjectsData = [
  {
    projectCode: "BMA-69-0001",
    projectName: "โครงการพัฒนาระบบให้บริการประชาชนแบบเบ็ดเสร็จ (One Stop Service)",
    fourQuadrantsId: 2, // Q2: งานประจำที่บริการประชาชน
    deputyGovernorId: 1, // รองผู้ว่าฯ ด้านบริหาร
    projectStatusId: 1, // Draft
    projectTypeId: 2, // Software
    initialRequestedBudget: "1200000.00",
    isPublic: true,
  },
  {
    projectCode: "BMA-69-0002",
    projectName: "โครงการจัดหาอุปกรณ์คอมพิวเตอร์และเครือข่ายสำหรับศูนย์ข้อมูล",
    fourQuadrantsId: 1, // Q1: เพิ่มประสิทธิภาพ
    deputyGovernorId: 1, // รองผู้ว่าฯ ด้านบริหาร
    projectStatusId: 2, // Pending Secretary
    projectTypeId: 1, // Hardware
    initialRequestedBudget: "5500000.00",
    isPublic: false,
  },
  {
    projectCode: "BMA-69-0003",
    projectName: "โครงการระบบบริหารจัดการน้ำท่วมอัจฉริยะ (Smart Flood Management)",
    fourQuadrantsId: 4, // Q4: ยุทธศาสตร์ / งานอนาคต
    deputyGovernorId: 4, // รองผู้ว่าฯ ด้านสิ่งแวดล้อม
    projectStatusId: 3, // Returned by Secretary
    projectTypeId: 2, // Software
    initialRequestedBudget: "8900000.00",
    isPublic: true,
  },
  {
    projectCode: "BMA-69-0004",
    projectName: "โครงการติดตั้งระบบกล้องวงจรปิดเพื่อความปลอดภัยสาธารณะ",
    fourQuadrantsId: 2, // Q2: งานประจำที่บริการประชาชน
    deputyGovernorId: 3, // รองผู้ว่าฯ ด้านสังคม
    projectStatusId: 4, // Rejected by Secretary
    projectTypeId: 1, // Hardware
    initialRequestedBudget: "15000000.00",
    isPublic: true,
  },
  {
    projectCode: "BMA-69-0005",
    projectName: "โครงการพัฒนาระบบฐานข้อมูลเศรษฐกิจชุมชน",
    fourQuadrantsId: 3, // Q3: งานหลังบ้านที่เป็นงานใหม่
    deputyGovernorId: 2, // รองผู้ว่าฯ ด้านเศรษฐกิจ
    projectStatusId: 15, // Approved
    projectTypeId: 2, // Software
    initialRequestedBudget: "2500000.00",
    latestRequestedBudget: "2450000.00",
    isPublic: false,
  },
  {
    projectCode: "BMA-69-0006",
    projectName: "โครงการระบบติดตามและประเมินผลการลดคาร์บอน (Carbon Footprint Tracking)",
    fourQuadrantsId: 4, // Q4: ยุทธศาสตร์ / งานอนาคต
    deputyGovernorId: 4, // รองผู้ว่าฯ ด้านสิ่งแวดล้อม
    projectStatusId: 6, // In Analysis
    projectTypeId: 2, // Software
    initialRequestedBudget: "3000000.00",
    isPublic: false,
  }
];

export async function seedMockProjects() {
  console.log(">> เริ่มสร้างข้อมูลโครงการทดสอบ (Mock Projects)...");

  try {
    const testUser = await db.query.users.findFirst({
      where: eq(users.username, "test_user")
    });

    if (!testUser) {
      console.error("❌ ไม่พบผู้ใช้งาน 'test_user' กรุณารัน Seed Data หลักก่อน");
      return;
    }
    if (!testUser.divisionId) {
      throw new Error("ผู้ใช้ทดสอบไม่มี Division ID ที่เป็นตัวเลข");
    }

    const testAnalyst = await db.query.users.findFirst({
      where: eq(users.username, "test_analyst")
    });

    // --- ส่วน Insert ข้อมูล Mock ของเดิม ---
    for (const project of mockProjectsData) {
      const existing = await db.query.projects.findFirst({
        where: eq(projects.projectCode, project.projectCode)
      });

      if (!existing) {
        await db.insert(projects).values({
          id: uuidv7(),
          ...project,
          projectNameOriginal: project.projectName,
          userId: testUser.userId,
          divisionId: testUser.divisionId,
          analystId: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(project.projectStatusId) && testAnalyst ? testAnalyst.userId : null,
          assignedBy: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(project.projectStatusId) && testAnalyst ? testUser.userId : null,
          assignedAt: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15].includes(project.projectStatusId) ? new Date() : null,
        });
        console.log(`   ✅ เพิ่มโครงการ '${project.projectName}' สำเร็จ`);
      }
    }

    // 3. ซิงค์ค่า Running Number ให้ตรงกับความเป็นจริง
    console.log(">> กำลังซิงค์เลข Project Code ล่าสุด...");

    // ดึงปีปัจจุบัน พ.ศ. (ให้ตรงกับ Logic ใน generateProjectCode)
    const currentYear = new Date().getFullYear();
    const thaiYear = currentYear + 543;
    const maxSeedNumber = mockProjectsData.length; // จำนวนข้อมูล Seed (ตอนนี้คือ 6)

    // บันทึกหรืออัปเดต Sequence ล่าสุด
    await db.insert(projectSequences)
      .values({ year: thaiYear, lastValue: maxSeedNumber })
      .onConflictDoUpdate({
        target: projectSequences.year,
        set: {
          // ป้องกันในกรณีที่ User สร้าง Project จริงทะลุเลข 6 ไปแล้ว เราจะไม่ถอยเลขกลับ
          lastValue: sql`GREATEST(${projectSequences.lastValue}, ${maxSeedNumber})`
        }
      });

    console.log(`   ✅ อัปเดต Sequence ของปี ${thaiYear} ให้เริ่มต้นจากเลข ${maxSeedNumber + 1} แล้ว`);
    console.log("✅ Seed ข้อมูลโครงการทดสอบเสร็จสิ้น!");

  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการ Seed Projects:", error);
  }
}
