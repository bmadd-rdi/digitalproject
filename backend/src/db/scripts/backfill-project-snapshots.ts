import { and, eq, isNull } from "drizzle-orm";
import { db } from "../index";
import { projects } from "../schema/projects";
import { proposals, proposalBudgets } from "../schema/proposals";
import { sumProposalBudgets } from "../../modules/proposals/proposal-budget.util";

/**
 * Non-destructive, rerunnable compatibility backfill for project snapshots.
 * It is intentionally a standalone command and is never executed at startup.
 */
const run = async () => {
  const projectsToBackfill = await db
    .select({ id: projects.id, projectName: projects.projectName })
    .from(projects)
    .where(isNull(projects.projectNameOriginal));

  for (const project of projectsToBackfill) {
    await db.update(projects)
      .set({ projectNameOriginal: project.projectName })
      .where(and(eq(projects.id, project.id), isNull(projects.projectNameOriginal)));
  }

  const budgetProjects = await db
    .select({ id: projects.id, projectId: proposals.id })
    .from(projects)
    .innerJoin(proposals, eq(proposals.projectId, projects.id))
    .where(and(
      isNull(projects.initialRequestedBudget),
      eq(proposals.status, "submitted"),
    ));

  for (const project of budgetProjects) {
    const budgets = await db
      .select({ amount: proposalBudgets.amount })
      .from(proposalBudgets)
      .where(eq(proposalBudgets.proposalId, project.projectId));

    // Leave ambiguous legacy records untouched. A submitted proposal with at
    // least one valid budget row is the only case treated as reliable.
    if (budgets.length === 0) continue;
    const total = sumProposalBudgets(budgets);
    await db.update(projects)
      .set({ initialRequestedBudget: total })
      .where(and(eq(projects.id, project.id), isNull(projects.initialRequestedBudget)));
  }

  console.log(`Backfilled ${projectsToBackfill.length} project name snapshots and ${budgetProjects.length} budget candidates`);
};

await run();
