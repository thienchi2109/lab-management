# Validation

## Proof Strategy

US-016D hoàn tất khi `/dashboard/analytics` polish xong mà US-010C/US-010D
contracts vẫn pass.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Filter summary, empty/error/loading visual states. |
| Integration | Analytics route tests và table/chart fallback tests. |
| E2E | Admin open analytics desktop/mobile, apply filter, no overlay, no overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |
| Accessibility | Filter labels, chart/table fallback text, keyboard focus. |

## Commands

```bash
cd lab-kit-app
bun run test app/dashboard/analytics/error.test.tsx
bun run test
bun run quality
bun run docstring:check
```

## Acceptance Evidence

- Implemented on 2026-06-13. `/dashboard/analytics` now uses a compact
  command-bar filter with shadcn `AppSelect` controls, applied summary strip,
  read-only status, metric overview cards, polished pivot chart/table copy, and
  shared `DashboardDataTable` compact/workspace table. The
  `/api/analytics/pivot` request body contract was not changed.
- Mobile dashboard navigation keeps the primary destinations visible and groups
  secondary routes under `Thêm`, reducing bottom-nav crowding on 390px
  viewport.
- Focused proof passed: `bun run test
  app/dashboard/analytics/_components/analytics-page-client.test.tsx
  app/dashboard/analytics/error.test.tsx
  components/dashboard/data-table.test.tsx` with 3 files / 15 tests.
- Mobile nav proof passed: `bun run test components/layout/bottom-nav.test.tsx
  components/layout/navigation-items.test.ts
  app/dashboard/users/_components/user-management-review-fixes.test.ts` with 3
  files / 6 tests.
- Harness proof passed: `scripts/bin/harness-cli story verify US-016D`, including
  full `bun run test` with 90 files / 334 tests, `bun run quality`, and
  `bun run docstring:check`.
- React Doctor diff passed with no issues:
  `cd lab-kit-app && bun run react-doctor:diff`.
- Agent Browser E2E passed with `admin / 123456@` on desktop `1440x1000` and
  mobile `390x844`. Mobile proof found no framework error overlay, no
  horizontal overflow, shadcn select listbox opens, `Thêm` menu exposes
  secondary routes, and apply-filter preserves read-only, applied summary,
  chart, and table states.
- Screenshots:
  `/root/images/us016d-analytics-desktop.png`,
  `/root/images/us016d-analytics-mobile-bottom-nav-more.png`,
  `/root/images/us016d-analytics-mobile-more-menu.png`,
  `/root/images/us016d-analytics-mobile-shadcn-select-open.png`,
  `/root/images/us016d-analytics-mobile-applied.png`.
