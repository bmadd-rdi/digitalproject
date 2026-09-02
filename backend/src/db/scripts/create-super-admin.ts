import { eq, or, sql } from "drizzle-orm";
import { z } from "zod";
import { v7 as uuidv7 } from "uuid";
import { departments, divisions } from "@/db/schema/lookups";
import { roleUsers, roles, users } from "@/db/schema/users";

type ParsedArgs = Record<string, string | boolean>;

function parseArgs(argv: string[]): ParsedArgs {
  const values: ParsedArgs = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") {
      values.help = true;
      continue;
    }
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    const [name, inlineValue] = argument.slice(2).split("=", 2);
    const value = inlineValue ?? argv[index + 1];
    if (!inlineValue && (!value || value.startsWith("--"))) {
      throw new Error(`Missing value for --${name}`);
    }
    values[name] = value;
    if (!inlineValue) index += 1;
  }
  return values;
}

function printUsage() {
  console.log(`Create the first Super Admin without demo data or manual SQL.

Required environment values:
  SUPER_ADMIN_PASSWORD       Password (12+ characters); never print or commit it.

Required options or matching environment values:
  --username                  SUPER_ADMIN_USERNAME
  --email                     SUPER_ADMIN_EMAIL
  --first-name                SUPER_ADMIN_FIRST_NAME
  --last-name                 SUPER_ADMIN_LAST_NAME

Optional:
  --division-id               SUPER_ADMIN_DIVISION_ID
  --division-code             SUPER_ADMIN_DIVISION_CODE
  --help

Example:
  SUPER_ADMIN_PASSWORD='use-a-temporary-secret' bun run db:create-super-admin \\
    -- --username=bootstrap-admin --email=admin@example.com \\
    --first-name=System --last-name=Administrator --division-code=26020000
`);
}

function value(args: ParsedArgs, optionName: string, envName: string) {
  const optionValue = args[optionName];
  if (typeof optionValue === "string" && optionValue.trim()) return optionValue.trim();
  const envValue = process.env[envName];
  return envValue?.trim() || undefined;
}

const args = parseArgs(process.argv.slice(2));
if (args.help) {
  printUsage();
  process.exit(0);
}

const input = z.object({
  username: z.string().trim().min(3).max(100),
  email: z.string().trim().email().max(255),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  password: z.string().min(12),
  divisionId: z.coerce.number().int().positive().optional(),
  divisionCode: z.string().trim().length(8).optional(),
}).superRefine((data, context) => {
  if (data.divisionId && data.divisionCode) {
    context.addIssue({
      code: "custom",
      path: ["divisionId"],
      message: "Use either division-id or division-code, not both",
    });
  }
});

const parsed = input.safeParse({
  username: value(args, "username", "SUPER_ADMIN_USERNAME"),
  email: value(args, "email", "SUPER_ADMIN_EMAIL"),
  firstName: value(args, "first-name", "SUPER_ADMIN_FIRST_NAME"),
  lastName: value(args, "last-name", "SUPER_ADMIN_LAST_NAME"),
  password: process.env.SUPER_ADMIN_PASSWORD,
  divisionId: value(args, "division-id", "SUPER_ADMIN_DIVISION_ID"),
  divisionCode: value(args, "division-code", "SUPER_ADMIN_DIVISION_CODE"),
});

if (!parsed.success) {
  console.error("Invalid Super Admin bootstrap input:");
  console.error(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"));
  process.exit(1);
}

const data = parsed.data;
const { db } = await import("@/db");

try {
  const hashedPassword = await Bun.password.hash(data.password);

  const result = await db.transaction(async (tx) => {
    // Serialize all bootstrap attempts. The role_user primary key only
    // prevents duplicate roles for one user; it cannot enforce one global
    // Super Admin across concurrent transactions.
    await tx.execute(sql`select pg_advisory_xact_lock(2026073001::bigint)`);

    const existingUser = await tx
      .select({ userId: users.userId, username: users.username, email: users.email })
      .from(users)
      .where(or(eq(users.username, data.username), eq(users.email, data.email)))
      .limit(1);

    if (existingUser[0]) {
      throw new Error(`A user already exists for username or email (userId: ${existingUser[0].userId})`);
    }

    const superAdminRole = await tx
      .select({ roleId: roles.roleId, roleName: roles.roleName })
      .from(roles)
      .where(or(eq(roles.code, "SUPER_ADMIN"), eq(roles.roleName, "SUPER_ADMIN")))
      .limit(1);

    if (!superAdminRole[0]) {
      throw new Error("SUPER_ADMIN role is missing; run migrations and db:seed:required first");
    }

    const existingSuperAdmin = await tx
      .select({ userId: roleUsers.userId })
      .from(roleUsers)
      .where(eq(roleUsers.roleId, superAdminRole[0].roleId))
      .limit(1);
    if (existingSuperAdmin[0]) {
      throw new Error(`A Super Admin already exists (userId: ${existingSuperAdmin[0].userId}); use protected user management instead`);
    }

    let divisionId: number | null = data.divisionId ?? null;
    if (data.divisionCode) {
      const division = await tx
        .select({ divisionId: divisions.divisionId })
        .from(divisions)
        .where(eq(divisions.divisionCode, data.divisionCode))
        .limit(1);
      if (!division[0]) throw new Error(`Division code not found: ${data.divisionCode}`);
      divisionId = division[0].divisionId;
    }

    if (divisionId !== null) {
      const division = await tx
        .select({ divisionId: divisions.divisionId, departmentId: divisions.departmentId })
        .from(divisions)
        .innerJoin(departments, eq(divisions.departmentId, departments.departmentId))
        .where(eq(divisions.divisionId, divisionId))
        .limit(1);
      if (!division[0]) throw new Error(`Division ID not found: ${divisionId}`);
    }

    const userId = uuidv7();
    const [createdUser] = await tx.insert(users).values({
      userId,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      divisionId,
      password: hashedPassword,
      isActive: true,
      isVerified: true,
    }).returning({ userId: users.userId, username: users.username, email: users.email });

    await tx.insert(roleUsers).values({
      userId,
      roleId: superAdminRole[0].roleId,
      assignedBy: null,
    });

    return createdUser;
  });

  console.log(`Super Admin created successfully: ${result.username} (${result.userId})`);
  console.log("The account is active and email-verified. No password or token was printed.");
} catch (error) {
  const message = error instanceof Error ? error.message : "";
  const safeMessage = [
    /^A user already exists for username or email \(userId: [0-9a-f-]+\)$/i,
    /^A Super Admin already exists \(userId: [0-9a-f-]+\); use protected user management instead$/i,
    /^SUPER_ADMIN role is missing; run migrations and db:seed:required first$/,
    /^Division code not found: [A-Za-z0-9]{8}$/,
    /^Division ID not found: [0-9]+$/,
  ].some((pattern) => pattern.test(message))
    ? message
    : "Super Admin bootstrap failed; transaction rolled back and sensitive details were not exposed.";
  console.error(safeMessage);
  process.exitCode = 1;
} finally {
  await db.$client.end();
}
