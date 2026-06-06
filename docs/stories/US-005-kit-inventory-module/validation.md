# Validation

## Proof Strategy

US-005 needs layered proof because kit inventory sits between admin
configuration and future sample assignment.

- Schema proof for live `kit_types`, `kit_batches`, `kits`, constraints, RLS,
  grants, and audit tables.
- Unit proof for validation schemas, duplicate-code handling, status-transition
  rules, expiry calculations, and role checks.
- Integration-style proof for server queries/actions with mocked Supabase
  clients.
- UI proof for summary cards, filters, list/table states, create/edit dialogs,
  status-transition dialogs, empty states, and action messages.
- Shared-component proof that any datatable/table-equivalent UI is imported from
  the shared dashboard component boundary, or that a new shared datatable was
  created only after code-deduplication showed no suitable existing component.
- Platform proof through browser verification, React Doctor, full quality gate,
  and Harness story verification.

All discovery and verification summaries should use context-mode first. Direct
shell is reserved for short commands, edits, process control, and proof commands
whose concise output is intentionally recorded.

## Test Plan

Offline tests:

- validation rejects missing kit type names, invalid lot codes, invalid expiry
  dates, invalid quantities, and duplicate kit codes;
- status transitions reject unsupported paths and require a reason for void,
  expired, or lost transitions;
- server actions reject unauthenticated users and users without the required
  role;
- server actions scope reads and writes to the active organization;
- audit payloads omit secrets and include actor, organization, entity, action,
  changed fields, and timestamp;
- UI renders loading, empty, filtered, validation-error, and success states.
- datatable/table tests cover row rendering, status actions, responsive
  behavior, and shared-component reuse when a datatable is implemented.

Live or integration proof:

- inspect live Supabase tables, constraints, RLS, and grants before writing;
- prove duplicate `kit_code` cannot be inserted or saved;
- prove cross-organization data is not visible;
- prove write operations create audit evidence;
- verify anonymous `/dashboard/kits` redirects to login;
- verify authenticated dashboard user can load the inventory page.

Browser proof:

- desktop inventory overview loads with summary, filters, and kit rows;
- datatable or table-equivalent rows remain scannable without local duplicated
  table markup;
- mobile layout has no overlapping text or controls;
- create/edit batch dialog works through visible validation states;
- create kit units flow shows duplicate-code feedback;
- status transition flow requires reason and updates visible state;
- shared components match existing dashboard behavior and styling.

## Fixtures

Use deterministic fixture data:

- one organization and at least two profiles with different roles;
- at least two kit types;
- at least two batches with different expiry dates;
- in-stock, assigned, used, void, expired, and lost kit examples;
- one duplicate `kit_code` attempt;
- one near-expiry batch and one low-stock type.

Do not store service keys, session tokens, or real user credentials in story
files, tests, screenshots, or traces.

## React Doctor Follow-Up Batch 2026-06-06

This batch handles issues #9, #10, #11, #12, and #13 in one PR because they are
all React Doctor cleanup work and share the same validation gate.

Outcome:

- `DialogFrame` uses native `<dialog>` semantics, removes the redundant role,
  and keeps keyboard trapping out of JSX handlers so React Doctor no longer
  reports the accessibility warnings.
- The Kit Inventory search filter uses `label`/`htmlFor` directly against the
  input.
- Kit Inventory dialog state and action types live outside the component file.
- The create-batch default received date is initialized on the client and no
  longer depends on `new Date()` in the Server Component or JSX render path.
- `summarizeInventory` is an internal helper and uses readable loops instead of
  chained `filter().map()` work.
- Two update operation helpers without callers were removed from the operation
  layer; the port and server contracts remain in place to avoid changing
  existing database behavior.

Proof run:

```bash
cd lab-kit-app && bun run test
# 28 files passed, 83 tests passed

cd lab-kit-app && bun run react-doctor:verbose
# No issues found

cd lab-kit-app && bun run quality
# typecheck, lint:strict, format:check, react-doctor, and next build passed
```

## Commands

Expected commands after implementation:

```bash
scripts/bin/harness-cli query matrix
node scripts/validate-supabase-schema.mjs
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
scripts/bin/harness-cli story verify US-005
scripts/bin/harness-cli trace --summary "<what changed>" --outcome "<result>"
```

React Doctor must run through package scripts only:

```bash
cd lab-kit-app && bun run react-doctor
```

Do not use `bunx` or `bun x` for React Doctor.

## Acceptance Evidence

- Story packet created on 2026-06-05.
- Build Web Apps plugin was invoked during packet planning; UI implementation
  requirements were captured in `overview.md`, `design.md`, and `execplan.md`.
- Shared component reuse is required before local form, dialog, filter, select,
  or action-message duplication.
- GitNexus index refresh is explicitly out of scope for this story packet.
- Implementation completed on 2026-06-05 using TDD.
- Code Review Graph was read before code edits. GitNexus was queried once after
  graph narrowing; no GitNexus index refresh/analyze/update was run.
- Live Supabase inspection found `kit_types` and `kit_batches` but no
  `public.kits`, so a forward-only migration was added:
  `supabase/migrations/202606050004_kit_units_inventory.sql`.
- The live migration `kit_units_inventory` was applied through Supabase MCP and
  returned `success: true`.
- Live Supabase verification confirmed `public.kits` exists with RLS enabled,
  `kit_status` enum values `in_stock`, `assigned`, `used`, `void`, `expired`,
  and `lost`, indexes `kits_org_code_key`, `kits_batch_id_idx`,
  `kits_org_status_idx`, and policies for member select plus editor insert,
  update, and delete.
- `node scripts/validate-supabase-schema.mjs` passed after updating it to check
  the full forward migration chain.
- Focused TDD verification passed:
  `cd lab-kit-app && bun run test lib/kit-inventory/schemas.test.ts lib/kit-inventory/operations.test.ts lib/kit-inventory/schema-contract.test.ts components/dashboard/data-table.test.tsx app/dashboard/kits/_components/kit-inventory-page-content.test.tsx`
  with 5 files and 10 tests.
- Full test suite passed: `cd lab-kit-app && bun run test` with 26 files and
  68 tests.
- Full quality gate passed: `cd lab-kit-app && bun run quality`, including
  typecheck, ESLint strict, Prettier, React Doctor with no errors, and Next.js
  build containing route `/dashboard/kits`.
- React Doctor initially flagged four kit server actions because authorization
  was hidden behind a helper; actions now call `auth()` and check roles directly
  before writes.
- HTTP verification against the local dev server confirmed anonymous
  `/dashboard/kits` redirects to `/login?next=%2Fdashboard%2Fkits`; following
  the redirect returned the login page with the next URL preserved.
- Authenticated `agent-browser` E2E passed on 2026-06-05 with the demo admin
  account provided for this run: login reached `/dashboard`, navigation through
  `Kho KIT` opened `/dashboard/kits`, the page rendered without a framework
  overlay, `Thêm KIT` created `US005-AGENT-001` from the seeded
  `PCR Demo Kit - LOT-DEMO-001` batch, the shared datatable rendered the new
  row, the status dialog opened for that row, search text `AGENT` kept the row
  visible, and a 390x844 mobile viewport still exposed the core controls and
  row action. Screenshots:
  `/tmp/us005-kits-desktop.png`,
  `/tmp/us005-add-kit-dialog.png`,
  `/tmp/us005-kit-created.png`,
  `/tmp/us005-status-dialog.png`,
  `/tmp/us005-filtered.png`, and
  `/tmp/us005-mobile.png`.
