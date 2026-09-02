import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".next/static");
const forbidden = [
  /(?:10\.(?:[0-9]{1,3}\.){2}[0-9]{1,3})/i,
  /(?:172\.(?:1[6-9]|2[0-9]|3[0-1])\.(?:[0-9]{1,3}\.)[0-9]{1,3})/i,
  /(?:192\.168\.(?:[0-9]{1,3}\.)[0-9]{1,3})/i,
  /DATABASE_URL/i,
  /POSTGRES_PASSWORD/i,
  /JWT_SECRET/i,
  /PRIVATE_KEY/i,
  /host\.docker\.internal/i,
  /:5432(?:\b|\/)/i,
  /:8081(?:\b|\/)/i,
];

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path));
    else files.push(path);
  }
  return files;
}

const files = await filesIn(root);
const matches = [];
for (const file of files) {
  const body = await readFile(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(body)) matches.push(`${file}: ${pattern}`);
  }
}

if (matches.length) {
  console.error("Forbidden infrastructure data found in browser assets:");
  console.error(matches.join("\n"));
  process.exit(1);
}

console.log(`Browser bundle leakage scan passed (${files.length} files).`);
