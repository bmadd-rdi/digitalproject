import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

export const workflowAuditEvents = pgTable("workflow_audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorId: uuid("actor_id").references(() => users.userId).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  workflowAuditEntityIdx: index("workflow_audit_events_entity_idx").on(table.entityType, table.entityId, table.createdAt),
  workflowAuditActorIdx: index("workflow_audit_events_actor_idx").on(table.actorId, table.createdAt),
}));
