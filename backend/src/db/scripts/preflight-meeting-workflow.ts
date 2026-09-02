import postgres from "postgres";
import { databaseEnv } from "@/config/database-env";

const canonicalByLegacyValue: Record<string, string> = {
  APPROVED: "APPROVED",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  CONDITIONAL_APPROVAL: "CONDITIONAL_APPROVAL",
  RECONSIDER: "RECONSIDER",
  NOT_APPROVED: "NOT_APPROVED",
  NOT_CONSIDERED: "NOT_CONSIDERED",
};

type LegacyResolution = {
  resolutionId: string;
  statusId: number;
  statusCode: string | null;
  statusName: string;
};

export async function preflightMeetingWorkflow() {
  const client = postgres(databaseEnv.DATABASE_URL, { max: 1, connect_timeout: 10 });
  try {
    const [tables] = await client<{ resolutions: string | null; statuses: string | null }[]>`
      select
        to_regclass('public.resolutions')::text as resolutions,
        to_regclass('public.resolution_statuses')::text as statuses
    `;

    if (!tables?.resolutions || !tables.statuses) {
      console.log(JSON.stringify({
        check: "meeting-workflow-resolution-mapping",
        result: "not-applicable",
        reason: "Legacy meeting tables do not exist yet.",
      }, null, 2));
      return;
    }

    const hasCode = await client<{ exists: boolean }[]>`
      select exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'resolution_statuses'
          and column_name = 'code'
      ) as exists
    `;

    const rows = hasCode[0]?.exists
      ? await client<LegacyResolution[]>`
          select r.id as "resolutionId", rs.id as "statusId",
                 rs.code as "statusCode", rs.name as "statusName"
          from resolutions r
          join resolution_statuses rs on rs.id = r.resolution_status_id
          order by r.id
        `
      : await client<LegacyResolution[]>`
          select r.id as "resolutionId", rs.id as "statusId",
                 null::text as "statusCode", rs.name as "statusName"
          from resolutions r
          join resolution_statuses rs on rs.id = r.resolution_status_id
          order by r.id
        `;

    const report = rows.map((row) => {
      const source = (row.statusCode || row.statusName)
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_");
      return { ...row, source, canonical: canonicalByLegacyValue[source] ?? null };
    });
    const ambiguous = report.filter((item) => !item.canonical);

    console.log(JSON.stringify({
      check: "meeting-workflow-resolution-mapping",
      result: ambiguous.length ? "manual-remediation-required" : "ready",
      mappedCount: report.length - ambiguous.length,
      ambiguousCount: ambiguous.length,
      ambiguous,
      remediation: ambiguous.length
        ? "Update the listed resolution_statuses rows to one of APPROVED, ACKNOWLEDGED, CONDITIONAL_APPROVAL, RECONSIDER, NOT_APPROVED, or NOT_CONSIDERED, then rerun this command."
        : null,
    }, null, 2));

    if (ambiguous.length) process.exitCode = 1;
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  await preflightMeetingWorkflow();
}
