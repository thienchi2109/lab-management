# Exec Plan

## Goal

Polish `/dashboard/users` so Admin can scan, filter and edit users with clearer
visual hierarchy and form states while preserving US-014 authorization,
last-active-admin and audit contracts.

## Scope

In scope:

- Users page header, summary strip, filter/search surface, table/list scan
  hierarchy, empty state, create dialog and edit dialog.
- Local Users components under `app/dashboard/users/_components/`.
- Focused UI tests for any changed render states.
- Browser desktop/mobile verification.
- Story evidence and Harness trace after implementation.

Out of scope:

- Supabase schema, RLS, migration, audit schema or role model changes.
- Invite email, reset password, SSO, bulk actions or delegated admin.
- Replacing server actions with client-cache libraries.
- Broad redesign of dashboard shell or shared components without separate proof.

## Risk Classification

Lane: normal.

Reasoning:

- The story is UI polish on an existing admin-only surface.
- It is close to authorization, so security behavior must be regression-tested.
- It should remain normal as long as implementation does not change route guard,
  server action contract, membership writes, audit side effects or DB schema.

Escalate to high-risk if implementation needs:

- role/RBAC behavior changes;
- last-active-admin rule changes;
- Supabase Admin Auth lifecycle changes;
- migration, DDL/DML, grants, policy changes or cleanup SQL;
- audit behavior changes.

## Work Phases

1. Discovery
   - Read this packet, US-014, US-016 roadmap, `docs/product/ui-contract.md`,
     `docs/product/roles-permissions.md`, `docs/TEST_MATRIX.md` and
     `docs/TRACE_SPEC.md`.
   - Read US-016A, US-016B, US-016C and US-016D to keep the polish language,
     browser proof and acceptance evidence consistent with prior UI rollout.
   - Run Code Review Graph on `UserManagementClient`, `UserTable`,
     `CreateUserDialog`, `EditUserDialog`, `getManagedUserSummary`,
     `filterManagedUsers` and `assertCanChangeMembership`.

2. Frontend checkpoint
   - Invoke `build-web-apps:frontend-app-builder` before UI implementation.
     For this route-level polish, Image Gen can be skipped only if the
     implementation records that it stayed inside the existing design system.
   - Invoke `redesign-existing-projects` as the audit checklist for typography,
     density, states, table hierarchy and generic UI patterns.
   - Invoke `build-web-apps:shadcn` or `vercel:shadcn` before adding or changing
     shadcn components.
   - Invoke `build-web-apps:frontend-testing-debugging` before rendered browser
     verification.
   - Invoke `code-deduplication` before creating shared UI, hooks, services,
     helpers or reusable table/dialog abstractions.
   - Confirm whether `DashboardDataTable` fits the Users table. If not, record
     the reviewed exception in acceptance evidence.
   - Confirm installed shadcn inventory first. Current inventory is `badge`,
     `button`, `card`, `checkbox`, `input`, `select`, `tooltip`.

3. RED / regression plan
   - Add or update focused tests before changing behavior-heavy UI states when
     feasible.
   - Keep `lib/user-management/users.test.ts` and `last-admin.test.ts` as guard
     tests for filtering, summary and last-active-admin behavior.

4. UI implementation
   - Polish page header and summary strip.
   - Polish search/filter command area.
   - Polish table/list scan hierarchy and empty state.
   - Design mobile workflow separately before desktop refinement: search-first
     controls, user card/list rows, touch-friendly row action, app-like
     create/edit surface and bottom-nav coexistence.
   - Polish create/edit dialogs, pending states, disabled states and action
     messages.
   - Reuse existing shadcn UI components and dashboard wrappers. If a new UI
     primitive is needed, add it from shadcn registry instead of writing a local
     replacement. Run `shadcn docs <component>` before use and review added
     source.
   - Keep each touched code file under 350 lines.

5. Verification
   - Run focused users tests.
   - Run `bun run test` if touched shared behavior can affect other routes.
   - Run `bun run quality`, `bun run docstring:check` and React Doctor package
     script.
   - Run desktop browser proof for `/dashboard/users`.
   - Run mobile browser proof on `390x844` for search, filters, create flow,
     edit flow, role/status controls, scroll behavior, bottom-nav overlap and
     no horizontal overflow.

6. Harness closeout
   - Update `validation.md` acceptance evidence with exact commands and browser
     proof.
   - Run `scripts/bin/harness-cli story verify US-016E` if available for this
     story.
   - Record a standard Harness trace for normal-lane work.

## Stop Conditions

Pause for human confirmation if:

- implementation would change RBAC, route guard, server action contract,
  membership write semantics, audit behavior or DB schema;
- any Supabase MCP write appears necessary;
- a touched code file would exceed 350 lines without a clean split;
- shared component changes affect samples, analytics or result configuration
  without sufficient proof;
- implementation creates custom UI primitive while a suitable shadcn component
  exists;
- new shadcn component would be added without docs/search/dry-run review;
- mobile implementation is only a horizontally scrollable desktop table with no
  app-like list/card workflow;
- `DashboardDataTable` is bypassed without a documented reason;
- validation requirements need to be weakened;
- React Doctor reports an error.
