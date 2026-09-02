CREATE TYPE "public"."project_return_stage" AS ENUM('SMALL_BOARD', 'BIG_BOARD');--> statement-breakpoint
CREATE TYPE "public"."meeting_document_type" AS ENUM('MEETING_DOCUMENT', 'MEETING_MINUTES');--> statement-breakpoint
CREATE TYPE "public"."meeting_resolution_type" AS ENUM('APPROVED', 'ACKNOWLEDGED', 'CONDITIONAL_APPROVAL', 'RECONSIDER', 'NOT_APPROVED', 'NOT_CONSIDERED');--> statement-breakpoint
CREATE TABLE "meeting_resolution_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resolution_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"revision_number" integer NOT NULL,
	"previous_resolution_type" varchar(64),
	"new_resolution_type" varchar(64) NOT NULL,
	"previous_remark" text,
	"new_remark" text,
	"previous_project_status_id" integer,
	"new_project_status_id" integer NOT NULL,
	"previous_latest_approved_budget" numeric(15, 2),
	"new_latest_approved_budget" numeric(15, 2),
	"reason" text,
	"changed_by" uuid NOT NULL,
	"change_mode" varchar(40) NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_project_id_unique";--> statement-breakpoint
ALTER TABLE "agenda_types" ADD COLUMN "code" varchar(64);--> statement-breakpoint
ALTER TABLE "meeting_attachment_types" ADD COLUMN "code" varchar(64);--> statement-breakpoint
ALTER TABLE "meeting_statuses" ADD COLUMN "code" varchar(64);--> statement-breakpoint
ALTER TABLE "meeting_types" ADD COLUMN "code" varchar(64);--> statement-breakpoint
ALTER TABLE "resolution_statuses" ADD COLUMN "code" varchar(64);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "return_stage" "project_return_stage";--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "workflow_version" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD COLUMN "document_type" "meeting_document_type" DEFAULT 'MEETING_DOCUMENT' NOT NULL;--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD COLUMN "original_file_name" varchar(500);--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD COLUMN "stored_file_name" varchar(500);--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD COLUMN "storage_path" varchar(1000);--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD COLUMN "mime_type" varchar(100);--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD COLUMN "size_bytes" bigint;--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "start_time" timestamp;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "end_time" timestamp;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "cancel_reason" text;--> statement-breakpoint
ALTER TABLE "resolutions" ADD COLUMN "resolution_type" "meeting_resolution_type";--> statement-breakpoint
ALTER TABLE "resolutions" ADD COLUMN "remark" text;--> statement-breakpoint
ALTER TABLE "resolutions" ADD COLUMN "resolved_at" timestamp;--> statement-breakpoint
ALTER TABLE "resolutions" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD COLUMN "source_operation" varchar(100);--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD COLUMN "meeting_id" uuid;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD COLUMN "agenda_id" uuid;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD COLUMN "resolution_id" uuid;--> statement-breakpoint
ALTER TABLE "meeting_resolution_revisions" ADD CONSTRAINT "meeting_resolution_revisions_resolution_id_resolutions_id_fk" FOREIGN KEY ("resolution_id") REFERENCES "public"."resolutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_resolution_revisions" ADD CONSTRAINT "meeting_resolution_revisions_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_resolution_revisions" ADD CONSTRAINT "meeting_resolution_revisions_previous_project_status_id_project_statuses_project_status_id_fk" FOREIGN KEY ("previous_project_status_id") REFERENCES "public"."project_statuses"("project_status_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_resolution_revisions" ADD CONSTRAINT "meeting_resolution_revisions_new_project_status_id_project_statuses_project_status_id_fk" FOREIGN KEY ("new_project_status_id") REFERENCES "public"."project_statuses"("project_status_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_resolution_revisions" ADD CONSTRAINT "meeting_resolution_revisions_changed_by_users_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_audit_events" ADD CONSTRAINT "workflow_audit_events_actor_id_users_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meeting_resolution_revisions_resolution_idx" ON "meeting_resolution_revisions" USING btree ("resolution_id","revision_number");--> statement-breakpoint
CREATE INDEX "meeting_resolution_revisions_project_idx" ON "meeting_resolution_revisions" USING btree ("project_id","changed_at");--> statement-breakpoint
CREATE INDEX "workflow_audit_events_entity_idx" ON "workflow_audit_events" USING btree ("entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "workflow_audit_events_actor_idx" ON "workflow_audit_events" USING btree ("actor_id","created_at");--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD CONSTRAINT "project_status_logs_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD CONSTRAINT "project_status_logs_agenda_id_agendas_id_fk" FOREIGN KEY ("agenda_id") REFERENCES "public"."agendas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD CONSTRAINT "project_status_logs_resolution_id_resolutions_id_fk" FOREIGN KEY ("resolution_id") REFERENCES "public"."resolutions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agendas_meeting_project_idx" ON "agendas" USING btree ("meeting_id","project_id");--> statement-breakpoint
CREATE INDEX "agendas_project_meeting_idx" ON "agendas" USING btree ("project_id","meeting_id");--> statement-breakpoint
CREATE INDEX "meeting_attachments_meeting_document_idx" ON "meeting_attachments" USING btree ("meeting_id","document_type");--> statement-breakpoint
CREATE INDEX "meetings_workflow_idx" ON "meetings" USING btree ("meeting_type_id","meeting_status_id","meeting_date");--> statement-breakpoint
CREATE INDEX "resolutions_agenda_idx" ON "resolutions" USING btree ("agenda_id");--> statement-breakpoint
CREATE INDEX "project_status_logs_project_status_idx" ON "project_status_logs" USING btree ("project_id","new_status_id");--> statement-breakpoint
CREATE INDEX "project_status_logs_meeting_idx" ON "project_status_logs" USING btree ("meeting_id","agenda_id","resolution_id");--> statement-breakpoint
ALTER TABLE "agenda_types" ADD CONSTRAINT "agenda_types_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "meeting_attachment_types" ADD CONSTRAINT "meeting_attachment_types_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "meeting_statuses" ADD CONSTRAINT "meeting_statuses_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "meeting_types" ADD CONSTRAINT "meeting_types_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "resolution_statuses" ADD CONSTRAINT "resolution_statuses_code_unique" UNIQUE("code");
--> statement-breakpoint
UPDATE "project_statuses" SET "code" = 'RETURNED_FROM_SMALL_BOARD', "project_status_name" = 'Returned from Small Board' WHERE "project_status_id" = 10;
--> statement-breakpoint
UPDATE "project_statuses" SET "code" = 'REJECTED_BY_SMALL_BOARD', "project_status_name" = 'Rejected by Small Board' WHERE "project_status_id" = 11;
--> statement-breakpoint
UPDATE "project_statuses" SET "code" = 'RETURNED_FROM_BIG_BOARD', "project_status_name" = 'Returned from Big Board' WHERE "project_status_id" = 13;
--> statement-breakpoint
UPDATE "project_statuses" SET "code" = 'REJECTED_BY_BIG_BOARD', "project_status_name" = 'Rejected by Big Board' WHERE "project_status_id" = 14;
--> statement-breakpoint
INSERT INTO "project_statuses" ("project_status_id", "code", "project_status_name")
VALUES (16, 'ACKNOWLEDGED', 'Acknowledged')
ON CONFLICT ("project_status_id") DO UPDATE SET "code" = EXCLUDED."code", "project_status_name" = EXCLUDED."project_status_name";
--> statement-breakpoint
UPDATE "meeting_statuses" SET "code" = CASE "id"
  WHEN 1 THEN 'SCHEDULED'
  WHEN 2 THEN 'IN_PROGRESS'
  WHEN 3 THEN 'COMPLETED'
  WHEN 4 THEN 'CANCELLED'
END WHERE "id" BETWEEN 1 AND 4;
--> statement-breakpoint
INSERT INTO "meeting_statuses" ("id", "code", "name")
VALUES (5, 'DRAFT', 'Draft')
ON CONFLICT ("id") DO UPDATE SET "code" = EXCLUDED."code", "name" = EXCLUDED."name";
--> statement-breakpoint
UPDATE "meeting_types" SET "code" = CASE "id"
  WHEN 1 THEN 'SMALL_BOARD'
  WHEN 2 THEN 'BIG_BOARD'
END WHERE "id" IN (1, 2);
--> statement-breakpoint
UPDATE "resolution_statuses" SET "code" = CASE "id"
  WHEN 1 THEN 'APPROVED'
  WHEN 2 THEN 'CONDITIONAL_APPROVAL'
  WHEN 3 THEN 'NOT_APPROVED'
  WHEN 4 THEN 'ACKNOWLEDGED'
  WHEN 5 THEN 'PENDING_LEGACY'
  WHEN 6 THEN 'RECONSIDER'
  WHEN 7 THEN 'NOT_CONSIDERED'
END WHERE "id" BETWEEN 1 AND 7;
--> statement-breakpoint
UPDATE "resolutions" r
SET "resolution_type" = rs."code"::meeting_resolution_type,
    "remark" = COALESCE(r."remark", r."comment"),
    "resolved_at" = COALESCE(r."resolved_at", r."created_at")
FROM "resolution_statuses" rs
WHERE rs."id" = r."resolution_status_id"
  AND rs."code" IN (
    'APPROVED', 'ACKNOWLEDGED', 'CONDITIONAL_APPROVAL',
    'RECONSIDER', 'NOT_APPROVED', 'NOT_CONSIDERED'
  );
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('project_statuses', 'project_status_id'), (SELECT max(project_status_id) FROM project_statuses), true);
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('meeting_statuses', 'id'), (SELECT max(id) FROM meeting_statuses), true);
--> statement-breakpoint
SELECT setval(pg_get_serial_sequence('resolution_statuses', 'id'), (SELECT max(id) FROM resolution_statuses), true);
