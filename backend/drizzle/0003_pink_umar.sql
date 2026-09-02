DROP INDEX "agendas_meeting_sort_order_idx";--> statement-breakpoint
DROP INDEX "agendas_meeting_project_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "agendas_meeting_sort_order_idx" ON "agendas" USING btree ("meeting_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "agendas_meeting_project_idx" ON "agendas" USING btree ("meeting_id","project_id") WHERE "agendas"."project_id" is not null;