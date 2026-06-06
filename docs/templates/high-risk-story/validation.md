# Validation

## Proof Strategy

Explain what must pass before the story is done.

If the story touches UI/frontend work, proof must show:

- the Build Web Apps plugin capability was invoked before UI/frontend design,
  responsive layout, visual polish, dashboard interaction states, or browser
  verification changed;
- all suitable shared dashboard components were reused by default, including
  forms, dialogs, filters, selects, messages, layout primitives, and tables;
- table/list surfaces use `DashboardDataTable`, unless a reviewed exception is
  documented;
- code-deduplication was invoked before adding reusable UI, hooks, services,
  helpers, or shared logic;
- TanStack Query was not added unless a concrete client-cache requirement was
  documented in the story packet.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | |
| Integration | |
| E2E | |
| Platform | |
| Performance | |
| Logs/Audit | |

## Fixtures

List deterministic users, accounts, records, provider responses, or other
fixtures needed for repeatable proof.

## Commands

Add commands after scripts exist.

```text
TBD
```

## Acceptance Evidence

Add results after verification.
