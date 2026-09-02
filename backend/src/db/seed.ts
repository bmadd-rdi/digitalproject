// Compatibility entrypoint. Required bootstrap data is the default seed.
// Demo data must be requested explicitly with db:seed:demo.
import { seedRequiredData } from "./seeds/seed-required";

if (import.meta.main) {
  try {
    await seedRequiredData();
    console.log("Required database seed completed.");
  } catch (error) {
    console.error("Required database seed failed:", error);
    process.exitCode = 1;
  }
}
