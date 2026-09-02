// src/db/schema/users.ts
// คุยกับ PostgreSQL โดยตรง (ผ่าน Drizzle ORM)
import { pgTable, serial, varchar, integer, boolean, timestamp, primaryKey, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { divisions } from "./lookups";

export const roles = pgTable("roles", {
  roleId: serial("role_id").primaryKey(),
  code: varchar("code", { length: 64 }).unique(),
  roleName: varchar("role_name", { length: 50 }).unique().notNull(),
  description: varchar("description", { length: 255 }),
});

export const users = pgTable("users", {
  userId: uuid("user_id").primaryKey(),
  username: varchar("username", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),

  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),

  position: varchar("position", { length: 150 }),
  level: varchar("level", { length: 100 }), // ระดับปฏิบัติงาน เช่น ปฏิบัติการ, ชำนาญการ
  managementPosition: varchar("management_position", { length: 150 }), // ตำแหน่งบริหาร เช่น ผู้อำนวยการกอง
  divisionId: integer("division_id").references(() => divisions.divisionId),

  mobilePhone: varchar("mobile_phone", { length: 20 }),
  officePhone: varchar("office_phone", { length: 20 }),
  internalExtension: varchar("internal_extension", { length: 10 }),

  // เก็บสถานะการใช้งานของผู้ใช้
  isActive: boolean("is_active").default(true).notNull(),
  // ลืมรหัสผ่านและยืนยันอีเมล
  resetPasswordToken: varchar("reset_password_token", { length: 255 }).unique(),
  resetPasswordExpires: timestamp("reset_password_expires"),

  // ทำระบบยืนยันอีเมล
  isVerified: boolean("is_verified").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 255 }).unique(),
  verificationExpires: timestamp("verification_expires"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Table เชื่อม ระหว่าง Users และ Roles (Many-to-Many)
export const roleUsers = pgTable("role_user", {
  userId: uuid("user_id")
    .references(() => users.userId)
    .notNull(),
  roleId: integer("role_id")
    .references(() => roles.roleId)
    .notNull(),
  assignedBy: uuid("assigned_by").references(() => users.userId),
  assignedAt: timestamp("assigned_at", { mode: "date" }).defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
  };
});

export const userLoginHistory = pgTable("user_login_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.userId, { onDelete: "cascade" })
    .notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: varchar("user_agent", { length: 512 }),
  loginAt: timestamp("login_at", { mode: "date" }).defaultNow().notNull(),
});

// --- Relations Section สำหรับ Drizzle Query ---
export const userRelations = relations(users, ({ one, many }) => ({
  division: one(divisions, {
    fields: [users.divisionId],
    references: [divisions.divisionId],
  }),
  roles: many(roleUsers),
  loginHistory: many(userLoginHistory),
}));

export const roleUserRelations = relations(roleUsers, ({ one }) => ({
  user: one(users, {
    fields: [roleUsers.userId],
    references: [users.userId],
  }),
  role: one(roles, {
    fields: [roleUsers.roleId],
    references: [roles.roleId],
  }),
}));

export const userLoginHistoryRelations = relations(userLoginHistory, ({ one }) => ({
  user: one(users, {
    fields: [userLoginHistory.userId],
    references: [users.userId],
  }),
}));
