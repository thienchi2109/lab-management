# Design

## Domain Model

Supabase Auth remains the source of session identity and JWTs. `public.profiles`
stores app-facing user data and gains a unique `username` alias. Existing
`public.tenant_memberships` rows remain the source of app roles:
`admin`, `editor`, and `viewer`.

## Application Flow

1. The login page posts `username` and `password` to a Server Action.
2. The Server Action validates input with Zod.
3. A server-only Supabase service client looks up the normalized username in
   `public.profiles` and returns the matching internal email.
4. A request-scoped Supabase SSR client calls `signInWithPassword` with that
   email and password so Supabase Auth issues the session cookies.
5. Protected routes use middleware/session helpers to redirect anonymous users
   to `/login`.
6. Server components call typed auth helpers for the current profile,
   memberships, and role checks.

## Interface Contract

- Public route: `/login`
- Protected route: `/dashboard`
- Server action: `loginWithUsername`
- Sign-out endpoint: `POST /auth/signout`
- Auth helper outputs:
  - unauthenticated session
  - authenticated session with user id, profile, memberships
  - role check result for a requested app role

## Data Model

Forward-only migration adds:

- `public.profiles.username text`
- case-insensitive uniqueness on `lower(username)`
- a username format check
- an index for normalized username lookup

The app uses a server-only service role client for username lookup instead of an
anon RPC that would reveal auth emails.

## UI / Platform Impact

The app gains a Vietnamese username/password login screen and authenticated
dashboard shell. `.env.example` documents public Supabase URL/key and the
server-only Supabase secret key requirement. SDK clients are initialized lazily
so `next build` remains safe without runtime secrets.

## Observability

Failed login attempts return a generic invalid-credentials message. No password,
secret, JWT, or internal email is logged. Harness trace records validation,
advisor status, and any Supabase configuration gap.

## Alternatives Considered

1. Auth.js Credentials with username/password: supports the UI directly, but
   requires custom password hashing/session/JWT bridge to Supabase RLS.
2. Supabase Auth email/password UI: simplest technically, but violates the
   username/password product decision.
3. Supabase Auth with anon username lookup RPC: avoids service role env, but
   exposes an email lookup surface before authentication.
