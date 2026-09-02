# Meeting workflow

## Deployment order

1. Back up the database.
2. Run `bun run db:preflight:meeting-workflow`.
3. Resolve every ambiguous legacy resolution reported by the command.
4. Run `bun run db:migrate`.
5. Run `bun run db:seed:required`.
6. Regenerate the frontend OpenAPI types and schemas.

The preflight is read-only and exits unsuccessfully when a legacy resolution
cannot be mapped to one of the six canonical resolution types.

## Compatibility phase

The legacy resolution status foreign key and comment columns are retained.
New writes populate both the canonical and legacy fields. A later migration may
remove the legacy fields only after production data has been audited and all
consumers use `resolutionType` and `remark`.

## Workflow invariants

- Ordinary meeting transitions follow `DRAFT → SCHEDULED → IN_PROGRESS → COMPLETED`.
- Draft, scheduled, and resolution-free in-progress meetings may be cancelled.
- Completed and cancelled meetings are terminal.
- Project-linked agendas are assigned under a project row lock.
- A non-cancelled unresolved assignment blocks another assignment at the same board stage.
- Resolutions, project status, exact budget reconciliation, revisions, and logs are committed together.
- Meeting documents and minutes are private and require the actual `SECRETARY` role.
- Owners and assigned Analysts receive only meeting metadata and agenda/resolution data scoped to their project.

## Budget and proposal history

Proposal budget totals use the exact decimal proposal budget utility. Big Board
`APPROVED` and `ACKNOWLEDGED` outcomes freeze the current exact value in
`latestApprovedBudget`; `initialRequestedBudget` is never changed.

Rejected-project reopening preserves all previous proposals and meeting history.
It creates or replaces the editable draft, preserves the assigned Analyst, sets
`returnStage`, and records immutable status and audit logs.

## Concurrency

Meeting cancellation, agenda assignment, and resolution creation use the lock
order meeting → agenda → project. Conflicting operations return `409 Conflict`
and do not leave partial workflow state.

## Files

Meeting files use the existing private upload storage configured by
`UPLOAD_STORAGE_DIR`. Database insertion occurs before the external side effect
is considered successful; failed inserts remove the newly written file.
