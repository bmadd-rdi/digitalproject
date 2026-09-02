# BMA Digital Project Frontend

The Frontend is the browser and server-rendered user interface for BMA Digital
Project workflows. It uses the Backend's versioned API and OpenAPI document;
PostgreSQL and business authorization remain Backend responsibilities.

## Background and purpose

BMA Digital Project is intended to give BMA staff a single interface for
preparing and following digital-project proposals. It brings project
information, budgets, supporting documents, review feedback, meetings, and
board decisions into one workflow so users can see the current state and the
actions they are permitted to take.

The Frontend turns the Backend workflow into role-aware screens for project
owners and collaborators, secretaries, analysts, administrators, and board
reviewers. It focuses on clear proposal editing, status tracking, validation,
and responsive access to the authoritative data served by the Backend.

## Technology stack

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS, Base UI, and project UI components
- TanStack Query for server-state caching and mutations
- React Hook Form and Zod validation
- Zodios/OpenAPI-generated types and schemas
- Bun test runner, ESLint, pnpm, and Docker

## Prerequisites

- Node.js 24 (the Docker image uses 24.6.0)
- pnpm 11.13.0, managed through Corepack when needed
- A running Backend for authenticated flows, API generation, and end-to-end
  browser verification

## Quick start

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Create an untracked `.env.local` from [`.env.example`](.env.example). For a
same-origin proxy, keep the browser API path relative and provide a server-only
Backend URL:

```dotenv
NEXT_PUBLIC_API_URL=/api/v1
BACKEND_URL=http://localhost:8081
```

Start the development server:

```bash
pnpm dev
```

Open `http://localhost:3000`. A direct development setup without a same-origin
proxy may set `NEXT_PUBLIC_API_URL=http://localhost:8081/api/v1`; do not use
private infrastructure addresses in browser-exposed production variables.

## Environment variables

| Variable | Scope | Purpose | Safe example |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser-exposed | API base path used by client requests | `/api/v1` |
| `BACKEND_URL` | Server-only | Backend base URL used by server actions/fetches | `http://localhost:8081` |
| `COOKIE_SECURE` | Server-only | Secure cookie behavior | `false` locally |
| `COOKIE_SAME_SITE` | Server-only | Cookie same-site policy | `lax` |
| `COOKIE_DOMAIN` | Server-only | Optional cookie domain | empty |
| `OPENAPI_URL` | Generation only | OpenAPI document source | `http://localhost:8081/openapi-v1.json` |

Only values prefixed with `NEXT_PUBLIC_` are bundled into browser code. Never
put database URLs, JWT secrets, filesystem paths, or private network addresses
in browser-exposed variables.

## Available scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js development server. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Start a completed production build. |
| `pnpm lint` | Run ESLint. |
| `pnpm typecheck` | Run TypeScript validation. |
| `pnpm test` | Run Bun tests. |
| `pnpm scan:browser-bundle` | Scan built browser assets for private infrastructure values. Run after `pnpm build`. |
| `pnpm generate:types` | Generate `src/types/api.d.ts` from OpenAPI. |
| `pnpm generate:schemas` | Generate and normalize `src/types/api-schemas.ts` from OpenAPI. |
| `pnpm clean` | Remove `.next` and start development mode. |

## Architecture

```text
src/
  app/                   App Router pages, layouts, and route composition
  features/              domain UI, hooks, actions, forms, and mutations
  components/            shared application and UI components
  hooks/                 cross-feature React hooks
  lib/                   API clients, server fetches, and utilities
  types/                 generated API contracts and local type declarations
  data/ utils/           shared data and utility helpers
scripts/
  generate-openapi.mjs   contract generation entry point
  scan-browser-bundle.mjs browser bundle safety check
```

Keep feature-specific behavior within `src/features`. App Router files should
compose pages and layouts rather than duplicate domain logic. Generated files in
`src/types` are outputs, not hand-maintained source.

## Frontend data flow

The Backend OpenAPI document is the contract source. Query hooks own stable
query keys, mutations invalidate/refetch affected project, proposal, meeting,
and lookup data, and forms submit validated API payloads.

The Backend resolves workflow capabilities such as project/proposal edit and
submit permissions. Use those returned capabilities to render controls. Client
visibility checks improve UX only; they are never an authorization boundary.

## Forms and workflow UI

The proposal workspace includes a five-step form with draft hydration,
field-level validation, and separate editable-draft and submitted-history views.
Project status and Backend capabilities control editable actions and submission
controls. Preserve unsaved form data where practical, and refresh relevant query
state after successful workflow mutations or `409 Conflict` responses.

## API contract generation

Start the Backend or make its OpenAPI document reachable, then generate both
outputs from the same source:

```bash
OPENAPI_URL=http://localhost:8081/openapi-v1.json pnpm generate:types
OPENAPI_URL=http://localhost:8081/openapi-v1.json pnpm generate:schemas
```

In PowerShell, set `$env:OPENAPI_URL` before the command. Do not manually edit
[`src/types/api.d.ts`](src/types/api.d.ts) or
[`src/types/api-schemas.ts`](src/types/api-schemas.ts); regenerate them instead.

## Testing and verification

Run the normal local checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm scan:browser-bundle
```

Use browser verification for role-based workflows, stale query behavior,
responsive layouts, and authenticated API actions. Confirm the active Backend
and same-origin proxy configuration before interpreting client API failures.

## Docker and deployment

The [`Dockerfile`](Dockerfile) builds a standalone Next.js image that runs as
the non-root `nextjs` user on port 3000. In deployed environments, Nginx routes
browser `/api/v1` requests to the Backend while `BACKEND_URL` remains server-only.
See the sibling [Infrastructure runbook](../infrastructure/docs/staging-runbook.md)
for Compose, immutable image references, Nginx, staging, and production steps.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| API requests fail in the browser | Confirm `NEXT_PUBLIC_API_URL`, the same-origin proxy, CORS, and the Backend health endpoints. |
| Server action cannot reach the API | Set `BACKEND_URL`; it must be reachable from the Next.js server/container. |
| Data looks stale after a mutation | Inspect the feature's query invalidation/refetch behavior and refresh on `409 Conflict`. |
| Generated types do not match the API | Regenerate both outputs from the intended `OPENAPI_URL`; do not edit generated files. |
| Hydration or client-boundary error | Check Server/Client Component boundaries and browser-only access in `use client` code. |
| Production build fails | Run `pnpm typecheck`, inspect `.env.local`, and remove stale `.next` output with `pnpm clean`. |
| Nested scrolling or overflow | Check the route layout's height and `min-h-0`/overflow ownership; keep one intentional scroll region. |
