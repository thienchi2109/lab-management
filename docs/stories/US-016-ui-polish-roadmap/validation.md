# Validation

## Proof Strategy

US-016 is complete only when all child stories are implemented and verified.
Parent proof should summarize child proof rather than rerun every route by hand.

Each child story must prove:

- Build Web Apps plugin capability was invoked before UI implementation.
- Taste-skill audit was used as a checklist where relevant.
- `code-deduplication` was invoked before adding reusable UI/hooks/helpers.
- Existing auth, role visibility, API, SQL and server-state behavior remain
  unchanged unless a separate story explicitly approves the change.
- Desktop and mobile browser checks show no overlap, no unexpected horizontal
  overflow and no Next.js error overlay.
- React Doctor runs through package scripts.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Focused component tests for changed states or view models where available. |
| Integration | Route/page tests for changed filters, cards, dialogs or state rendering. |
| E2E | Agent Browser desktop and mobile smoke for each polished route. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |
| Release | `scripts/bin/harness-cli story verify <story-id>` after proof is recorded. |

## Commands

```bash
cd lab-kit-app
bun run test
bun run quality
bun run docstring:check
```

For route-specific stories, focused tests should run before the full gate.

## Acceptance Evidence

- Planned roadmap only. Runtime implementation and proof are pending child
  stories.
