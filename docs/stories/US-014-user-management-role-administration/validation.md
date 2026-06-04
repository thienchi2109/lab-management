# Validation

## Proof Strategy

US-014 needs layered proof because it changes admin identity workflows.

- Unit proof for validation schemas, role parsing, status transitions, and
  last-active-admin guard.
- Integration-style proof for server query/action behavior with mocked Supabase
  clients.
- UI proof for filter behavior, role/status rendering, and create/edit dialog
  state.
- Platform proof through live Supabase schema inspection, migration advisor
  checks, browser verification, React Doctor, and full quality gate.

## Test Plan

Planned tests:

- User list mapper returns stable app-facing user rows from profile and
  membership input.
- Create-user schema rejects invalid email, username, password, and role.
- Update-user schema rejects unknown roles and invalid status.
- Last-active-admin guard blocks demoting or deactivating the final active
  admin.
- Non-admin action attempts fail closed.
- Admin list page renders real data rows and filter controls.
- Create and edit dialogs expose expected fields and states.

## Fixtures

Use deterministic fixtures:

- one active admin;
- one active editor;
- one inactive viewer;
- one attempted last-admin demotion/deactivation case.

Do not use real passwords in tests. Temporary password fixtures must be fake and
must not be logged.

## Commands

Run after implementation starts and tests exist:

```text
node scripts/validate-supabase-schema.mjs
cd lab-kit-app && bun test
cd lab-kit-app && bun run quality
scripts/bin/harness-cli query matrix
Supabase MCP: inspect live columns/indexes/policies
Supabase MCP: run security advisors
Supabase MCP: run performance advisors
Browser verification: /dashboard/users desktop and mobile
```

React Doctor must run through package scripts only:

```text
cd lab-kit-app && bun run react-doctor
```

## Acceptance Evidence

- Implementation branch `us-014-user-management-role-admin` started on
  2026-06-04.
- `.env.local` was created from `/root/docs/Supabase MCP server to
  lab-management.md` and is ignored by git.
- No migration was added or applied; live `public.audit_events` already exists
  and is used for user-management audit writes.
- Live Supabase inspection confirmed demo users `admin`, `editor`, and `guest`
  in `profiles` plus `tenant_memberships` after temporary browser verification
  user cleanup.
- `cd lab-kit-app && bun run test` passed with 8 files and 27 tests.
- `cd lab-kit-app && bun run react-doctor:verbose` passed with React Doctor
  v0.2.16 reporting no issues.
- `cd lab-kit-app && bun run quality` passed: typecheck, ESLint strict,
  Prettier, React Doctor with no issues, and Next.js 16.2.7 build.
- Agent-browser verified `/dashboard/users` redirects anonymous users to login,
  then renders the admin user-management UI with real live rows after an
  authenticated admin session.
- Agent-browser verified role filtering, create-user dialog fields, edit-user
  dialog fields, and mobile responsive layout.
- Screenshots captured:
  `/tmp/us014-users-desktop.png`, `/tmp/us014-users-edit-dialog.png`, and
  `/tmp/us014-users-mobile.png`.
- Supabase security advisor reports one existing Auth WARN:
  `auth_leaked_password_protection` disabled. This is a platform setting, not a
  US-014 code regression.
- Supabase performance advisor reports expected `unused_index` INFO findings on
  the fresh/demo project.
- Last-active-admin guard is proven by automated test.
- `scripts/bin/harness-cli story verify US-014` passed on 2026-06-04 after
  running `cd lab-kit-app && bun run test && bun run quality`.
