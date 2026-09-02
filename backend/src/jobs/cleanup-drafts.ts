// src/jobs/cleanup-drafts.ts
// สคริปต์สำหรับลบ Draft ที่ไม่มีการอัปเดตเกิน 30 วัน
// ใช้งาน: bun run src/jobs/cleanup-drafts.ts
// สามารถตั้ง Cron Job ให้รันเป็นประจำทุกสัปดาห์ได้
import { proposalService } from "../modules/proposals/proposal.service";

interface DeletedDraft {
  id: string | number;
  projectId: string | number;
}

const DAYS_OLD = 30;

async function main() {
  console.log(`🧹 เริ่มลบ Draft ที่ไม่มีการอัปเดตเกิน ${DAYS_OLD} วัน...`);
  
  try {
    const deleted = await proposalService.deleteStaleDrafts(DAYS_OLD) as DeletedDraft[];
    
    if (deleted.length === 0) {
      console.log("✅ ไม่มี Draft ที่หมดอายุ");
    } else {
      console.log(`✅ ลบ Draft สำเร็จ จำนวน ${deleted.length} รายการ:`);
      for (const d of deleted) {
        console.log(`   - Draft ID: ${d.id}, Project ID: ${d.projectId}`);
      }
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

main();
