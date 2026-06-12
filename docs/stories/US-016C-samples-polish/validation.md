# Validation

## Proof Strategy

US-016C hoàn tất khi `/dashboard/samples` polish xong và các contract US-009B,
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

- PR #65 merged into `main` on 2026-06-12 at
  `db9511d0831d1242eecc0966ec3dc8f21afe5c1a`.
- Implementation kept `/dashboard/samples` on shared `DashboardDataTable`,
  adding compact/workspace variants, empty reset action, mobile primary result
  action, and extracted result-column controls.
- Focused tests passed before merge:
  `bun run test components/dashboard/data-table.test.tsx app/dashboard/samples/_components/sample-grid-page-content.test.tsx`
  with 2 files / 15 tests.
- React Doctor diff and docstring gates passed before push and merge:
  `bun run react-doctor:diff`, `bun run docstring:check`.
- Agent Browser E2E with `admin / 123456@` verified login,
  `/dashboard/samples`, desktop result-column mode switch, mobile
  `390x844` no horizontal overflow, and mobile `Mở kết quả` navigation to the
  sample results route.
- Screenshots were captured outside the repo during QA:
  `/tmp/us-016c-samples-desktop.png` and
  `/tmp/us-016c-samples-mobile.png`.
- React Doctor verbose follow-up clarified that the 13 pre-commit staged
  warnings were false positives from `deslop/unused-dependency`; current
  `--diff --verbose` reports no PR issues and full verbose scan only reports
  the 3 tracked baseline warnings.
