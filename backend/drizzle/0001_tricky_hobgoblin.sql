ALTER TABLE "divisions" DROP CONSTRAINT "divisions_division_name_unique";--> statement-breakpoint
ALTER TABLE "departments" ADD COLUMN "department_code" varchar(8);--> statement-breakpoint
ALTER TABLE "divisions" ADD COLUMN "division_code" varchar(8);--> statement-breakpoint
UPDATE "departments"
SET "department_code" = 'LD' || lpad("department_id"::text, 6, '0')
WHERE "department_code" IS NULL;--> statement-breakpoint
UPDATE "divisions"
SET "division_code" = 'LV' || lpad("division_id"::text, 6, '0')
WHERE "division_code" IS NULL;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "department_code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "divisions" ALTER COLUMN "division_code" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "divisions_department_id_idx" ON "divisions" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "departments_department_code_idx" ON "departments" USING btree ("department_code");--> statement-breakpoint
CREATE INDEX "divisions_division_code_idx" ON "divisions" USING btree ("division_code");--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_department_code_unique" UNIQUE("department_code");--> statement-breakpoint
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_division_code_unique" UNIQUE("division_code");
