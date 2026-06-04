# Design

## Domain Model

US-002 introduces the data foundation for the MVP:

- Organization: tenant boundary for all showcase data.
- Profile and tenant membership: Supabase Auth user linkage and RBAC role.
- Kit inventory: kit type and kit batch with quantity/expiry constraints.
- Sample management: sample type, sample, metadata, and sample image metadata.
- Result engine: result groups, result metrics, templates, template metrics,
  sample results, and group conclusions.
- Audit events: append-style tenant-scoped activity records.

## Application Flow

No UI flow is implemented in this story. The migration and seed files establish
the database contract that later stories use through Next.js Route Handlers,
Server Actions, or Supabase client queries.

## Interface Contract

Frontend code may receive only:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Server-only scripts or handlers may receive:

- `SUPABASE_SECRET_KEY`

Secret and service-role keys must never use `NEXT_PUBLIC_*`.

## Data Model

The migration lives at
`supabase/migrations/202606030001_initial_schema.sql`.

Design rules:

- All exposed application tables are in `public`.
- RLS is enabled for all application tables.
- Membership helper functions live in non-exposed schema `private`.
- The RLS helper is `security definer` and pins `search_path`.
- Policies explicitly require `auth.uid() is not null`.
- Policy/filter columns have indexes for RLS and query performance.
- JSONB is used for flexible sample metadata, metric settings, and entered
  values where product requirements are dynamic.

## UI / Platform Impact

The app gains `.env.example` entries for Supabase project URL, publishable key,
and server-only secret key. No runtime integration is required until credentials
are provided.

## Observability

`public.audit_events` records tenant-scoped actions. Later stories should insert
audit rows through trusted server-side paths or database functions after the
actual commands exist.

## Alternatives Considered

1. Local SQLite first. Rejected for US-002 because the user needs a hosted
   Supabase showcase for customers.
2. No RLS until auth story. Rejected because Supabase public schema tables must
   be protected from the first migration.
3. Hard-code demo auth users in seed. Rejected because Supabase Auth users and
   credentials must be created in the target project environment.
