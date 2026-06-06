# Validation

## Proof Strategy

US-006 needs layered proof because sample metadata is the central operational
record for later result entry, upload, analytics, and export.

- Schema proof for live `samples`, reference tables, constraints, RLS, grants,
  and audit tables.
- Unit proof for validation schemas, sample-code uniqueness handling, reference
  ownership checks, date rules, role checks, and snapshot behavior.
- Integration-style proof for server queries/actions with mocked Supabase
  clients.
- UI proof for list rows, filters, empty state, create/edit dialogs, validation
  errors, success messages, and responsive behavior.
- Shared-component proof that every suitable shared dashboard component was
  reused, including forms, dialogs, filters, selects, action messages, layout
  primitives, and tables; the sample list must import `DashboardDataTable` from
  `components/dashboard/data-table.tsx`.
- Frontend-process proof that the Build Web Apps plugin capability was invoked
  before UI structure, frontend design, responsive layout, visual polish,
  dashboard interaction states, or browser verification were changed.
- Platform proof through browser verification, React Doctor, full quality gate,
  and Harness story verification.

All discovery and verification summaries should use context-mode first. Direct
shell is reserved for short commands, edits, process control, and proof
commands whose concise output is intentionally recorded.

## Test Plan

Offline tests:

- validation rejects missing required sample metadata, invalid dates, invalid
  billing statuses, invalid sample statuses, and invalid reference IDs;
- duplicate sample-code handling returns a user-facing error;
- reference ownership checks reject cross-organization customer/company/sample
  type/kit references;
- server actions reject unauthenticated users and users without the required
  role;
- create/update actions create safe audit payloads;
- sample metadata updates do not mutate result-entry tables;
- UI renders loading, empty, filtered, validation-error, and success states;
- UI tests prove shared component reuse where suitable and cover
  `DashboardDataTable` row rendering, filters, actions, and responsive behavior
  without local duplicate table markup.

Live or integration proof:

- inspect live Supabase tables, constraints, RLS, and grants before writing;
- prove duplicate sample code cannot be inserted or saved;
- prove cross-organization data is not visible;
- prove write operations create audit evidence;
- verify anonymous `/dashboard/samples` redirects to login;
- verify authenticated dashboard user can load the sample page.

Browser proof:

- desktop sample list loads with summary, filters, and sample rows;
- sample rows render through the shared `DashboardDataTable` component;
- create sample flow shows required-field validation and success state;
- edit sample flow preserves immutable fields and updates editable metadata;
- search/filter controls remain usable with representative data;
- mobile layout has no overlapping text or controls;
- reused shared components match existing dashboard behavior and styling.

Caching proof:

- first slice should prove route revalidation updates visible data after
  successful server actions;
- no TanStack Query proof is required unless the implementation packet is
  revised to include a client-cache requirement.

## Fixtures

Representative fixtures should include:

- one admin, one allowed lab staff user, and one viewer;
- at least two organizations to prove isolation;
- active and inactive sample types;
- active customers and companies;
- samples with different statuses, received dates, billing statuses, and
  customer/company combinations;
- optional kit reference data for display-only summaries.

Do not include real credentials or personally sensitive customer data in test
fixtures.

## Commands

Expected commands after implementation:

```bash
scripts/bin/harness-cli query matrix
node scripts/validate-supabase-schema.mjs
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
scripts/bin/harness-cli story verify US-006
scripts/bin/harness-cli trace --summary "<what changed>" --outcome "<result>"
```

React Doctor must run through package scripts only:

```bash
cd lab-kit-app && bun run react-doctor
```

Do not use `bunx` or `bun x` for React Doctor.

## Acceptance Evidence

Add results after verification.
