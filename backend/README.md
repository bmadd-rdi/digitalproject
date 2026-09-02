# BMA Digital Project Backend

The Backend is the BMA Digital Project API. It owns authentication,
authorization, project and proposal workflows, meetings, lookups, file metadata,
and audit-related business rules. The Frontend consumes its versioned HTTP API;
PostgreSQL stores relational data and the configured upload directory stores file
contents.

## Background and purpose

BMA Digital Project supports the Bangkok Metropolitan Administration’s process
for proposing, reviewing, coordinating, and tracking digital projects. The
system brings project proposals, budgets, technical details, department
collaboration, secretary and analyst review, meetings, and board decisions
into one shared and auditable workflow.

The Backend is the system-of-record API for this process. It validates and
persists workflow state, protects data with authentication and role-based
authorization, calculates financial summaries with exact decimal handling, and
keeps proposal, meeting, upload, and audit data consistent.

## Technology stack

- Bun 1.3.5 and TypeScript
- Hono with `@hono/zod-openapi` and Swagger UI
- PostgreSQL with Drizzle ORM and Drizzle Kit
- Zod and `drizzle-zod` validation
- Nodemailer/Resend adapters and Ghostscript-backed PDF compression
- Bun's test runner, Docker, and Docker Compose

## Prerequisites

- Bun 1.3.5 or a compatible Bun release
- PostgreSQL for development, or Docker Desktop/Compose for the test database
- Docker for building and running the production image

## Quick start

Install dependencies from this directory:

```bash
bun install --frozen-lockfile
```

Create an untracked `.env` file with the required variables shown below. This
repository currently provides [`.env.test.example`](.env.test.example) for test
configuration, but does not include a committed development `.env.example`.

Prepare a development database explicitly, then start the API:

```bash
bun run db:migrate
bun run db:seed:required
bun run dev
```

With `PORT=8081`, useful local URLs are:

- API: `http://localhost:8081/api/v1`
- OpenAPI JSON: `http://localhost:8081/openapi-v1.json`
- Swagger UI: `http://localhost:8081/docs/`

Do not run demo seed data against shared, staging, or production databases.

## Environment variables

The runtime validates its environment in
[`src/config/app-env.ts`](src/config/app-env.ts). Values below are safe examples,
not deployable secrets.

| Variable | Required | Purpose | Safe example |
| --- | --- | --- | --- |
| `NODE_ENV` | No | `development`, `test`, or `production` | `development` |
| `PORT` | No | HTTP listening port | `8081` |
| `DATABASE_URL` | Yes | PostgreSQL connection URL | `postgresql://app_user:URL_ENCODED_PASSWORD@127.0.0.1:5432/bma_db` |
| `JWT_SECRET` | Yes | JWT signing secret; at least 32 characters | Generate a unique local secret |
| `PUBLIC_API_URL` | No | Public API base URL used in generated links | `http://localhost:8081/api/v1` |
| `CORS_ORIGINS` | No | Comma-separated allowed browser origins | `http://localhost:3000` |
| `UPLOAD_STORAGE_DIR` | No | Filesystem directory for uploads | `./uploads` |
| `MAX_UPLOAD_SIZE` | No | Global upload limit in bytes | `26214400` |
| `TRUST_PROXY` | No | Trust forwarded proxy headers | `false` |
| `COOKIE_SECURE` | No | Mark cookies secure | `false` locally |
| `COOKIE_SAME_SITE` | No | Cookie same-site policy | `lax` |
| `COOKIE_DOMAIN` | No | Optional cookie domain | empty |

Production also requires an absolute upload path, explicit non-wildcard CORS,
and a non-placeholder `JWT_SECRET`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the API with hot reload. |
| `bun run start` | Start the production entry point. |
| `bun run typecheck` | Run TypeScript validation. |
| `bun run db:generate` | Generate Drizzle migration artifacts from schema changes. |
| `bun run db:migrate` | Run the migration preflight and apply migrations. Use only on the intended database. |
| `bun run db:seed:required` | Seed required lookup and constant data; idempotent for supported data. |
| `bun run db:seed:demo` | Add development demo data. Do not use in staging or production. |
| `bun run db:create-super-admin` | Create the first Super Admin from environment/CLI input. Sensitive administrative operation. |
| `bun run db:backfill-attachment-sizes` | Backfill attachment metadata. Review scope before running. |
| `bun run db:backfill-project-snapshots` | Backfill project financial snapshots. Review scope before running. |
| `bun run db:reset-attachment-types` | Development-only attachment-type reset. Destructive. |
| `bun run test` | Run unit tests. |
| `bun run test:integration` | Prepare the test database and run integration tests. |
| `bun run test:coverage` | Run unit and integration tests with coverage. |
| `bun run test:all` | Run typecheck, unit tests, and integration tests. |
| `bun run test:ci` | Run the full backend CI command set. |
| `bun run test:db:up` / `test:db:down` | Start or stop the dedicated test PostgreSQL service. |
| `bun run test:db:prepare` | Migrate and seed the dedicated test database. |
| `bun run test:db:reset` | Reset only the explicitly named test database/volume. Destructive. |
| `bun run test:contract:backend` | Verify Backend OpenAPI registration and schemas. |
| `bun run test:contract:frontend` | Verify Frontend generation when the sibling Frontend repository is available. |

## Architecture

```text
src/
  app.ts                 API composition and dependency injection
  index.ts               production bootstrap
  config/                validated runtime configuration
  db/                    connection, Drizzle schema, migrations, seeds, scripts
  middlewares/           authentication and request middleware
  modules/               feature routes, schemas, controllers, and services
  infrastructure/        email, files, and external adapters
  shared/                authorization, time, and cross-cutting utilities
  jobs/                  explicitly started background jobs
tests/
  unit/ integration/     focused and API-level regression coverage
  setup/ fixtures/       test database lifecycle and reusable data
```

Routes define OpenAPI-aware contracts and validation. Controllers translate HTTP
requests into service calls; services own workflow, transaction, and persistence
rules. Feature modules may have additional helpers where the domain needs them.

## Database workflow

Apply migrations and required lookup data as explicit operations. Application
startup does not run migrations, seeds, or demo data. Integration tests use the
dedicated `TEST_DATABASE_URL`; they must never point at development, staging, or
production data.

Proposal financial values use exact-decimal handling. Do not replace budget or
cost calculations with JavaScript floating-point arithmetic.

## Authentication and authorization

Authentication is JWT-based and authorization is enforced by Backend policies.
RBAC, department collaboration rules, project state, and assignment determine
what a caller can do. Project responses may include resolved capabilities such
as `canEditProject`, `canEditProposal`, and `canSubmitProposal`; clients must not
treat their own visibility logic as an authorization boundary.

Mutations should preserve the authenticated actor and existing audit/status-log
expectations. Administrative bootstrap and workflow corrections are intentionally
separate from ordinary user operations.

## API documentation and health checks

- `GET /openapi-v1.json` exposes the generated OpenAPI document.
- `GET /docs/` serves Swagger UI.
- `GET /health/live` checks that the process can serve requests; it does not
  require PostgreSQL.
- `GET /health/ready` checks PostgreSQL and verifies upload-directory write
  access with a temporary exclusive probe file.

## File uploads

Upload metadata is stored in PostgreSQL while file contents are written to
`UPLOAD_STORAGE_DIR` (a mounted volume in containers). Upload routes enforce
validation and authorization; meeting files remain private to authorized roles.
Back up the database and upload storage together to retain valid metadata/file
relationships.

## Testing and verification

Start the isolated test database from the sibling Infrastructure repository:

```bash
bun run test:db:up
bun run test:db:prepare
bun run test:all
bun run test:db:down
```

The normal shutdown preserves the test volume. `test:db:reset` is the only
reset command and must be used only for the named test environment.

## Docker and deployment

The [`Dockerfile`](Dockerfile) builds a non-root Bun image, exposes port 8081,
and expects runtime configuration including `DATABASE_URL` and an upload mount.
For local Compose, staging image references, Nginx routing, backups, and
production procedures, use the sibling
[Infrastructure runbook](../infrastructure/docs/staging-runbook.md).

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Configuration error at startup | Confirm required `.env` values, URL syntax, and a 32+ character `JWT_SECRET`. |
| Database connection failure | Confirm PostgreSQL is running, `DATABASE_URL` targets the intended database, and migrations have been applied. |
| Lookup-related validation failure | Run `bun run db:seed:required` against the intended local/test database. |
| Port already in use | Change `PORT` or stop the process using the selected port. |
| Readiness returns `503` | Check PostgreSQL connectivity and upload-directory existence/write permissions. |
| Upload fails after deployment | Verify the mounted upload path, ownership, free space, and configured size/type rules. |
