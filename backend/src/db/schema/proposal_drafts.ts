import { 
  pgTable, 
  uuid, 
  integer, 
  text, 
  numeric, 
  jsonb, 
  timestamp 
} from "drizzle-orm/pg-core";
import { projects } from "./projects";
import { users } from "./users";

export const proposalDrafts = pgTable("proposal_drafts", {
  id: uuid("draft_id").primaryKey(),
  
  // Relations
  projectId: uuid("project_id").references(() => projects.id).unique(), // 1-to-1 กับตาราง projects
  userId: uuid("user_id").references(() => users.userId).notNull(),
  
  // Summary Fields (สำหรับดึงไปโชว์ในหน้าตาราง List อย่างรวดเร็ว โดยไม่ต้อง Parse JSON)
  projectName: text("project_name"),
  objective: text("objective"),
  requestedBudgetTotal: numeric("requested_budget_total", { precision: 15, scale: 2 }),
  estimatedCostTotal: numeric("estimated_cost_total", { precision: 15, scale: 2 }),
  
  // บันทึกว่ากรอกฟอร์มค้างไว้ที่ Step ไหน (1-5)
  currentStep: integer("current_step").default(1).notNull(),
  
  // เก็บ Data ทั้งก้อนจาก Frontend (Zustand Store)
  draftPayload: jsonb("draft_payload"),
  
  // Audit Trail
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: uuid("updated_by"),
});

// Workflow 
// 1. When a user starts filling out a proposal form, the frontend sends the data to the backend to create a new draft entry in the `proposal_drafts` table.
// 2. The backend saves the draft data in the `draftPayload` column, along with the `userId`, `projectId`, and other relevant fields.
// 3. The user can continue editing the draft, and each time they save, the backend updates the `draftPayload` and `updatedAt` fields.
// 4. When the user is ready to submit the proposal, the backend can validate the draft data and create a new entry in the `proposals` table, copying over relevant fields from the draft.
// 5. After successful submission, the draft must be deleted.
