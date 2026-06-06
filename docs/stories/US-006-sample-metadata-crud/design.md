# Design

## Domain Model

US-006 owns sample metadata only. It should model sample records as
tenant-scoped operational data that can later feed result entry, uploads,
analytics, and export.

Expected entities:

- `samples`
- `customers`
- `companies`
- `sample_types`
- `kit_types`
- `kits`
- `audit_events`

Before implementation, inspect live Supabase schema through the approved
Supabase path and compare it with product docs. If the live schema already
supports US-006, do not add a migration. If a schema gap exists, use a
forward-only migration and preserve the repo's RLS, `search_path`,
grant/revoke, and fail-closed patterns.

## Application Flow

The dashboard route should be `/dashboard/samples`.

Default flow:

1. Authenticated user opens the sample management page.
2. Server-side auth resolves active profile, organization, and role.
3. Page loads sample list rows plus reference options needed by filters and
   forms.
4. User filters by status, sample type, received date, customer/company, billing
   status, kit assignment, or search text.
5. Admin or allowed lab staff creates a sample.
6. Admin or allowed lab staff updates editable sample metadata.
7. Each write returns a user-facing success/error state, revalidates the route,
   and records audit evidence.

## Interface Contract

Server queries should return typed view models for:

- sample summary metrics;
- sample list rows;
- sample detail or edit form data;
- customer, company, sample type, kit type, and assignable kit options;
- filter option sets;
- write action result messages.

Server actions should cover:

- create sample metadata;
- update sample metadata;
- optional status change only when the product contract and live schema make
  the transition rules clear;
- refresh-safe validation errors for duplicate sample codes, invalid reference
  IDs, invalid dates, missing required metadata, and permission failures.

Every action must call `auth()` and check role/organization authorization at the
action boundary. Do not hide write authorization behind a helper that React
Doctor cannot detect.

## Caching And Server State

US-006 should not require TanStack Query in the first implementation.

The repo currently uses Next.js Server Components, server actions,
`useActionState`, and `revalidatePath` for dashboard data updates. US-006 should
follow that pattern first:

- load initial list and reference data through the server page boundary;
- submit create/update mutations through server actions;
- use `revalidatePath("/dashboard/samples")` after successful writes;
- keep filter state URL-driven or local to the client component as needed;
- avoid adding a global query provider and query key factory until there is a
  concrete cache problem.

TanStack Query becomes appropriate in a later slice if sample workflows need
client-side server-state synchronization that Server Components do not handle
well, such as optimistic row updates, cursor pagination with keep-previous-data
behavior, background refetching across tabs, prefetching sample detail panels,
or shared cache invalidation across multiple mounted sample surfaces.

If TanStack Query is introduced later, the story must add a dedicated provider,
hierarchical query keys, explicit stale/gc times, targeted invalidation after
mutations, and hydration rules for server-rendered data.

## Data Model

Implementation must prove:

- sample records are scoped to the active organization;
- sample codes are unique according to the live schema contract;
- reference IDs belong to the same organization or approved shared reference
  set;
- customer/company snapshot behavior is explicit and tested;
- writes create audit evidence without leaking secrets;
- sample metadata updates do not mutate result-entry tables.

## UI / Platform Impact

US-006 should reuse every suitable dashboard shared component when contracts
fit. This is not limited to the data table. Known candidates include:

- `components/dashboard/dialog-frame.tsx`
- `components/dashboard/form-fields.tsx`
- `components/dashboard/filter-select.tsx`
- `components/dashboard/app-select.tsx`
- `components/dashboard/action-message.tsx`
- `components/dashboard/data-table.tsx` / `DashboardDataTable`

The sample list must use `DashboardDataTable`. Other UI must use existing shared
forms, dialogs, filters, selects, action messages, and layout primitives when
their contracts fit. Do not create local table markup, local card/table dual
rendering, a second data-table abstraction, or local duplicates of existing
shared dashboard UI for US-006. If a shared component contract is missing a
capability needed by samples, invoke the code-deduplication workflow during
implementation, prove the gap against existing consumers, and extend the shared
component only when the contract remains general.

Any US-006 work that touches UI structure, frontend design, responsive layout,
visual polish, dashboard interaction states, or browser verification must invoke
the Build Web Apps plugin capability before implementation. Use the plugin as a
quality gate for frontend design decisions while preserving the repo's existing
dashboard design system.

If US-006 needs new reusable filters, form fields, hooks, services, or helpers,
invoke the code-deduplication workflow first and centralize only when the shared
contract is clear.

The page must support dense desktop scanning and a mobile layout with no
overlapping labels, fields, action buttons, or table rows.

## Observability

Audit events should capture:

- actor and organization;
- sample entity ID and sample code;
- action type;
- changed field names or safe before/after summaries;
- timestamp;
- failure reason when a business rule rejects a write.

Do not include secrets, tokens, private credentials, or large metadata blobs in
audit payloads.

## Alternatives Considered

1. Add TanStack Query immediately.
   - Rejected for US-006 first slice. The repo has no existing TanStack Query
     dependency or provider, and current dashboard modules use server actions
     plus route revalidation. Adding it now would widen architecture scope
     before a concrete client-cache requirement is proven.

2. Build sample CRUD entirely as client-side API calls.
   - Rejected. The repo's current pattern keeps auth, role checks, audit, and
     route revalidation in server boundaries.

3. Include result entry in sample CRUD.
   - Rejected. Result entry is US-007 and has separate dynamic template and
     conclusion logic.

4. Local one-off list/table/forms.
   - Rejected. US-006 must use `DashboardDataTable` for sample rows and reuse
     every suitable dashboard shared component for forms, dialogs, filters,
     selects, messages, and layout. New shared helpers require the
     code-deduplication workflow before writing code.
