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

Implemented on 2026-06-06.

- TDD proof: focused RED initially failed because `lib/sample-metadata/*` and
  `/dashboard/samples` modules did not exist; GREEN passed with
  `cd lab-kit-app && bun run test lib/sample-metadata/schemas.test.ts
  lib/sample-metadata/metadata.test.ts lib/sample-metadata/operations.test.ts
  app/dashboard/samples/_components/sample-metadata-page-content.test.tsx`
  (4 files / 9 tests).
- Full unit/UI proof: `cd lab-kit-app && bun run test` passed 32 files / 92
  tests.
- Schema proof: live Supabase migration `202606060009
  sample_metadata_references` applied; live inspection confirmed
  `public.companies`, `public.customers`, `samples.customer_id`,
  `samples.company_id`, `samples.billing_status`, RLS enabled on
  `companies/customers/samples`, and role-scoped select/insert/update policies
  for companies/customers.
- Schema contract proof: `node scripts/validate-supabase-schema.mjs` passed.
- Platform proof: `cd lab-kit-app && bun run quality` passed typecheck, ESLint
  strict, Prettier, React Doctor with no errors, and Next.js build; build output
  includes dynamic route `/dashboard/samples`.
- Browser proof: anonymous `/dashboard/samples` was checked once and redirected
  to `/login?next=%2Fdashboard%2Fsamples` with no framework error overlay.
  Authenticated browser E2E create/edit flow was explicitly skipped by the owner
  on 2026-06-06 and should not block marking US-006 complete.
- Shared UI proof: the sample page imports and uses `DashboardDataTable`,
  `FilterSelect`, `DialogFrame`, `Field`, `SelectField`, `TextAreaField`,
  `ActionMessage`, `Badge`, `Button`, and `Input`; no local data-table
  abstraction or TanStack Query provider was added.
- Caching proof: implementation uses Server Components, server actions,
  `useActionState`, and `revalidatePath("/dashboard/samples")`; TanStack Query
  remains out of scope for this first slice.
- Advisor proof: Supabase security advisor still reports the pre-existing
  leaked-password-protection WARN; performance advisor reports fresh-project
  unused-index INFO findings, including new sample metadata indexes before
  production traffic.

## Follow-up PR 2 Evidence

Validated on 2026-06-06 for Issues #21, #24, and #25.

- TDD RED proof: focused Vitest first failed on missing
  `SampleMetadataValidationError.fieldErrors`, missing field-level form error
  rendering, and missing action-state `fieldErrors`.
- Contract decision: sample metadata server actions continue to accept
  `datetime-local` strings only (`YYYY-MM-DDTHH:mm`). ISO seconds, ISO UTC, and
  timezone-offset strings stay rejected in this form-action path to avoid silent
  timezone conversion.
- JSON metadata boundary: database `metadata` remains an internal JSON boundary;
  the dashboard mapper validates the UI-facing shape and exposes only a string
  `note`, falling back to `null` for malformed or future metadata fields.
- Field error proof: create/update action state can now carry user-safe
  Vietnamese field errors, and shared dashboard `Field`, `SelectField`,
  `TextAreaField`, and `AppSelect` render accessible `aria-invalid` messages.
- Verification: `cd lab-kit-app && bun run test` passed 34 files / 108 tests;
  `cd lab-kit-app && bun run quality` passed typecheck, ESLint strict,
  Prettier, React Doctor with no blocking errors, and Next.js build; `cd
  lab-kit-app && bun run react-doctor:diff` reported no issues for
  `fix/sample-metadata-validation-contract -> main`.
- No Supabase migration or live schema apply belongs to this follow-up.
