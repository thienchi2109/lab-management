# Design

## Domain Model

US-005 uses three inventory concepts:

- Kit type: reusable definition of a test kit, tied to category/result-template
  behavior where the product contract already allows it.
- Kit batch: a purchased or received lot with lot code, expiry date, received
  quantity, and operational notes.
- Kit unit: an individual physical kit with a unique `kit_code`, tenant scope,
  current status, optional batch link, and audit trail.

The implementation should preserve the existing status vocabulary:

```text
in_stock -> assigned -> used
in_stock -> void | expired | lost
```

US-005 may expose only the transitions needed for inventory management. Sample
assignment remains a future story and must not be added here.

## Application Flow

The dashboard route should be `/dashboard/kits`.

Default flow:

1. Authenticated user opens the kit inventory page.
2. Server-side auth resolves the active profile, organization, and role.
3. Page loads summary counts, near-expiry kits, low-stock groups, kit types,
   batches, and paginated/filterable kit units.
4. User filters by kit type, batch, status, expiry window, or search text.
5. Admin creates or updates kit types and batches.
6. Admin or allowed lab staff registers individual kits for a batch.
7. Admin marks kits as void, expired, or lost with a reason.
8. Each write returns a user-facing success/error state and records audit
   evidence.

The first implementation should optimize for correctness and scanability, not
advanced warehouse features.

## Interface Contract

Server queries should return typed view models for:

- inventory summary metrics;
- kit type options;
- batch list rows;
- kit unit list rows;
- data-table column definitions or an equivalent shared row contract when the
  inventory list needs sorting, dense scanning, status actions, or responsive
  table behavior;
- status and expiry filter options;
- write action result messages.

Server actions should cover:

- create/update kit type;
- create/update kit batch;
- create kit units for a batch;
- mark kit status as void, expired, or lost;
- refresh-safe validation errors for duplicate kit codes, invalid status
  transitions, expired batches, and permission failures.

Every action must call `auth()` and check role/organization authorization at the
action boundary. Do not hide write authorization behind a helper that React
Doctor cannot detect.

## Data Model

Before implementation, inspect live Supabase schema through the approved
Supabase path and compare it with `docs/product/data-model.md`.

Expected entities:

- `kit_types`
- `kit_batches`
- `kits`
- `audit_events`

If the live schema already supports US-005, do not add a migration. If a schema
gap exists, use a forward-only migration and preserve the repo's RLS,
`search_path`, grant/revoke, and fail-closed patterns.

`kit_code` uniqueness must be enforced at the database layer or through an
existing unique constraint confirmed in live inspection. Client-side checks are
not enough.

## UI / Platform Impact

Use the existing dashboard surface and shared components first:

- layout and navigation from the dashboard shell;
- `DialogFrame` for create/edit/status dialogs;
- shared form fields for labeled inputs, validation text, and required-state
  styling;
- `FilterSelect` or `AppSelect` for status/type/batch filters;
- `ActionMessage` for server-action feedback;
- existing summary-card/table patterns where they match the inventory contract;
- an existing shared dashboard data-table component if present.

Create new shared UI only after invoking the code-deduplication workflow and
proving the existing component contract does not fit.

Current discovery found local table/list patterns such as
`app/dashboard/users/_components/user-table.tsx` and
`app/dashboard/result-configuration/_components/result-configuration-lists.tsx`,
but no confirmed shared data-table primitive. If implementation needs a true
datatable, do not copy either local implementation directly. Extract or create a
shared dashboard table component with a narrow contract, then reuse it from the
inventory module.

The Build Web Apps plugin requirement for implementation:

- keep the inventory page usable as the first screen of the feature, not a
  marketing wrapper;
- keep dense dashboard data readable and work-focused;
- verify desktop and mobile viewports;
- verify dialogs, filters, status changes, and empty/error states in browser;
- avoid nested cards and one-off duplicated form/dialog markup.

## Observability

Every write must record audit evidence without secrets:

- actor profile id;
- organization id;
- entity type and entity id;
- action type;
- changed fields or status transition;
- reason for void/expired/lost transitions when provided;
- timestamp.

Validation proof must include enough evidence to show tenant isolation,
authorization, duplicate-code protection, and audit logging behavior.

## Alternatives Considered

1. Batch-only inventory page.
   - Simpler, but it would not satisfy the `kits` unit-level product contract
     or unique `kit_code` rule.

2. Full sample-assignment inventory workflow.
   - Too broad for US-005. It belongs with sample CRUD or result-entry stories.

3. Local one-off forms and filters.
   - Rejected. US-004 and US-014 already established shared dashboard
     form/dialog/filter helpers. US-005 must reuse them when the contracts fit.

4. Local one-off datatable.
   - Rejected. Inventory will likely need dense rows, row actions, status
     labels, sorting/filtering, and responsive behavior. If a datatable is
     implemented, it must be shared or extracted under the dashboard component
     boundary instead of being local to US-005 only.
