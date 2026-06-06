# Design

## Domain Model

Describe entities, value objects, and business rules.

## Application Flow

Describe commands, queries, and handlers.

## Interface Contract

Describe routes, messages, commands, request DTOs, response DTOs, and errors.

## Data Model

Describe tables, indexes, migrations, and retention concerns.

## UI / Platform Impact

Describe browser, mobile, desktop, CLI, deployment, or platform-shell impact.

For UI/frontend work:

- Invoke the Build Web Apps plugin capability before implementation when the
  story touches UI structure, frontend design, responsive layout, visual polish,
  dashboard interaction states, or browser verification.
- Use all suitable shared dashboard components by default, including forms,
  dialogs, filters, selects, messages, layout primitives, and tables.
- Table/list surfaces must use `DashboardDataTable` unless this design documents
  a reviewed exception.
- Before creating reusable UI, hooks, services, helpers, or shared logic, invoke
  the code-deduplication workflow and prove no suitable existing contract
  already exists.
- Default server-state strategy is Server Components, server actions,
  `useActionState`, and `revalidatePath`. Do not add TanStack Query unless this
  design documents a concrete client-cache requirement.

## Observability

Describe logs, audit records, metrics, or traces.

## Alternatives Considered

1. Option.
