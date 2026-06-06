# Exec Plan

## Goal

What outcome are we trying to produce?

## Scope

In scope:

- Item.

Out of scope:

- Item.

## Risk Classification

Risk flags:

- Flag.

Hard gates:

- Gate.

## Work Phases

1. Discovery.
2. Design.
3. Frontend, reuse, and caching checkpoint.
   - Invoke the Build Web Apps plugin capability before UI/frontend design,
     responsive layout, visual polish, dashboard interaction states, or browser
     verification work.
   - Invoke code-deduplication before creating reusable UI, hooks, services,
     helpers, or shared logic.
   - Use all suitable shared dashboard components by default, including forms,
     dialogs, filters, selects, messages, layout primitives, and tables.
     Table/list surfaces must use `DashboardDataTable` unless this plan
     documents a reviewed exception.
   - Use Server Components, server actions, `useActionState`, and
     `revalidatePath` as the default server-state strategy. Pause before adding
     TanStack Query unless this plan documents a concrete client-cache
     requirement.
4. Validation planning.
5. Implementation.
6. Verification.
7. Harness update.

## Stop Conditions

Pause for human confirmation if:

- Product behavior is ambiguous.
- Data migration or deletion risk appears.
- UI/frontend implementation would proceed without invoking the Build Web Apps
  plugin capability first.
- Implementation would create reusable code without code-deduplication proof.
- Suitable shared dashboard components exist but implementation would create
  local duplicate UI.
- A table/list surface would use local duplicate markup instead of
  `DashboardDataTable`.
- Implementation appears to require TanStack Query without a documented
  client-cache requirement.
- Validation requirements need to be weakened.
- Architecture direction changes.
