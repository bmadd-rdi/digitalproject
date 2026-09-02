import { index, pgTable, uuid, integer, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";
import { projectStatuses } from "./lookups";
import { meetings, agendas, resolutions } from "./meetings";

export const projectStatusLogs = pgTable("project_status_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id").references(() => users.userId).notNull(),
  oldStatusId: integer("old_status_id").references(() => projectStatuses.id).notNull(),
  newStatusId: integer("new_status_id").references(() => projectStatuses.id).notNull(),
  remark: text("remark"),
  sourceOperation: varchar("source_operation", { length: 100 }),
  meetingId: uuid("meeting_id").references(() => meetings.id),
  agendaId: uuid("agenda_id").references(() => agendas.id),
  resolutionId: uuid("resolution_id").references(() => resolutions.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  projectStatusLogStatusIdx: index("project_status_logs_project_status_idx").on(table.projectId, table.newStatusId),
  projectStatusLogMeetingIdx: index("project_status_logs_meeting_idx").on(table.meetingId, table.agendaId, table.resolutionId),
}));
