# Exec Plan

## Goal

Build the first authenticated app shell using Supabase Auth with a
username/password UI and typed RBAC helpers.

## Scope

In scope:

- Harness story packet and durable story row.
- Forward-only migration for username aliases.
- Supabase SSR client helpers.
- Username login Server Action.
- Sign-out route.
- Protected dashboard route.
- Typed session/profile/membership/role helpers.
- Focused Bun tests for auth parsing, username normalization, and RBAC.
- Full quality gate and Supabase advisor checks.

Out of scope:

- Creating production users or secrets.
- Dashboard-managed Supabase Auth settings.
- Password reset and self-registration.
- User administration UI.

## Risk Classification

High-risk because the work touches:

- Auth
- Authorization
- Data model
- Audit/security
- Public contracts
- Existing dashboard behavior
- Weak proof around auth because US-003 creates the first auth tests

## Work Phases

1. Planning: story packet, implementation plan, and Harness in-progress state.
2. Schema: failing schema validator expectation, forward-only migration,
   offline validation, then live apply.
3. Pure app logic: username normalization, login schema, role helpers with
   failing tests first.
4. Supabase integration: lazy SSR/admin clients and session helpers.
5. UI/routes: login page, sign-out route, dashboard protection.
6. Validation: `bun test`, `bun run quality`, Harness matrix, live advisors.

## Stop Conditions

Stop and ask the user if:

- A production Supabase Auth setting must be changed outside available MCP
  tools.
- A production service role key or other secret is required.
- Live migration fails or advisors report a blocking security issue.
- Username/password must work without an internal auth email.
- More than three implementation fixes fail for the same auth/session issue.
