# Exec Plan

## Goal

Deliver tenant-scoped sample metadata CRUD for `/dashboard/samples` with
validated server actions, audit evidence, shared dashboard UI, and Harness proof
without implementing result entry, uploads, analytics, or export.

## Scope

In scope:

- sample list and filter surface;
- create sample metadata;
- update sample metadata;
- reference option loading for customers, companies, sample types, kit types,
  and relevant kit summaries;
- route-level auth and role enforcement;
- audit evidence for writes;
- tests and browser proof for desktop and mobile workflows.

Out of scope:

- TanStack Query setup unless implementation discovery proves Server Component
  revalidation cannot support the required workflow;
- result entry and KQ_CHUNG calculation;
- file upload;
- export;
- analytics;
- broad dashboard navigation redesign;
- local duplicates of existing shared dashboard components;
- local table markup, local card/table dual rendering, or another data-table
  abstraction instead of `DashboardDataTable`.

## Risk Classification

Lane: high-risk.

Reasons:

- touches core sample workflow;
- may require live schema or RLS inspection;
- writes tenant-scoped operational data;
- requires authorization and audit behavior;
- sits upstream of result entry, upload, analytics, and export.

## Work Phases

1. Discovery.
   - Use context-mode first for all gathering, searching, reading, and
     summarizing.
   - Read Harness docs, product sample contracts, nearby story packets, and
     validation expectations.
   - Read Code Review Graph before code edits to map files, symbols, flows, and
     impact.
   - Use GitNexus or `rg` only after Code Review Graph narrows the scope.

2. Live schema proof.
   - Inspect live Supabase state for `samples`, reference tables, constraints,
     RLS, grants, and audit tables.
   - Decide whether implementation can use existing schema or needs a
     forward-only migration.
   - Do not edit applied migrations.

3. TDD planning.
   - Add failing tests for validation schemas, duplicate sample code, invalid
     references, date rules, role failures, and audit payloads.
   - Add UI tests for filters, empty states, create/edit validation, and action
     messages before production UI changes.

4. Shared component pass.
   - Invoke the Build Web Apps plugin capability before touching UI structure,
     frontend design, responsive layout, visual polish, dashboard interaction
     states, or browser verification.
   - Invoke code-deduplication before creating reusable UI, hooks, services, or
     helpers.
   - Reuse every suitable dashboard shared component when contracts fit,
     including forms, dialogs, filters, selects, action messages, layout
     primitives, and table patterns.
   - Use `components/dashboard/data-table.tsx` / `DashboardDataTable` for the
     sample list. Do not duplicate table/card rendering locally.
   - If any shared component lacks a sample-list capability, prove the gap with
     code-deduplication and extend the shared contract instead of adding a
     one-off local component.
   - Create new shared pieces only when reuse would reduce meaningful
     duplication without widening scope.

5. Implementation.
   - Add typed sample metadata domain helpers and validation schemas.
   - Add server queries/actions for sample list, create, and update.
   - Add `/dashboard/samples` page and route-level auth.
   - Add dashboard navigation entry if missing.
   - Add forms/dialogs/filters/list or table UI using shared components.
   - Add audit logging for writes.
   - Use Server Components, server actions, `useActionState`, and
     `revalidatePath` as the default data-refresh strategy.

6. Caching checkpoint.
   - Keep TanStack Query out of scope unless a concrete requirement appears for
     optimistic updates, background refetching, cursor pagination cache, detail
     prefetching, or shared client cache across mounted sample surfaces.
   - If that requirement appears, pause and update this packet before adding the
     dependency or provider.

7. Verification.
   - Run focused tests first.
   - Run `node scripts/validate-supabase-schema.mjs` if schema state is part of
     the implementation proof.
   - Run `cd lab-kit-app && bun run test`.
   - Run `cd lab-kit-app && bun run quality`.
   - Verify browser workflow for anonymous redirect, authenticated sample list,
     filtering, create/edit dialogs, validation errors, success states, and
     mobile layout.

8. Harness update.
   - Update `validation.md` acceptance evidence.
   - Update Harness DB story status and proof flags.
   - Run `scripts/bin/harness-cli story verify US-006`.
   - Record trace with summary, outcome, files read, files changed, commands,
     decisions, and friction.

## Stop Conditions

Pause for human confirmation if:

- live schema differs materially from product docs;
- sample status transitions are ambiguous;
- customer/company snapshot semantics are unclear;
- implementation appears to require TanStack Query in the first slice;
- implementation appears to require local duplicates of existing shared
  dashboard components;
- implementation appears to require a local sample-only data table instead of
  `DashboardDataTable`;
- frontend/UI implementation would proceed without invoking the Build Web Apps
  plugin capability first;
- migration or data-loss risk appears;
- validation requirements need to be weakened;
- architecture direction changes.
