CREATE TYPE "public"."cost_type" AS ENUM('IT', 'NON_IT');--> statement-breakpoint
CREATE TYPE "public"."food_type" AS ENUM('PARTIAL_MEAL', 'FULL_MEAL', 'SNACK', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."location_type" AS ENUM('GOVERNMENT', 'PRIVATE');--> statement-breakpoint
CREATE TYPE "public"."personnel_type" AS ENUM('CORE', 'ASST', 'SUPP');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('NEW', 'REPLACEMENT', 'CONTINUOUS');--> statement-breakpoint
CREATE TYPE "public"."proposal_status" AS ENUM('draft', 'submitted', 'passed_1', 'rejected_1', 'fix_1', 'admin_assigned', 'passed_2', 'rejected_2', 'fix_2', 'meeting_scheduled', 'meeting_passed', 'fix_3', 'fix_4', 'meeting_rejected');--> statement-breakpoint
CREATE TYPE "public"."reference_type" AS ENUM('MDES', 'MARKET', 'PREVIOUS', 'OTHER');--> statement-breakpoint
CREATE TABLE "agenda_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "agenda_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"department_id" serial PRIMARY KEY NOT NULL,
	"department_name" varchar(255) NOT NULL,
	CONSTRAINT "departments_department_name_unique" UNIQUE("department_name")
);
--> statement-breakpoint
CREATE TABLE "deputy_governors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "divisions" (
	"division_id" serial PRIMARY KEY NOT NULL,
	"department_id" integer NOT NULL,
	"division_name" varchar(255) NOT NULL,
	CONSTRAINT "divisions_division_name_unique" UNIQUE("division_name")
);
--> statement-breakpoint
CREATE TABLE "four_quadrants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_attachment_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "meeting_attachment_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "meeting_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "meeting_statuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "meeting_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "meeting_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_attachment_types" (
	"doc_type_id" serial PRIMARY KEY NOT NULL,
	"code" varchar(64),
	"doc_type_name" varchar(255) NOT NULL,
	CONSTRAINT "project_attachment_types_code_unique" UNIQUE("code"),
	CONSTRAINT "project_attachment_types_doc_type_name_unique" UNIQUE("doc_type_name")
);
--> statement-breakpoint
CREATE TABLE "project_statuses" (
	"project_status_id" serial PRIMARY KEY NOT NULL,
	"code" varchar(64),
	"project_status_name" varchar(255) NOT NULL,
	CONSTRAINT "project_statuses_code_unique" UNIQUE("code"),
	CONSTRAINT "project_statuses_project_status_name_unique" UNIQUE("project_status_name")
);
--> statement-breakpoint
CREATE TABLE "project_types" (
	"project_type_id" serial PRIMARY KEY NOT NULL,
	"code" varchar(64),
	"project_type_name" varchar(255) NOT NULL,
	CONSTRAINT "project_types_code_unique" UNIQUE("code"),
	CONSTRAINT "project_types_project_type_name_unique" UNIQUE("project_type_name")
);
--> statement-breakpoint
CREATE TABLE "resolution_statuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "resolution_statuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_user" (
	"user_id" uuid NOT NULL,
	"role_id" integer NOT NULL,
	"assigned_by" uuid,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_user_user_id_role_id_pk" PRIMARY KEY("user_id","role_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"role_id" serial PRIMARY KEY NOT NULL,
	"code" varchar(64),
	"role_name" varchar(50) NOT NULL,
	"description" varchar(255),
	CONSTRAINT "roles_code_unique" UNIQUE("code"),
	CONSTRAINT "roles_role_name_unique" UNIQUE("role_name")
);
--> statement-breakpoint
CREATE TABLE "user_login_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(512),
	"login_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"position" varchar(150),
	"level" varchar(100),
	"management_position" varchar(150),
	"division_id" integer,
	"mobile_phone" varchar(20),
	"office_phone" varchar(20),
	"internal_extension" varchar(10),
	"is_active" boolean DEFAULT true NOT NULL,
	"reset_password_token" varchar(255),
	"reset_password_expires" timestamp,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_token" varchar(255),
	"verification_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_reset_password_token_unique" UNIQUE("reset_password_token"),
	CONSTRAINT "users_verification_token_unique" UNIQUE("verification_token")
);
--> statement-breakpoint
CREATE TABLE "project_attachments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"doc_type_id" integer NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_url" varchar(1000) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"file_size" bigint,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_sequences" (
	"year" integer PRIMARY KEY NOT NULL,
	"last_value" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"project_id" uuid PRIMARY KEY NOT NULL,
	"project_code" varchar(50),
	"user_id" uuid NOT NULL,
	"division_id" integer NOT NULL,
	"project_status_id" integer DEFAULT 1 NOT NULL,
	"project_type_id" integer,
	"four_quadrants_id" integer NOT NULL,
	"deputy_governor_id" integer NOT NULL,
	"initial_requested_budget" numeric(15, 2),
	"latest_approved_budget" numeric(15, 2),
	"external_task_id" varchar(255),
	"project_name" varchar(600),
	"project_name_original" varchar(600),
	"analyst_id" uuid,
	"assigned_by" uuid,
	"assigned_at" timestamp,
	"is_public" boolean DEFAULT false NOT NULL,
	"public_token" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"deleted_at" timestamp,
	CONSTRAINT "projects_project_code_unique" UNIQUE("project_code"),
	CONSTRAINT "projects_external_task_id_unique" UNIQUE("external_task_id"),
	CONSTRAINT "projects_public_token_unique" UNIQUE("public_token")
);
--> statement-breakpoint
CREATE TABLE "proposal_drafts" (
	"draft_id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid,
	"user_id" uuid NOT NULL,
	"project_name" text,
	"objective" text,
	"total_budget" numeric(15, 2),
	"current_step" integer DEFAULT 1 NOT NULL,
	"draft_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	CONSTRAINT "proposal_drafts_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "proposal_budgets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"year" integer,
	"amount" numeric(15, 2),
	"budget_type" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "proposal_cloud_requests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"system_name" text NOT NULL,
	"requested_service_date" timestamp,
	"recorded_request_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "proposal_cloud_vms" (
	"id" uuid PRIMARY KEY NOT NULL,
	"cloud_request_id" uuid NOT NULL,
	"vm_description" text NOT NULL,
	"os_database" varchar(255),
	"vcpu" integer DEFAULT 0,
	"ram_gb" integer DEFAULT 0,
	"gpu_gb" integer DEFAULT 0,
	"storage_gb" integer DEFAULT 0,
	"price" numeric(15, 2) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "proposal_existing_equipments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"item_name" varchar(255),
	"age_years" numeric(5, 2),
	"quantity" integer,
	"user_name" varchar(255),
	"location" text,
	"remark" text
);
--> statement-breakpoint
CREATE TABLE "proposal_hardware_costs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"item_name" text,
	"quantity" integer,
	"unit_price" numeric(15, 2),
	"reference_type" "reference_type",
	"mdes_month" varchar(50),
	"mdes_year" varchar(10),
	"mdes_item_no" varchar(100),
	"market_count" integer,
	"market_company" text,
	"prev_project" text,
	"prev_year" varchar(10),
	"other_detail" text
);
--> statement-breakpoint
CREATE TABLE "proposal_ict_personnel" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"position" varchar(255),
	"level" varchar(255),
	"count" integer
);
--> statement-breakpoint
CREATE TABLE "proposal_manpower" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"agency_part" varchar(255),
	"position_limit" integer,
	"occupied" integer,
	"vacant" integer
);
--> statement-breakpoint
CREATE TABLE "proposal_other_costs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"item_name" text,
	"quantity" integer,
	"unit_price" numeric(15, 2),
	"remark" text,
	"cost_type" "cost_type"
);
--> statement-breakpoint
CREATE TABLE "proposal_personnel_costs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"personnel_type" "personnel_type" NOT NULL,
	"position" varchar(255),
	"degree" varchar(255),
	"field_of_study" varchar(255),
	"experience_years" numeric(4, 1),
	"base_salary" numeric(15, 2),
	"multiplier" numeric(5, 2),
	"person_count" integer,
	"duration_months" integer
);
--> statement-breakpoint
CREATE TABLE "proposal_personnel_responsibilities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"position" varchar(255),
	"responsibility" text
);
--> statement-breakpoint
CREATE TABLE "proposal_related_projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"project_name" text,
	"agency" varchar(255),
	"fiscal_year" varchar(10),
	"relation_type" varchar(255),
	"remark" text
);
--> statement-breakpoint
CREATE TABLE "proposal_software_costs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"item_name" text,
	"quantity" integer,
	"unit_price" numeric(15, 2),
	"reference_type" "reference_type",
	"mdes_month" varchar(50),
	"mdes_year" varchar(10),
	"mdes_item_no" varchar(100),
	"market_count" integer,
	"market_company" text,
	"prev_project" text,
	"prev_year" varchar(10),
	"other_detail" text
);
--> statement-breakpoint
CREATE TABLE "proposal_training_food_costs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"training_id" uuid NOT NULL,
	"item_name" "food_type" NOT NULL,
	"meals_count" integer NOT NULL,
	"rate_per_meal" numeric(10, 2) NOT NULL,
	"trainees_count" integer NOT NULL,
	"days" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_training_speaker_costs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"training_id" uuid NOT NULL,
	"item_name" text NOT NULL,
	"hours" integer NOT NULL,
	"rate_per_hour" numeric(10, 2) NOT NULL,
	"days" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "proposal_trainings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"proposal_id" uuid NOT NULL,
	"course_name" text,
	"training_method" varchar(255),
	"location_type" "location_type",
	"has_speaker_cost" boolean DEFAULT false,
	"speaker_reason" text
);
--> statement-breakpoint
CREATE TABLE "proposals" (
	"id" uuid PRIMARY KEY NOT NULL,
	"status" "proposal_status" DEFAULT 'draft' NOT NULL,
	"project_id" uuid,
	"user_id" uuid NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1,
	"project_name" text,
	"agency_name" varchar(255),
	"head_of_agency" varchar(255),
	"dcio_name" varchar(255),
	"project_manager" varchar(255),
	"total_budget" numeric(15, 2),
	"background" text,
	"objective" text,
	"target" text,
	"scope" text,
	"project_type" "project_type",
	"current_system_status" text,
	"current_problems" text,
	"is_bma_plan" boolean DEFAULT false,
	"is_agency_plan" boolean DEFAULT false,
	"agency_strategy" text,
	"agency_issue" text,
	"agency_kpi" text,
	"is_governor_policy" boolean DEFAULT false,
	"governor_policy_code" varchar(100),
	"governor_policy_name" text,
	"obstacle_laws" text,
	"app_architecture" text,
	"data_owner" varchar(255),
	"data_exchange_plan" text,
	"is_ready" boolean DEFAULT false,
	"readiness_details" text,
	"duration_days" integer,
	"other_readiness" text,
	"expected_benefits" text,
	"is_in_roadmap" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "proposals_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "agendas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"meeting_id" uuid NOT NULL,
	"project_id" uuid,
	"agenda_number" varchar(50) NOT NULL,
	"sort_order" integer NOT NULL,
	"agenda_type_id" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meeting_attachments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"meeting_id" uuid NOT NULL,
	"agenda_id" uuid,
	"meeting_doc_type_id" integer NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"file_name" varchar(500) NOT NULL,
	"file_url" varchar(1000) NOT NULL,
	"file_type" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"meeting_no" varchar(100) NOT NULL,
	"title" varchar(500) NOT NULL,
	"meeting_type_id" integer NOT NULL,
	"meeting_date" timestamp NOT NULL,
	"location" varchar(500),
	"meeting_status_id" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "resolutions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"agenda_id" uuid NOT NULL,
	"resolution_status_id" integer NOT NULL,
	"comment" text,
	"recorded_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resolutions_agenda_id_unique" UNIQUE("agenda_id")
);
--> statement-breakpoint
CREATE TABLE "project_status_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"old_status_id" integer NOT NULL,
	"new_status_id" integer NOT NULL,
	"remark" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_department_id_departments_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("department_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_user" ADD CONSTRAINT "role_user_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_user" ADD CONSTRAINT "role_user_role_id_roles_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("role_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_user" ADD CONSTRAINT "role_user_assigned_by_users_user_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_login_history" ADD CONSTRAINT "user_login_history_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_division_id_divisions_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("division_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_doc_type_id_project_attachment_types_doc_type_id_fk" FOREIGN KEY ("doc_type_id") REFERENCES "public"."project_attachment_types"("doc_type_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_uploaded_by_users_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_division_id_divisions_division_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("division_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_status_id_project_statuses_project_status_id_fk" FOREIGN KEY ("project_status_id") REFERENCES "public"."project_statuses"("project_status_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_project_type_id_project_types_project_type_id_fk" FOREIGN KEY ("project_type_id") REFERENCES "public"."project_types"("project_type_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_four_quadrants_id_four_quadrants_id_fk" FOREIGN KEY ("four_quadrants_id") REFERENCES "public"."four_quadrants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_deputy_governor_id_deputy_governors_id_fk" FOREIGN KEY ("deputy_governor_id") REFERENCES "public"."deputy_governors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_drafts" ADD CONSTRAINT "proposal_drafts_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_drafts" ADD CONSTRAINT "proposal_drafts_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_budgets" ADD CONSTRAINT "proposal_budgets_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_cloud_requests" ADD CONSTRAINT "proposal_cloud_requests_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_cloud_vms" ADD CONSTRAINT "proposal_cloud_vms_cloud_request_id_proposal_cloud_requests_id_fk" FOREIGN KEY ("cloud_request_id") REFERENCES "public"."proposal_cloud_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_existing_equipments" ADD CONSTRAINT "proposal_existing_equipments_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_hardware_costs" ADD CONSTRAINT "proposal_hardware_costs_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_ict_personnel" ADD CONSTRAINT "proposal_ict_personnel_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_manpower" ADD CONSTRAINT "proposal_manpower_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_other_costs" ADD CONSTRAINT "proposal_other_costs_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_personnel_costs" ADD CONSTRAINT "proposal_personnel_costs_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_personnel_responsibilities" ADD CONSTRAINT "proposal_personnel_responsibilities_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_related_projects" ADD CONSTRAINT "proposal_related_projects_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_software_costs" ADD CONSTRAINT "proposal_software_costs_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_training_food_costs" ADD CONSTRAINT "proposal_training_food_costs_training_id_proposal_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."proposal_trainings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_training_speaker_costs" ADD CONSTRAINT "proposal_training_speaker_costs_training_id_proposal_trainings_id_fk" FOREIGN KEY ("training_id") REFERENCES "public"."proposal_trainings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposal_trainings" ADD CONSTRAINT "proposal_trainings_proposal_id_proposals_id_fk" FOREIGN KEY ("proposal_id") REFERENCES "public"."proposals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agendas" ADD CONSTRAINT "agendas_agenda_type_id_agenda_types_id_fk" FOREIGN KEY ("agenda_type_id") REFERENCES "public"."agenda_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD CONSTRAINT "meeting_attachments_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD CONSTRAINT "meeting_attachments_agenda_id_agendas_id_fk" FOREIGN KEY ("agenda_id") REFERENCES "public"."agendas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD CONSTRAINT "meeting_attachments_meeting_doc_type_id_meeting_attachment_types_id_fk" FOREIGN KEY ("meeting_doc_type_id") REFERENCES "public"."meeting_attachment_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_attachments" ADD CONSTRAINT "meeting_attachments_uploaded_by_users_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_meeting_type_id_meeting_types_id_fk" FOREIGN KEY ("meeting_type_id") REFERENCES "public"."meeting_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_meeting_status_id_meeting_statuses_id_fk" FOREIGN KEY ("meeting_status_id") REFERENCES "public"."meeting_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_created_by_users_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_updated_by_users_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resolutions" ADD CONSTRAINT "resolutions_agenda_id_agendas_id_fk" FOREIGN KEY ("agenda_id") REFERENCES "public"."agendas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resolutions" ADD CONSTRAINT "resolutions_resolution_status_id_resolution_statuses_id_fk" FOREIGN KEY ("resolution_status_id") REFERENCES "public"."resolution_statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resolutions" ADD CONSTRAINT "resolutions_recorded_by_users_user_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD CONSTRAINT "project_status_logs_project_id_projects_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("project_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD CONSTRAINT "project_status_logs_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD CONSTRAINT "project_status_logs_old_status_id_project_statuses_project_status_id_fk" FOREIGN KEY ("old_status_id") REFERENCES "public"."project_statuses"("project_status_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_status_logs" ADD CONSTRAINT "project_status_logs_new_status_id_project_statuses_project_status_id_fk" FOREIGN KEY ("new_status_id") REFERENCES "public"."project_statuses"("project_status_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agendas_meeting_sort_order_idx" ON "agendas" USING btree ("meeting_id","sort_order");