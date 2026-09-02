import { readFile, writeFile } from "node:fs/promises";

const outputPath = new URL("../src/types/api-schemas.ts", import.meta.url);
let source = await readFile(outputPath, "utf8");

// openapi-zod-client currently emits the Zod 3 one-argument form for this
// record. Zod 4 requires an explicit key schema.
const legacyRecord = "z.record(z.unknown().nullable())";
const zod4Record = "z.record(z.string(), z.unknown().nullable())";

if (source.includes(legacyRecord)) {
  source = source.replaceAll(legacyRecord, zod4Record);
}

// openapi-zod-client may place OpenAPI's nullable marker inside z.enum(),
// which is invalid in Zod 4. Nullability is already represented by .nullable().
source = source.replace(
  /z\.enum\(\[([\s\S]*?)\]\)(\s*\.nullable\(\))/g,
  (match, values, nullableCall) => {
    if (!/(^|[\s,])null([\s,]|$)/.test(values)) return match;
    const withoutNull = values
      .replace(/,\s*null\s*,?/g, ",")
      .replace(/^\s*null\s*,?/g, "")
      .replace(/,\s*$/g, "");
    return `z.enum([${withoutNull}])${nullableCall}`;
  },
);

await writeFile(outputPath, source, "utf8");
