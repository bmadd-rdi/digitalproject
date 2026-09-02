// src/jobs/cron.ts
// Simple cron-like scheduler using setInterval
import { proposalService } from "../modules/proposals/proposal.service";

const STALE_DRAFT_DAYS = 30;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function startCronJobs() {
  // Run once immediately on startup, then every 24 hours
  const runCleanup = async () => {
    try {
      const deleted = await proposalService.deleteStaleDrafts(STALE_DRAFT_DAYS);
      if (deleted.length > 0) {
        console.log(
          `🗑️  [Cron] Deleted ${deleted.length} stale draft(s) older than ${STALE_DRAFT_DAYS} days.`
        );
      }
    } catch (error) {
      console.error("❌ [Cron] Failed to run stale draft cleanup:", error);
    }
  };

  // First run after 5 seconds (let server fully boot up)
  setTimeout(runCleanup, 5_000);

  // Recurring daily run
  setInterval(runCleanup, ONE_DAY_MS);

  console.log("⏰ [Cron] Stale-draft garbage collection scheduled (daily).");
}
