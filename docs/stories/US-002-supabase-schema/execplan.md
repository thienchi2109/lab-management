# Exec Plan

## Goal

Create a Supabase-first database foundation that is ready for live apply after
the user provides project credentials.

## Scope

In scope:

- Supabase migration for core MVP tables.
- Follow-up forward-only migration for Supabase advisor fixes.
- Demo reference seed for showcase configuration.
- Env contract for public and server-only Supabase keys.
- Offline validation command for schema/RLS/seed coverage.
- Harness durable story row for US-002.

Out of scope:

- Applying migrations to live Supabase before credentials exist.
- Auth/session UI.
- Storage buckets and file upload policies.
- CRUD pages and result-entry workflows.

## Risk Classification

Risk flags:

- Data model.
- Authorization/RLS.
- External provider.
- Customer showcase environment.

Hard gates:

- No live apply without explicit credentials and project confirmation.
- No public exposure of secret/service-role keys.
- No claim of integration/platform proof until the hosted project is checked.

## Work Phases

1. Discovery: read Harness docs, product DB contracts, stack decision, and
   Supabase RLS/API key docs.
2. Design: record high-risk story packet and schema boundaries.
3. Validation planning: create offline schema contract validation.
4. Implementation: add migration, seed, env example, and Harness story row.
5. Verification: run offline schema validation and app quality gates.
6. Live apply: after credentials, apply migration, seed, inspect tables/RLS, run
   Supabase advisors, apply forward-only advisor fixes when needed, then update
   proof flags.
7. Harness update: set US-002 to implemented only after live validation passes.

## Stop Conditions

Pause for human confirmation if:

- Credentials point to a production or customer-owned project.
- Existing live schema is not empty.
- RLS policies require weakening for demo convenience.
- Secret keys would need to be committed or exposed to the browser.
- A live-applied migration appears to need correction. Create a new
  forward-only migration instead of editing the applied file.
