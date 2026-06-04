# Validation

## Proof Strategy

US-002 has two validation stages:

1. Offline proof before credentials: validate migration, seed, env contract, RLS
   coverage, helper function safety, and quality gates.
2. Live proof after credentials: apply migration and seed to Supabase, inspect
   actual tables/policies, run security/performance advisors, and smoke test
   tenant-scoped reads through authenticated access.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | `node scripts/validate-supabase-schema.mjs` checks schema contract, RLS, seed, and env exposure rules. |
| Integration | Apply migration and seed to Supabase, then inspect tables, constraints, policies, and seeded rows. |
| E2E | Deferred to auth/app-shell and CRUD stories. |
| Platform | Hosted Supabase project health, advisors, and Data API smoke after credentials. |
| Performance | Index coverage for tenant filters, status/date filters, JSONB metadata, and RLS membership lookups. |
| Logs/Audit | `audit_events` table exists; actual audit insertion proof deferred to command stories. |

## Fixtures

- Demo organization: `Demo Lab`.
- Sample type: `SWINE_ORAL_FLUID`.
- Kit type and batch: `PCR_KIT_DEMO`, `LOT-DEMO-001`.
- Result group: `PCR`.
- Metrics: `PCR_REALTIME`, `KQ_CHUNG`.
- Template: `PCR_BASIC`.

## Commands

Offline:

```text
node scripts/validate-supabase-schema.mjs
cd lab-kit-app && bun run quality
scripts/bin/harness-cli query matrix
```

Live after credentials:

```text
Apply supabase/migrations/202606030001_initial_schema.sql
Apply supabase/migrations/202606040002_advisor_fixes.sql
Apply supabase/seed.sql
Inspect public tables and RLS policies through Supabase MCP
Run Supabase security and performance advisors
```

## Acceptance Evidence

- Offline schema contract passed on 2026-06-03.
- Live target confirmed with `mcp__supabase_lab_management.get_project_url`:
  `https://tuuqgpzgollcerqqszjr.supabase.co`.
- Applied migration `us_002_initial_schema`; live migration record version
  `20260604023011`.
- Applied follow-up migration `us_002_advisor_fixes` to resolve missing
  foreign-key indexes and overlapping permissive policy warnings.
- Seed inserted demo reference data: 1 organization, 1 sample type, 1 kit type,
  1 kit batch, 1 result group, 2 result metrics, 1 result template, and 2
  template metrics.
- Live RLS inspection confirmed all 15 public application tables have RLS
  enabled.
- Security advisor returned no lints after live apply.
- Performance advisor returned only `unused_index` INFO findings expected on a
  fresh seeded database with no application traffic; unindexed-FK and
  multiple-permissive-policy findings were resolved.
