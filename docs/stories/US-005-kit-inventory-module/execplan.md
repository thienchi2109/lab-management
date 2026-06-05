# Exec Plan

## Goal

Plan and later implement the kit inventory module as a high-risk, tenant-scoped
dashboard feature with live schema proof, shared component reuse, auditability,
and full quality gates.

## Scope

In scope for this story:

- Harness story packet and durable Harness story/intake rows.
- `/dashboard/kits` route and navigation entry when implementation starts.
- Typed server queries for kit inventory summaries, kit types, batches, and kit
  units.
- Admin create/update flows for kit types and kit batches.
- Allowed-role kit-unit creation for existing batches.
- Status transition flow for void, expired, and lost kits.
- Search/filter workflow by kit type, batch, code, status, and expiry.
- Data table or table-equivalent row surface for kit units when inventory
  density requires tabular scanning.
- Shared dashboard components for dialogs, fields, filters, selects, action
  messages, datatable/table behavior, and compatible summary patterns.
- Audit trail for inventory writes.
- TDD coverage before production code.
- Browser verification of desktop and mobile UI, using Build Web Apps plugin
  standards for dashboard quality.
- Full quality gate, including React Doctor through package scripts.

Out of scope for this story:

- Sample metadata CRUD.
- Assigning kits to samples.
- Result entry.
- Uploads.
- Export/reporting.
- Automatic KQ_CHUNG logic.
- Refreshing the GitNexus index.

## Risk Classification

Lane: high-risk.

Reasons:

- touches tenant-scoped inventory data and future sample assignment readiness;
- may require live-schema inspection or a forward-only migration;
- requires unique-code and status-transition correctness;
- includes role-gated writes and audit evidence;
- affects future sample CRUD, result entry, dashboard, and export stories.

Human approval is required before implementation starts. Current state:
implementation completed on 2026-06-05.

## Work Phases

1. Discovery.
   - Use context-mode first for all gathering, searching, reading, and
     summarizing.
   - Read Harness docs, product inventory contracts, nearby story packets, and
     validation expectations.
   - Read Code Review Graph before code edits to map files, symbols, flows, and
     impact.
   - Do not refresh the GitNexus index. If exact relationships are needed, use
     the existing GitNexus index only after context-mode and Code Review Graph
     narrow the target.

2. Live schema proof.
   - Inspect Supabase live state for `kit_types`, `kit_batches`, `kits`,
     constraints, RLS, grants, and audit tables.
   - Decide whether implementation can use existing schema or needs a
     forward-only migration.

3. TDD planning.
   - Add failing tests for validation schemas, duplicate `kit_code`, status
     transitions, role failures, and server-action feedback.
   - Add UI tests for filters, empty states, dialog validation, and action
     messages before production UI changes.

4. Shared component pass.
   - Invoke code-deduplication before creating reusable UI or helpers.
   - Reuse existing dashboard shared components when contracts fit.
   - If a datatable is needed, use an existing shared datatable first. If none
     exists, extract/create a shared dashboard datatable instead of copying
     `user-table` or result-configuration list markup locally.
   - Create new shared pieces only when reuse would blur ownership or widen
     scope.

5. Implementation.
   - Add typed inventory domain helpers and server queries/actions.
   - Add `/dashboard/kits` page and route-level auth.
   - Add dashboard navigation entry.
   - Add forms/dialogs/filters/datatable or list UI using shared components.
   - Add audit logging for writes.

6. Verification.
   - Run focused tests first.
   - Run `node scripts/validate-supabase-schema.mjs` if schema state is part of
     the implementation proof.
   - Run `cd lab-kit-app && bun run test`.
   - Run `cd lab-kit-app && bun run quality`.
   - Verify browser workflow for anonymous redirect, authenticated inventory
     view, filtering, create/edit dialogs, status transition, and mobile layout.

7. Harness update.
   - Update `validation.md` acceptance evidence.
   - Update Harness DB story status and proof flags.
   - Run `scripts/bin/harness-cli story verify US-005`.
   - Record trace with summary, outcome, files read, files changed, commands,
     and friction.

## Stop Conditions

Stop and report before implementation if:

- live schema does not match product docs and migration direction is ambiguous;
- tenant isolation or write authorization cannot be proven;
- `kit_code` uniqueness cannot be enforced safely;
- shared components cannot support required forms/dialogs without unclear
  refactor scope;
- Build Web Apps plugin requirements conflict with existing dashboard design;
- React Doctor flags an authorization or component pattern that requires a
  wider design change;
- any needed GitNexus information appears stale, because the user explicitly
  prohibited index refresh for this story packet.
