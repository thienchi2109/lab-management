# Validation

## Proof Strategy

Story hoàn tất khi render tests chứng minh card mobile mới và browser proof xác
nhận mật độ hiển thị không còn quá thưa.

## Test Plan

| Layer     | Cases                                                                                  |
| --------- | -------------------------------------------------------------------------------------- |
| Component | Mobile card fields, absence của mã mẫu, absence của column controls.                   |
| Browser   | Mobile 390px: card không overflow, action dễ chạm, mật độ gần mục tiêu 4 mẫu/màn hình. |
| Platform  | Typecheck, React Doctor diff, format check.                                            |

## Acceptance Evidence

- Implemented on 2026-06-20 using Stitch MCP project
  `3947390963608389272`, refined variant `Clinical Grid`.
- RED proof: focused tests failed before implementation because
  `DashboardDataTable` ignored `mobileCard` and Samples did not render
  `data-mobile-sample-card="clinical-grid"`.
- Focused tests passed:
  `cd lab-kit-app && bun run test components/dashboard/data-table.test.tsx app/dashboard/samples/_components/sample-grid-page-content.test.tsx`
  with 2 files / 19 tests.
- Platform proof passed: `bun run typecheck`, `bun run format:check`,
  `bun run docstring:check`, `bun run react-doctor:diff` with no issues.
- Harness proof passed: `scripts/bin/harness-cli story verify FB-20260615-03`.
- Agent Browser mobile proof with `admin / 123456@` at `390x844` passed:
  `/dashboard/samples` rendered 4 clinical-grid cards, 4 result bands, 0
  legacy mobile label/value cells, no horizontal overflow, and no page errors.
- Interaction proof: tapping first `Mở kết quả` kept URL at `/dashboard/samples`
  and opened viewer `Kết quả mẫu T6_77881`.
- Screenshots were captured outside the repo:
  `/tmp/lab-samples-mobile-grid-before.png`,
  `/tmp/lab-samples-mobile-grid-after.png`, and
  `/tmp/lab-samples-mobile-result-viewer-after.png`.
- Follow-up bottom sheet filter implemented on 2026-06-20 using Stitch MCP
  variant 2 `Search-First Minimalist`
  `projects/3947390963608389272/screens/039ea2d3c507429fb7226dee2db45be2`.
- RED proof for follow-up: new focused test
  `sample-grid-mobile-filter-sheet.test.tsx` failed before implementation
  because the mobile toolbar and bottom sheet did not exist.
- Focused follow-up tests passed:
  `cd lab-kit-app && bun run test app/dashboard/samples/_components/sample-grid-mobile-filter-sheet.test.tsx app/dashboard/samples/_components/sample-grid-page-content.test.tsx components/ui/overlay-frame.test.tsx`
  with 3 files / 23 tests.
- Platform proof passed after follow-up: `bun run typecheck`,
  `bun run format:check`, `bun run docstring:check`, and
  `bun run react-doctor:diff`.
- Agent Browser mobile proof with `admin / 123456@` at `390x844` passed:
  `/dashboard/samples` rendered 1 mobile filter toolbar and 4 clinical-grid
  cards, opened bottom sheet with search/date/type/customer/company/PCR fields,
  kept dialog bottom at 772px on 844px viewport to leave bottom navigation room,
  had no horizontal overflow, and had no page errors.
- Bottom sheet submit proof: entering `T6` and pressing `Áp dụng` navigated to
  `/dashboard/samples?page=1&search=T6...` without page errors.
- Follow-up screenshots were captured outside the repo:
  `/tmp/lab-samples-mobile-filter-toolbar.png` and
  `/tmp/lab-samples-mobile-filter-sheet.png`.
