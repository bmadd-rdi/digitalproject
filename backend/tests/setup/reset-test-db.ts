const composeFile = "../infrastructure/compose.test.yml";
const volumeName = "infrastructure_bma_test_pg_data";

function run(command: string[]) {
  const result = Bun.spawnSync(command, {
    cwd: process.cwd(),
    stdout: "inherit",
    stderr: "inherit",
  });
  if (result.exitCode !== 0) {
    throw new Error(`Command failed with exit code ${result.exitCode}: ${command.join(" ")}`);
  }
}

async function main() {
  const testDatabaseUrl = process.env.TEST_DATABASE_URL ??
    "postgresql://bma_test:bma_test_only_password@127.0.0.1:55433/bma_test";
  const parsedUrl = new URL(testDatabaseUrl);
  if (parsedUrl.protocol !== "postgresql:" && parsedUrl.protocol !== "postgres:") {
    throw new Error("TEST_DATABASE_URL must use PostgreSQL");
  }
  const databaseName = parsedUrl.pathname.replace(/^\//, "");
  if (databaseName !== "bma_test") throw new Error("Refusing to reset a non-test database");

  run(["docker", "compose", "-f", composeFile, "down"]);

  const volumeInspect = Bun.spawnSync(["docker", "volume", "inspect", volumeName]);
  if (volumeInspect.exitCode === 0) run(["docker", "volume", "rm", volumeName]);

  run(["docker", "compose", "-f", composeFile, "up", "-d", "--wait"]);
  run([process.execPath, "run", "tests/setup/prepare-db.ts"]);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error("Test database reset failed:", error);
    process.exitCode = 1;
  });
}
