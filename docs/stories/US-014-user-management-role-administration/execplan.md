# Exec Plan

## Goal

Deliver an admin-only user-management surface backed by real current identity
data and full lifecycle actions for creating users, updating roles, and
activating or deactivating memberships.

## Scope

In scope:

- Harness story packet and durable Harness story/intake rows.
- Admin-only `/dashboard/users` route.
- Real user list from `profiles` and `tenant_memberships`.
- Create user flow through Supabase Admin Auth plus app profile and membership.
- Edit user profile fields, role, and active state.
- Last-active-admin guard.
- Audit trail for user-management writes.
- Navigation entry visible to admins.
- TDD coverage before production code.
- Browser verification of the responsive UI.
- Full quality gate, including React Doctor.

Out of scope for this pause:

- Writing app implementation code.
- Applying Supabase migrations.
- Creating production users or secrets.
- Running live create/update operations.

Out of scope for the story:

- Self-registration.
- Bulk user import.
- Multi-tenant organization switcher.
- Password reset email workflow.

## Risk Classification

Lane: high-risk.

Reasons:

- touches authentication and authorization behavior;
- creates Supabase Auth users through privileged server code;
- changes profile and role assignment data;
- introduces audit requirements;
- impacts admin-only navigation and protected routes.

Human approval is required before implementation starts. Current state:
approved for story packet only; implementation is paused.

## Work Phases

1. Planning: write US-014 story packet, record Harness intake/story state, and
   pause.
2. Schema planning: define failing schema validator expectations for audit
   support and any required indexes/policies.
3. RED tests: add failing unit tests for schemas, role/status rules, and
   last-active-admin guard.
4. Data access: add typed admin query/action helpers with mocked integration
   tests before implementation.
5. UI: add admin-only users route and components from a design-system inventory
   using the existing app shell.
6. Browser verification: inspect desktop and mobile user-management workflows.
7. Live validation: apply forward-only migration only after explicit approval,
   then run Supabase advisors and Harness matrix.
8. Closeout: update story evidence, trace execution, and keep matrix accurate.

## Stop Conditions

Stop and ask before implementation if:

- live schema differs from the captured `profiles` plus `tenant_memberships`
  model;
- Supabase Admin Auth cannot safely create users in this environment;
- audit requirements require a product decision beyond narrow user management;
- last-active-admin behavior conflicts with a user requirement;
- any code file would exceed 350 lines;
- React Doctor reports an error;
- migrations would need edits after live application.
