# Design

## Domain Model

Supabase Auth remains the login credential source. App-visible identity remains
split across:

- `public.profiles` for display name, email, and username alias;
- `public.tenant_memberships` for organization scoped role and active state;
- `public.app_role` for the stable role set: `admin`, `editor`, `viewer`.

US-014 adds an admin management layer over those existing records. The layer
must treat `profiles` plus `tenant_memberships` as the real source for current
users and must not introduce a parallel `users` table for app identity.

Writes need audit coverage. Because live inspection did not find
`public.audit_logs`, implementation should add a forward-only audit migration or
create a narrow admin user-management audit table before enabling writes.

## Application Flow

1. Admin opens `/dashboard/users`.
2. The route requires an authenticated session and an active `admin`
   membership.
3. A server query loads real existing profile and membership rows.
4. The UI renders a management surface with summary metrics, filters, a user
   table/list, and create/edit dialogs.
5. Create user action validates input, verifies admin role, creates the
   Supabase Auth user through the admin client, creates/updates the profile,
   creates the tenant membership, and records audit evidence.
6. Update user action validates input, verifies admin role, enforces the
   last-active-admin guard, updates profile and membership fields, and records
   audit evidence.
7. Mutation success revalidates the users route and shows the updated real data.
8. Mutation failure returns a standard non-secret error message.

## Interface Contract

- Route: `GET /dashboard/users`
- Server query: load manageable users for the current admin tenant.
- Server action: create user with display name, username, email, temporary
  password, role, and active state.
- Server action: update user profile and membership role/status.
- Server action: optionally reset temporary password if this remains feasible
  with Supabase Admin Auth in the current environment.
- Navigation: dashboard shell includes a Users entry visible to admins.

Admin-only behavior:

- Non-admin route access redirects or shows a permission-denied state.
- Non-admin action calls fail closed.
- Unknown roles are rejected.
- The current last active admin cannot be demoted or deactivated.

## Data Model

Expected existing tables:

- `public.profiles`
- `public.tenant_memberships`
- `public.organizations`

Expected forward-only database additions if audit is not already present:

- `public.audit_logs` or a narrower user-admin audit table;
- indexes for actor, action, target, and timestamp;
- RLS enabled with admin-readable policy and service/admin write path.

No applied migration file may be edited. Any schema correction must use a new
forward-only migration.

## UI / Platform Impact

The page should be a polished admin tool, not a placeholder.

Primary UI sections:

- Page header with `Quan ly nguoi dung`, count summary, and `Them nguoi dung`.
- Summary strip for total users, active users, admins, and inactive accounts.
- Search and segmented filters for role/status.
- Responsive table on desktop and scan-friendly list rows on mobile.
- Create user dialog with display name, username, email, temporary password,
  role, and active state.
- Edit drawer or dialog with profile fields, role, active state, and dangerous
  action confirmation for deactivation/demotion.
- Empty, no-match, permission-denied, loading, success, and error states.

Visual direction:

- Work-focused SaaS admin surface.
- Clean, modern, dense enough for repeated admin use.
- Use the existing Next.js 16 app, Tailwind CSS, shadcn-style primitives, and
  lucide icons.
- Keep all code files under the project 350-line hard limit.

## Observability

Every admin write records:

- actor profile id;
- target profile id;
- action type;
- previous role/status where applicable;
- next role/status where applicable;
- timestamp.

Logs must not contain passwords, temporary passwords, service keys, session
tokens, or provider secrets.

## Alternatives Considered

1. Admin service layer plus real UI. Selected. It gives full lifecycle support,
   uses real current data, and keeps privileged writes behind server-only code.
2. RPC-first database API. Strong DB boundary, but larger migration surface and
   slower UI iteration for this story.
3. Direct RLS writes from the browser client. Rejected because current
   `profiles` RLS only exposes self profile access and would either block admin
   listing or require broader policies than needed.
