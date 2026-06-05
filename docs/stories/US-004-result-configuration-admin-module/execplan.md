# Exec Plan

## Goal

Deliver an admin-only result-configuration module for managing groups, metrics,
templates, template assignments, and metric settings that later sample and
result-entry stories can consume.

## Scope

In scope:

- Harness story packet and durable Harness story/intake rows.
- Admin-only `/dashboard/result-configuration` route.
- Typed server query for current organization result configuration.
- Create/update flows for result groups.
- Create/update flows for result metrics.
- Create/update flows for result templates.
- Replace flow for template metric assignments.
- Metric settings boundary decision and implementation.
- Audit trail for configuration writes.
- TDD coverage before production code.
- Browser verification of desktop and mobile UI.
- Full quality gate, including React Doctor.

Out of scope for this pause:

- Writing app implementation code.
- Applying Supabase migrations.
- Running live create/update operations.

Out of scope for the story:

- Sample CRUD.
- Result entry.
- Kit inventory.
- Uploads.
- Export/reporting.
- Automatic KQ_CHUNG calculation for all groups.

## Risk Classification

Lane: high-risk.

Reasons:

- changes admin-only configuration for result-entry behavior;
- touches shared result-engine schema and validation boundaries;
- may require a forward-only migration for settings;
- affects downstream sample, result-entry, export, and dashboard stories;
- requires careful authorization and audit evidence.

Human approval is required before implementation starts. Current state:
approved for story packet only; implementation is paused.

## Work Phases

1. Planning: write US-004 story packet, record Harness intake/story state, and
   pause.
2. Schema inspection: confirm live columns, constraints, indexes, RLS policies,
   seed rows, and the `metric_settings` boundary.
3. RED tests: add failing tests for schemas, permission checks, duplicate-code
   handling, template assignment replacement, and settings validation.
4. Data access: add typed query/action helpers with mocked Supabase tests.
5. UI: add admin-only route, navigation entry, tables/lists, and editor dialogs
   using existing app-shell patterns.
6. Browser verification: inspect desktop and mobile result-configuration
   workflows.
7. Live validation: apply any approved forward-only migration, then run
   Supabase advisors and Harness matrix.
8. Closeout: update story evidence, trace execution, and keep matrix accurate.

## Stop Conditions

Stop and ask before implementation if:

- live schema differs from the captured result-engine model;
- `metric_settings` needs a product decision between JSON-column and table
  models;
- any migration would need edits after live application;
- result group or metric deletes are requested instead of active-state changes;
- cross-organization configuration access is ambiguous;
- audit coverage cannot use the existing `audit_events` table safely;
- any code file would exceed 350 lines;
- React Doctor reports an error.
