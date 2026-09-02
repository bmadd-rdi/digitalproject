# Backend automated testing

The backend test suite uses only the dedicated PostgreSQL database `bma_test`.
It does not use a development, staging, or production database.

## Database lifecycle

Run these commands from `backend/`:

```text
bun run test:db:up
bun run test:db:prepare
bun run test
bun run test:integration
bun run test:coverage
bun run test:db:down
```

The test database is exposed on `127.0.0.1:55433` and uses the explicitly
named volume `infrastructure_bma_test_pg_data`. `test:db:down` preserves that
volume so normal shutdown does not remove test data.

`test:db:reset` is the only destructive command. It validates that
`TEST_DATABASE_URL` points exactly to `bma_test`, validates the exact volume
name, removes only `infrastructure_bma_test_pg_data`, starts the test
container again, and runs migrations plus required lookup seeding. It never
drops another database, removes another volume, truncates unknown tables, or
touches production data.

## Cleanup rules

Required lookup and constant rows are preserved. Integration tests track every
created user, meeting, and project ID and remove only those business records.
Children are removed in foreign-key order before their parents. Existing
transaction-aware services may use rollback; services that do not accept a
transaction use deterministic created-ID cleanup. No test relies on execution
order, although integration tests run sequentially for database isolation.

## Application factory and fakes

Importing `src/app.ts` never starts a server, cron job, migration, seed, or
production email/PDF service. Production startup is explicit in
`src/index.ts`:

```ts
const app = createApp({ startJobs: true });
```

Tests create the app with `startJobs: false` and inject `FakeEmailService`,
`FakePdfCompressor`, and `FakeClock`. The email fake records attempts and
successful deliveries, including recipient, email type, token, payload, and
timestamp. The PDF fake supports success and failure. The clock supports a
fixed time and manual advancement.

Email delivery is triggered only after the related database transaction has
committed. PostgreSQL and email are not claimed to be atomically consistent;
an outbox/retry system is outside this iteration.

## Proposal cancellation strategy

Cancel Submit locks the project, the submitted proposal, and all nested rows;
maps the complete graph into the canonical draft payload; validates and
persists the draft; verifies it; deletes the old proposal root; transitions
the project to `DRAFT`; and writes one status log, all in one transaction.
Any error rolls the transaction back, preserving the submitted proposal.
Project attachments are project-owned and are not deleted. Resubmission creates
a new proposal root, preserving business data and relationships while keeping
`projectNameOriginal` and `initialRequestedBudget` unchanged.

## Contract verification

Backend OpenAPI verification is independent of the frontend repository:

```text
bun run test:contract:backend
```

The frontend repository is expected at `../frontend` for local development,
or at `FRONTEND_DIR` when overridden. The separate frontend command requires
the backend OpenAPI endpoint and regenerates both frontend artifacts:

```text
bun run test:contract:frontend
```

In CI, check out backend and frontend as sibling directories (or set
`FRONTEND_DIR`) and run the backend contract job before the frontend generation
job. Backend tests must still pass when the frontend repository is absent.

## Authentication policy

The current policy is immediate JWT revocation: every authenticated request
checks `users.is_active`, so a previously issued JWT receives `401` after the
account is disabled. Login itself returns `403` with the inactive-account
message, and refresh also returns `401`.
