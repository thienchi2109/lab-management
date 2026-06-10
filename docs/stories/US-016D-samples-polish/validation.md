# Validation

## Proof Strategy

US-016D hoàn tất khi `/dashboard/samples` polish xong và các contract US-009B,
US-009C, US-009D vẫn đúng.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Filter/search state, empty/error/loading, mobile card if touched. |
| Integration | Existing samples page tests and `DashboardDataTable` tests pass. |
| E2E | Admin open samples, search known row, open result/image action, mobile no overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |
| Accessibility | Table labels, row actions, focus and touch targets. |

## Commands

```bash
cd lab-kit-app
bun run test app/dashboard/samples/page.test.tsx \
  app/dashboard/samples/loading.test.tsx \
  app/dashboard/samples/error.test.tsx \
  components/dashboard/data-table.test.tsx
bun run quality
bun run docstring:check
```

## Acceptance Evidence

- Planned. Runtime proof pending implementation.
