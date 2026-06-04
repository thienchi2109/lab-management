# US-002 — Supabase Schema, Migrations & Seed

## Current Behavior

The app has a Next.js foundation and quality gates, but no application database
schema. Product contracts describe kit inventory, samples, dynamic result entry,
RBAC, audit trail, and RLS, but those contracts are not represented in
Supabase yet.

## Target Behavior

The MVP has a Supabase-first database baseline that can be applied to a hosted
Supabase project for customer showcase. The baseline includes tenant-aware core
tables, dynamic result configuration, seed data for a demo lab, RLS enablement,
membership-based policies, and an offline schema validation command that runs
without credentials.

## Affected Users

- Admin: configures result templates, sample types, kit types, and memberships.
- Editor: manages kit batches, samples, sample images, and sample results.
- Viewer: reads tenant-scoped data and audit events.

## Affected Product Docs

- `docs/product/data-model.md`
- `docs/product/result-engine.md`
- `docs/product/roles-permissions.md`
- `docs/product/api-contract.md`
- `docs/product/tech-stack.md`
- `docs/decisions/0006-nextjs-bun-supabase-stack.md`

## Non-Goals

- Auth UI and invite flow.
- Storage bucket creation and object policies.
- Live Supabase apply before credentials are provided.
- Full CRUD screens and result-entry UI.
