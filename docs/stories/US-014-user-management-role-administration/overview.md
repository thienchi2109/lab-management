# US-014 - User Management & Role Administration

## Current Behavior

US-003 added username/password login, protected dashboard routes, typed session
helpers, and role checks based on `public.profiles` plus
`public.tenant_memberships`.

Admins still cannot manage users from the application. User lifecycle work is
manual and backend-oriented: provisioning Supabase Auth users, maintaining
profile rows, assigning roles, and activating or deactivating memberships
requires direct backend/database access.

Live inspection on 2026-06-04 confirmed:

- `public.profiles` exists with `id`, `display_name`, `email`, `username`,
  `created_at`, and `updated_at`.
- `public.tenant_memberships` exists with `organization_id`, `user_id`, `role`,
  `is_active`, `created_at`, and `updated_at`.
- `public.app_role` contains `admin`, `editor`, and `viewer`.
- No live `public.users` or `public.audit_logs` table was present in the
  identity snapshot used for this story.

## Target Behavior

Admins manage the full user lifecycle from `/dashboard/users` without direct
backend access.

The page shows real existing users from `profiles` joined with
`tenant_memberships`, then supports:

- searching and filtering users by profile, role, and active state;
- creating a Supabase Auth user with app profile and tenant membership;
- changing display name and username;
- changing role between `admin`, `editor`, and `viewer`;
- activating or deactivating tenant membership;
- preventing the last active admin from being demoted or deactivated;
- recording audit evidence for admin user-management writes.

## Affected Users

- Admin: manages users and role assignments in-app.
- Editor: cannot access user-management routes or actions.
- Viewer: cannot access user-management routes or actions.

## Affected Product Docs

- `docs/product/roles-permissions.md`
- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/ui-contract.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- Self-registration.
- User self-service profile editing.
- Password reset email delivery.
- Multi-organization switching beyond the current tenant membership model.
- Bulk import or CSV user administration.
- Applying migrations or implementing app code during this planning pause.
