import { eq } from "drizzle-orm";
import { v7 as uuidv7 } from "uuid";
import { projects } from "../../src/db/schema/projects";
import { divisions } from "../../src/db/schema/lookups";
import { PROJECT_STATUS } from "../../src/modules/projects/project-workflow";

export async function createTestProject(
  db: any,
  userId: string,
  options: {
    statusId?: number;
    projectName?: string;
    initialBudget?: number;
    projectTypeId?: number | null;
  } = {},
) {
  const [division] = await db.select().from(divisions).limit(1);
  if (!division) throw new Error("Required division lookup data is missing");

  const id = uuidv7();
  const projectName = options.projectName ?? `Integration project ${id.slice(-8)}`;
  const initialBudget = options.initialBudget ?? 100_000;
  const [project] = await db.insert(projects).values({
    id,
    projectCode: `IT-${id.slice(-12)}`,
    userId,
    divisionId: division.divisionId,
    projectStatusId: options.statusId ?? PROJECT_STATUS.DRAFT,
    projectTypeId: options.projectTypeId === undefined ? 1 : options.projectTypeId,
    fourQuadrantsId: 1,
    deputyGovernorId: 1,
    projectName,
    projectNameOriginal: projectName,
    initialRequestedBudget: String(initialBudget),
    latestApprovedBudget: String(initialBudget),
    isPublic: false,
  }).returning();

  return project;
}

export async function getProject(db: any, projectId: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return project;
}
