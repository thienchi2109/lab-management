# US-XXX Story Title

## Status

planned

## Lane

tiny | normal | high-risk

## Product Contract

Describe the behavior this story must make true.

## Relevant Product Docs

- `docs/product/...`

## Acceptance Criteria

- Criterion 1.
- Criterion 2.
- Criterion 3.

## Design Notes

- Commands:
- Queries:
- API:
- Tables:
- Domain rules:
- UI surfaces:

## Frontend, Reuse, And Caching Constraints

- Any UI/frontend design, responsive layout, visual polish, dashboard
  interaction state, or browser verification work must invoke the Build Web Apps
  plugin capability before implementation.
- Before creating reusable UI, hooks, services, helpers, or shared logic, invoke
  the code-deduplication workflow and prove no suitable existing contract
  already exists.
- Use all suitable shared dashboard components by default, including forms,
  dialogs, filters, selects, messages, layout primitives, and tables. Table/list
  surfaces must use `DashboardDataTable` unless this story documents a reviewed
  exception.
- Default server-state strategy is Server Components, server actions,
  `useActionState`, and `revalidatePath`. Do not add TanStack Query unless this
  story documents a concrete client-cache requirement.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id <id> --unit 1 --integration 1 --e2e 0 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | |
| Integration | |
| E2E | |
| Platform | |
| Release | |

## Harness Delta

Document any harness updates made or proposed because of this story.

## Evidence

Add commands, reports, screenshots, or links after validation exists.
