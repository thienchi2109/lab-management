# US-003 — Auth, Session, RBAC & App Shell

## Current Behavior

The app has a public dashboard shell and a Supabase-backed data model with RLS,
profiles, tenant memberships, and role policies. There is no login flow, session
refresh, server-side identity helper, or route protection.

## Target Behavior

Users sign in with `username` and password. The server resolves the username to
the internal Supabase Auth email, signs in through Supabase Auth, and stores the
Supabase session in cookies. Dashboard routes require an authenticated session.
App code exposes typed helpers for the current profile, tenant memberships, and
Admin/Editor/Viewer permission checks.

## Affected Users

- Admin: can manage configuration and users in later stories.
- Editor: can create/edit samples and enter results in later stories.
- Viewer: can view lab data and reports in later stories.

## Affected Product Docs

- `docs/product/tech-stack.md`
- `docs/product/roles-permissions.md`
- `docs/product/api-contract.md`
- `docs/product/data-model.md`
- `docs/product/ui-contract.md`

## Non-Goals

- Self-registration.
- Password reset or email confirmation flows.
- OAuth providers.
- User management screens.
- Production secret provisioning.
- CRUD, result-entry, upload, export, or dashboard data features.
