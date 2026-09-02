DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'latest_approved_budget'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'latest_requested_budget'
  ) THEN
    ALTER TABLE "projects" RENAME COLUMN "latest_approved_budget" TO "latest_requested_budget";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'total_budget'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'proposals' AND column_name = 'requested_budget_total'
  ) THEN
    ALTER TABLE "proposals" RENAME COLUMN "total_budget" TO "requested_budget_total";
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'proposal_drafts' AND column_name = 'total_budget'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'proposal_drafts' AND column_name = 'requested_budget_total'
  ) THEN
    ALTER TABLE "proposal_drafts" RENAME COLUMN "total_budget" TO "requested_budget_total";
  END IF;
END $$;
--> statement-breakpoint
-- Normalize the complete workflow lookup set before application code starts
-- relying on the canonical numeric IDs. Existing IDs are retained; legacy
-- board aliases are renamed in place so historical foreign keys remain valid.
INSERT INTO "project_statuses" ("project_status_id", "code", "project_status_name") VALUES
  (1, 'PROJECT_DRAFT', 'Draft'),
  (2, 'PROJECT_PENDING_SECRETARY', 'Pending Secretary'),
  (3, 'PROJECT_RETURNED_SECRETARY', 'Returned by Secretary'),
  (4, 'PROJECT_REJECTED_SECRETARY', 'Rejected by Secretary'),
  (5, 'PROJECT_PENDING_ASSIGNMENT', 'Pending Assignment'),
  (6, 'PROJECT_IN_ANALYSIS', 'In Analysis'),
  (7, 'PROJECT_RETURNED_ANALYST', 'Returned by Analyst'),
  (8, 'PROJECT_REJECTED_ANALYST', 'Rejected by Analyst'),
  (9, 'PROJECT_PENDING_SMALL_BOARD', 'Pending Small Board'),
  (10, 'PROJECT_RETURNED_FROM_SMALL_BOARD', 'Returned from Small Board'),
  (11, 'PROJECT_REJECTED_BY_SMALL_BOARD', 'Rejected by Small Board'),
  (12, 'PROJECT_PENDING_BIG_BOARD', 'Pending Big Board'),
  (13, 'PROJECT_RETURNED_FROM_BIG_BOARD', 'Returned from Big Board'),
  (14, 'PROJECT_REJECTED_BY_BIG_BOARD', 'Rejected by Big Board'),
  (15, 'PROJECT_APPROVED', 'Approved'),
  (16, 'PROJECT_ACKNOWLEDGED', 'Acknowledged')
ON CONFLICT ("project_status_id") DO UPDATE SET
  "code" = EXCLUDED."code",
  "project_status_name" = EXCLUDED."project_status_name";
SELECT setval(
  pg_get_serial_sequence('project_statuses', 'project_status_id'),
  GREATEST((SELECT COALESCE(MAX("project_status_id"), 1) FROM "project_statuses"), 1),
  true
);
--> statement-breakpoint
INSERT INTO "meeting_statuses" ("id", "code", "name") VALUES
  (1, 'SCHEDULED', 'Scheduled'),
  (2, 'IN_PROGRESS', 'In Progress'),
  (3, 'COMPLETED', 'Completed'),
  (4, 'CANCELLED', 'Cancelled'),
  (5, 'DRAFT', 'Draft')
ON CONFLICT ("id") DO UPDATE SET
  "code" = EXCLUDED."code",
  "name" = EXCLUDED."name";
SELECT setval(
  pg_get_serial_sequence('meeting_statuses', 'id'),
  GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "meeting_statuses"), 1),
  true
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "latest_requested_budget" numeric(15, 2);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "final_approved_budget" numeric(15, 2);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "initial_estimated_cost" numeric(15, 2);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "latest_estimated_cost" numeric(15, 2);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "final_estimated_cost" numeric(15, 2);
--> statement-breakpoint
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "requested_budget_total" numeric(15, 2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "estimated_cost_total" numeric(15, 2);
ALTER TABLE "proposals" ADD COLUMN IF NOT EXISTS "submitted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "proposal_drafts" ADD COLUMN IF NOT EXISTS "requested_budget_total" numeric(15, 2);
ALTER TABLE "proposal_drafts" ADD COLUMN IF NOT EXISTS "estimated_cost_total" numeric(15, 2);
--> statement-breakpoint
ALTER TABLE "resolutions" ADD COLUMN IF NOT EXISTS "governed_proposal_id" uuid;
ALTER TABLE "meeting_resolution_revisions" ADD COLUMN IF NOT EXISTS "previous_final_approved_budget" numeric(15, 2);
ALTER TABLE "meeting_resolution_revisions" ADD COLUMN IF NOT EXISTS "new_final_approved_budget" numeric(15, 2);
ALTER TABLE "meeting_resolution_revisions" ADD COLUMN IF NOT EXISTS "previous_final_estimated_cost" numeric(15, 2);
ALTER TABLE "meeting_resolution_revisions" ADD COLUMN IF NOT EXISTS "new_final_estimated_cost" numeric(15, 2);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'resolutions_governed_proposal_id_proposals_id_fk'
  ) THEN
    ALTER TABLE "resolutions"
      ADD CONSTRAINT "resolutions_governed_proposal_id_proposals_id_fk"
      FOREIGN KEY ("governed_proposal_id") REFERENCES "proposals" ("id") ON DELETE NO ACTION;
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'proposals_project_id_unique') THEN
    ALTER TABLE "proposals" DROP CONSTRAINT "proposals_project_id_unique";
  END IF;
END $$;
--> statement-breakpoint
UPDATE "proposals" p
SET "requested_budget_total" = COALESCE(
  "requested_budget_total",
  (SELECT SUM(COALESCE(pb."amount", 0)) FROM "proposal_budgets" pb WHERE pb."proposal_id" = p."id")
),
"submitted_at" = COALESCE("submitted_at", CASE WHEN "status" = 'submitted' THEN "updated_at" ELSE NULL END)
WHERE "status" = 'submitted' OR "requested_budget_total" IS NULL;
--> statement-breakpoint
UPDATE "proposals" p
SET "estimated_cost_total" = COALESCE(
  "estimated_cost_total",
  (SELECT COALESCE(SUM(COALESCE(c."quantity", 0) * COALESCE(c."unit_price", 0)), 0) FROM "proposal_hardware_costs" c WHERE c."proposal_id" = p."id")
  + (SELECT COALESCE(SUM(COALESCE(c."quantity", 0) * COALESCE(c."unit_price", 0)), 0) FROM "proposal_software_costs" c WHERE c."proposal_id" = p."id")
  + (SELECT COALESCE(SUM(COALESCE(c."quantity", 0) * COALESCE(c."unit_price", 0)), 0) FROM "proposal_other_costs" c WHERE c."proposal_id" = p."id")
  + (SELECT COALESCE(SUM(COALESCE(c."base_salary", 0) * COALESCE(c."multiplier", 1) * COALESCE(c."person_count", 0) * COALESCE(c."duration_months", 0)), 0) FROM "proposal_personnel_costs" c WHERE c."proposal_id" = p."id")
  + (SELECT COALESCE(SUM(COALESCE(c."hours", 0) * COALESCE(c."rate_per_hour", 0) * COALESCE(c."days", 0)), 0) FROM "proposal_training_speaker_costs" c JOIN "proposal_trainings" t ON t."id" = c."training_id" WHERE t."proposal_id" = p."id")
  + (SELECT COALESCE(SUM(COALESCE(c."meals_count", 0) * COALESCE(c."rate_per_meal", 0) * COALESCE(c."trainees_count", 0) * COALESCE(c."days", 0)), 0) FROM "proposal_training_food_costs" c JOIN "proposal_trainings" t ON t."id" = c."training_id" WHERE t."proposal_id" = p."id")
)
WHERE p."status" = 'submitted';
--> statement-breakpoint
UPDATE "proposal_drafts" d
SET "requested_budget_total" = COALESCE(
  "requested_budget_total",
  (SELECT SUM(COALESCE((row->>'amount')::numeric, 0)) FROM jsonb_array_elements(COALESCE(d."draft_payload"->'budgetsByYear', '[]'::jsonb)) row)
)
WHERE "requested_budget_total" IS NULL;
--> statement-breakpoint
UPDATE "projects" p
SET
  "latest_requested_budget" = COALESCE((SELECT p1."requested_budget_total" FROM "proposals" p1 WHERE p1."project_id" = p."project_id" AND p1."status" = 'submitted' ORDER BY p1."submitted_at" DESC NULLS LAST, p1."updated_at" DESC, p1."id" DESC LIMIT 1), p."latest_requested_budget"),
  "latest_estimated_cost" = COALESCE((SELECT p1."estimated_cost_total" FROM "proposals" p1 WHERE p1."project_id" = p."project_id" AND p1."status" = 'submitted' ORDER BY p1."submitted_at" DESC NULLS LAST, p1."updated_at" DESC, p1."id" DESC LIMIT 1), p."latest_estimated_cost"),
  "initial_requested_budget" = COALESCE(p."initial_requested_budget", (SELECT p2."requested_budget_total" FROM "proposals" p2 WHERE p2."project_id" = p."project_id" AND p2."status" = 'submitted' ORDER BY p2."submitted_at" ASC NULLS LAST, p2."updated_at" ASC, p2."id" ASC LIMIT 1)),
  "initial_estimated_cost" = COALESCE(p."initial_estimated_cost", (SELECT p2."estimated_cost_total" FROM "proposals" p2 WHERE p2."project_id" = p."project_id" AND p2."status" = 'submitted' ORDER BY p2."submitted_at" ASC NULLS LAST, p2."updated_at" ASC, p2."id" ASC LIMIT 1))
WHERE EXISTS (SELECT 1 FROM "proposals" p3 WHERE p3."project_id" = p."project_id" AND p3."status" = 'submitted');
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_status_budget_idx" ON "projects" USING btree ("project_status_id", "latest_requested_budget");
CREATE INDEX IF NOT EXISTS "projects_analyst_status_idx" ON "projects" USING btree ("analyst_id", "project_status_id");
CREATE INDEX IF NOT EXISTS "proposals_project_status_submitted_idx" ON "proposals" USING btree ("project_id", "status", "submitted_at", "id");
CREATE INDEX IF NOT EXISTS "resolutions_governed_proposal_idx" ON "resolutions" USING btree ("governed_proposal_id");
CREATE INDEX IF NOT EXISTS "meeting_resolution_revisions_project_changed_idx" ON "meeting_resolution_revisions" USING btree ("project_id", "changed_at");
