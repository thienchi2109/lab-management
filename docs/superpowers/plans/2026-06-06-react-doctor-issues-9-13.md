# React Doctor Issues 9-13 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clear React Doctor follow-up issues #9, #10, #11, #12, and #13 in one scoped PR.

**Architecture:** Treat the warnings as quality regressions and lock each warning family with focused tests before editing source. Keep shared dialog behavior stable for Kits, Users, and Result Configuration consumers. For Kit Inventory, move non-component dialog state out of component files, keep public behavior through existing page/server boundaries, and remove exports only when graph/search proves no external caller exists.

**Tech Stack:** Next.js App Router 16, React 19.2, Vitest, Bun package scripts, React Doctor via package scripts, Harness.

---

## Chunk 1: DialogFrame Semantics

**Files:**
- Modify: `lab-kit-app/components/dashboard/dialog-frame.test.tsx`
- Modify: `lab-kit-app/components/dashboard/dialog-frame.tsx`

- [x] Add a failing test that expects native `<dialog>` semantics while preserving title, close label, Escape close, and form children.
- [x] Run `cd lab-kit-app && bun run test components/dashboard/dialog-frame.test.tsx` and confirm the new assertion fails.
- [x] Convert `DialogFrame` to a native dialog element with `open`, stable focus, Escape close, and existing layout.
- [x] Re-run the focused test and confirm it passes.

## Chunk 2: Kit Inventory UI Hygiene

**Files:**
- Modify: `lab-kit-app/app/dashboard/kits/_components/kit-inventory-page-content.test.tsx`
- Modify: `lab-kit-app/app/dashboard/kits/_components/kit-inventory-client.tsx`
- Create: `lab-kit-app/app/dashboard/kits/_components/kit-inventory-dialog-state.ts`
- Modify: `lab-kit-app/app/dashboard/kits/_components/kit-inventory-dialogs.tsx`

- [x] Add a failing test for the search input label association.
- [x] Add a failing test or static assertion that dialog state/types live outside the component file.
- [x] Add a failing test that the create-batch received date comes from a prop instead of render-time `new Date()`.
- [x] Run focused tests and confirm red.
- [x] Add `id`/`htmlFor` to the search input.
- [x] Move dialog action state/types into a focused module and import them.
- [x] Compute the default received date in `KitInventoryClient` once per mount and pass it to `CreateBatchDialog`.
- [x] Re-run focused tests and confirm green.

## Chunk 3: Kit Inventory Operations And Summary

**Files:**
- Modify: `lab-kit-app/lib/kit-inventory/operations.test.ts`
- Modify: `lab-kit-app/lib/kit-inventory/operations.ts`
- Create: `lab-kit-app/lib/kit-inventory/inventory.test.ts`
- Modify: `lab-kit-app/lib/kit-inventory/inventory.ts`

- [x] Add failing tests that update helpers still audit writes through public server-facing behavior or confirmed local behavior.
- [x] Add failing summary tests through `mapKitInventoryRows` for total, in-stock, near-expiry, and low-stock behavior.
- [x] Run focused tests and confirm red where behavior is not yet locked.
- [x] Remove unused exports from update helpers if no external callers exist.
- [x] Rewrite `summarizeInventory` as a local helper with one readable pass over batches and kits.
- [x] Re-run focused tests and confirm green.

## Chunk 4: Harness And Quality Verification

**Files:**
- Modify: `docs/stories/US-005-kit-inventory-module/validation.md`

- [x] Run `cd lab-kit-app && bun run test`.
- [x] Run `cd lab-kit-app && bun run react-doctor:verbose`.
- [x] Run `cd lab-kit-app && bun run quality`.
- [x] Update validation proof with commands and outcomes.
- [x] Run Code Review Graph update and GitNexus detect changes before commit.
