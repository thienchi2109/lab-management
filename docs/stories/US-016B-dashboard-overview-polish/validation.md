# Validation

## Proof Strategy

US-016B hoàn tất khi `/dashboard` polish xong và vẫn render dữ liệu thật từ
contract US-010B.

Implementation phải có proof theo hai lớp:

1. Contract proof: component vẫn render đúng dữ liệu từ `DashboardOverviewData`
   và không đổi analytics read ports.
2. Visual/browser proof: desktop và mobile render có hierarchy rõ, không error
   overlay, không console error liên quan, không overflow ngoài ý định, và
   low-data/empty state có chủ đích.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Dashboard card/section states nếu có thay đổi component, gồm low-data branch. |
| Integration | `dashboard-page-content` test pass và thêm case empty/recent samples mobile contract nếu cần. |
| E2E | Admin open `/dashboard` desktop/mobile, không error overlay, không overflow, CTA đúng route/disabled state. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |
| Accessibility | Cards có heading/labels rõ, số liệu đọc được, focus không mất. |
| Visual QA | Screenshot desktop và mobile; ghi mismatch ledger nếu dùng concept/reference. |

## Commands

```bash
cd lab-kit-app
bun run test app/dashboard/_components/dashboard-page-content.test.tsx
bun run quality
bun run docstring:check
bun run react-doctor
```

Nếu test được cấu hình qua Harness story verify, dùng:

```bash
scripts/bin/harness-cli story verify US-016B
```

Nếu cần browser proof nhưng Browser plugin không có, dùng Playwright fallback và
ghi rõ lý do fallback theo `frontend-testing-debugging`.

## Acceptance Evidence

- Implemented on 2026-06-11.
- `cd lab-kit-app && bun run test app/dashboard/_components/dashboard-page-content.test.tsx` passed: 1 file / 2 tests.
- `cd lab-kit-app && bun run quality` passed: typecheck, ESLint strict,
  Prettier, React Doctor package script, and Next build. React Doctor reported
  one maintainability warning, non-blocking under the repo script.
- `cd lab-kit-app && bun run docstring:check` passed.
- `scripts/bin/harness-cli story verify US-016B` passed after replacing the
  non-executable verify description with the executable focused command.
- Pull request: https://github.com/thienchi2109/lab-management/pull/56
- Agent Browser desktop `/dashboard` at 1440x1000 with `admin / 123456@`: no
  framework overlay, dashboard text present, no horizontal overflow, screenshot
  `/root/images/us016b-dashboard-desktop.png`.
- Agent Browser mobile `/dashboard` at 390x844 with `admin / 123456@`: no
  framework overlay, dashboard text present, no horizontal overflow, screenshot
  `/root/images/us016b-dashboard-mobile.png`.
- Agent Browser mobile recent-samples scroll proof: mobile card fallback renders
  sample label/value rows with no horizontal overflow, screenshot
  `/root/images/us016b-dashboard-mobile-recent.png`.
- Follow-up font polish on the same PR switched the project font stack to the
  Stitch reference family through `next/font`: global UI uses Geist, data/ID
  mono uses JetBrains Mono.
- Follow-up focused proof passed:
  `cd lab-kit-app && bun run test app/global-font.test.ts app/theme-dark-mode.test.ts`.
- Follow-up quality proof passed: `cd lab-kit-app && bun run quality`.
- Agent Browser font proof on `/dashboard` at 1440x1000 and 390x844 confirmed
  computed `html`/`body` font is Geist, `.font-mono` is JetBrains Mono,
  Vietnamese text is present, no framework overlay, and no horizontal overflow;
  screenshots:
  `/root/images/us016b-font-dashboard-desktop.png`,
  `/root/images/us016b-font-dashboard-mobile.png`.
- Agent Browser clean-session `/login` proof at 1440x1000 confirmed computed
  font is Geist, Vietnamese text is present, no framework overlay, and no
  horizontal overflow; screenshot `/root/images/us016b-font-login-desktop.png`.

## Current Intake Evidence

- Harness intake #29 recorded for US-016B.
- Code Review Graph traversal for `dashboard overview` identified route
  components and analytics read-model blast radius.
- Current implementation inspected:
  - `lab-kit-app/app/dashboard/page.tsx`
  - `lab-kit-app/app/dashboard/layout.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-page-content.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-hero.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-stats-grid.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-stat-card.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-main-grid.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-trend-card.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-metric-card.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-recent-samples-card.tsx`
  - `lab-kit-app/app/dashboard/_components/dashboard-page-content.test.tsx`
