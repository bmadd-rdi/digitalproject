import { configureTestEnvironment } from "./env";
import { FakeClock, FakeEmailService, FakePdfCompressor } from "./fakes";

let contextPromise: Promise<any> | undefined;

export function getIntegrationContext() {
  contextPromise ??= (async () => {
    await configureTestEnvironment();
    const [
      { db },
      { createApp },
      { proposalService },
      projectService,
      projectDbSchema,
      proposalDbSchema,
      { proposalDrafts },
      { projectStatusLogs },
      userSchema,
      lookupSchema,
    ] = await Promise.all([
      import("../../src/db"),
      import("../../src/app"),
      import("../../src/modules/proposals/proposal.service"),
      import("../../src/modules/projects/project.service"),
      import("../../src/db/schema/projects"),
      import("../../src/db/schema/proposals"),
      import("../../src/db/schema/proposal_drafts"),
      import("../../src/db/schema/project_status_logs"),
      import("../../src/db/schema/users"),
      import("../../src/db/schema/lookups"),
    ]);

    const emailService = new FakeEmailService();
    const pdfCompressor = new FakePdfCompressor();
    const clock = new FakeClock();
    const app = createApp({ startJobs: false, emailService, pdfCompressor, clock });

    const [{ databaseName }] = await db.execute<{ databaseName: string }>(
      (await import("drizzle-orm")).sql`select current_database() as "databaseName"`,
    );
    if (databaseName !== "bma_test") throw new Error(`Refusing database ${databaseName}`);

    return {
      db,
      app,
      proposalService,
      projectService,
      emailService,
      pdfCompressor,
      clock,
      ...projectDbSchema,
      ...proposalDbSchema,
      proposalDrafts,
      projectStatusLogs,
      ...userSchema,
      ...lookupSchema,
    };
  })();

  return contextPromise;
}
