# Validation

## Proof Strategy

US-010B hoàn tất khi `/dashboard` hiển thị dữ liệu thật bounded và role read
flow pass cho Viewer.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | mapper/view model cho cards, trend, recent samples |
| Integration | dashboard data loader dùng actor hợp lệ và limit/date window |
| E2E | anonymous redirect; Admin/Editor/Viewer mở `/dashboard`; no error overlay |
| Platform | `bun run quality`, React Doctor package script, Next build |
| Performance | recent samples có limit; trend có date window |

## Fixtures

Use existing sample/result fixtures hoặc test doubles. Browser E2E nên dùng
admin/editor/viewer auth fixtures nếu có sẵn.

## Commands

```bash
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
cd lab-kit-app && bun run docstring:check
scripts/bin/harness-cli story verify US-010B
```

## Acceptance Evidence

US-010B implemented on branch `feature/us-010b-dashboard-overview-data`.

- Focused tests passed: `bun run test lib/analytics/query.test.ts lib/analytics/operations.test.ts lib/analytics/overview.test.ts lib/analytics/server.test.ts app/dashboard/_components/dashboard-page-content.test.tsx` (5 files / 14 tests).
- Full tests passed: `cd lab-kit-app && bun run test` (69 files / 239 tests).
- Platform gate passed: `cd lab-kit-app && bun run quality` including typecheck, ESLint strict, Prettier, React Doctor package script, and Next build.
- Docstring gate passed: `cd lab-kit-app && bun run docstring:check`.
- Harness verify passed after replacing placeholder verify command: `scripts/bin/harness-cli story verify US-010B`.
- Browser proof with `agent-browser`: anonymous `/dashboard` redirects to `/login?next=%2Fdashboard`; admin credential opens `/dashboard`; dashboard renders real bounded data (`11` samples, `1 / 1` KIT, recent `T6_SEED_*` rows); no Next.js error overlay found, only the empty dev-tools portal; signout returns to `/login`.
- Viewer read flow is covered by server integration tests; browser Viewer/Editor sessions were not run because only admin credentials were available in this session.
