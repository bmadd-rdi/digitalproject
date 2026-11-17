import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../index";
import { policyGovernors } from "../schema/lookups";
import { governorPolicySeedData } from "./data/governor-policy-data";

export async function seedGovernorPolicies() {
  const policies = z.array(z.object({
    code: z.string().regex(/^P\d{3}$/),
    name: z.string().trim().min(1).max(255),
  })).parse(governorPolicySeedData);

  if (new Set(policies.map((policy) => policy.code)).size !== policies.length) {
    throw new Error("Governor policy codes must be unique");
  }

  await db.insert(policyGovernors)
    .values(policies.map((policy) => ({
      policyCode: policy.code,
      policyName: policy.name,
    })))
    .onConflictDoUpdate({
      target: policyGovernors.policyCode,
      set: { policyName: sql`excluded.policy_name` },
      setWhere: sql`${policyGovernors.policyName} IS DISTINCT FROM excluded.policy_name`,
    });

  return policies.length;
}

if (import.meta.main) {
  seedGovernorPolicies()
    .then((count) => console.log(`Imported ${count} governor policies.`))
    .catch((error: unknown) => {
      console.error("Governor policy seed failed:", error);
      process.exitCode = 1;
    });
}
