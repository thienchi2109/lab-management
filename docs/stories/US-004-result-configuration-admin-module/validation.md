# Validation

## Proof Strategy

US-004 needs layered proof because it configures shared result-engine behavior.

- Unit proof for validation schemas, input-type parsing, settings parsing,
  duplicate-code rules, and template assignment normalization.
- Integration-style proof for server query/action behavior with mocked Supabase
  clients.
- UI proof for group, metric, template, filter, and editor states.
- Platform proof through live Supabase schema inspection, advisors, browser
  verification, React Doctor, and full quality gate.

## Test Plan

Planned tests:

- Result-configuration mapper returns stable app-facing rows from groups,
  metrics, templates, and assignment input.
- Group schema rejects blank names, duplicate codes, invalid sort order, and
  cross-organization ids.
- Metric schema rejects unknown input types, invalid options, invalid settings,
  and duplicate codes within a group.
- Template schema rejects unknown sample types and duplicate codes.
- Template assignment replacement preserves explicit order and rejects unknown
  metrics.
- Non-admin action attempts fail closed.
- Admin page renders configured data, filters, and create/edit controls.

## Fixtures

Use deterministic fixtures:

- one active result group with two active metrics;
- one inactive result group;
- one template assigned to a sample type;
- one attempted duplicate group code;
- one attempted invalid metric settings payload;
- one non-admin action attempt.

Do not use real service keys, sessions, or credential material in tests.

## Commands

Run after implementation starts and tests exist:

```text
node scripts/validate-supabase-schema.mjs
cd lab-kit-app && bun test
cd lab-kit-app && bun run quality
scripts/bin/harness-cli query matrix
Supabase MCP: inspect live result-engine columns/indexes/policies
Supabase MCP: run security advisors
Supabase MCP: run performance advisors
Browser verification: /dashboard/result-configuration desktop and mobile
```

React Doctor must run through package scripts only:

```text
cd lab-kit-app && bun run react-doctor
```

## Acceptance Evidence

- Story packet created on 2026-06-04.
- `docs/stories/backlog.md` now points to US-014 and US-004 as implemented.
- Implementation completed on 2026-06-05 using TDD.
- Live Supabase inspection confirmed `result_groups`, `result_metrics`,
  `result_templates`, `result_template_metrics`, `sample_types`, and
  `audit_events` exist with RLS enabled. The MVP keeps metric settings in
  `result_metrics.metric_settings` JSON; no migration was added or applied.
- `node scripts/validate-supabase-schema.mjs` passed.
- `cd lab-kit-app && bun run test` passed with 17 files and 49 tests after
  adding the login redirect/session regression.
- `cd lab-kit-app && bun run quality` passed: typecheck, ESLint strict,
  Prettier, React Doctor with no errors, and Next.js 16.2.7 build.
- React Doctor initially flagged seven server actions because authorization was
  hidden behind a helper; actions now call `auth()` and check admin role
  directly before writes.
- HTTP verification against the local dev server confirmed anonymous
  `/dashboard/result-configuration` redirects to
  `/login?next=%2Fdashboard%2Fresult-configuration`; `/login` returned HTML.
- Authenticated `agent-browser` E2E passed on 2026-06-05 with the demo admin
  account provided for this run: login reached `/dashboard`, navigation through
  `Chỉ tiêu` opened `/dashboard/result-configuration`, seeded `PCR` data and
  `PCR Realtime Ct` rendered, search kept the PCR group visible, and the
  `Thêm nhóm chỉ tiêu` dialog exposed required create fields. Screenshot:
  `/root/images/us004-result-configuration-e2e.png`.
- The live demo admin auth row was normalized for E2E login before browser
  verification: the auth user was attached to the default Supabase Auth
  instance, token text fields were normalized to empty strings, and the
  user-provided demo password was reset without recording the secret in repo
  files.
- Shared dashboard form/dialog/filter helpers were introduced and the existing
  user-management dialogs/filters now reuse them to avoid local duplication.
