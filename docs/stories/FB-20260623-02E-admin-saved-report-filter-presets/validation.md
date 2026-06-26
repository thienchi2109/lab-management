# Validation

## Proof Strategy

Story is complete only when Admin persistence and Viewer non-persistence are
proven mechanically and in browser. Proof must show:

- Admin can save default preset for all chart filters.
- Viewer reads saved preset on first load.
- Viewer changes filters without writing preset.
- Viewer save attempt is impossible in UI and rejected at server boundary.
- Preset payload is validated against known chart/filter whitelist.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Preset parser, role guard, merge default filters with saved preset. |
| Integration | Admin save/read, Viewer read, Viewer write denied, invalid payload rejected. |
| E2E | Admin saves preset; Viewer opens `/dashboard/analytics` and sees saved filters; Viewer local filter does not persist after reload/new session. |
| Platform | Supabase migration/RLS/advisor proof if table/policy is added. |
| Performance | Preset read is small and organization-scoped. |
| Logs/Audit | Audit payload uses field-name-only policy or equivalent safe summary. |

## Fixtures

- Admin account.
- Viewer account.
- One organization.
- Four chart preset entries with date filters and at least one additional filter.

## Commands

Đã chạy trong `lab-kit-app/`:

```text
bun run test lib/analytics/report-kit-presets.test.ts app/api/analytics/report-kit/preset/route.test.ts app/dashboard/analytics/_components/analytics-report-kit-preset-ui.test.tsx app/dashboard/analytics/_components/analytics-report-kit-chart-state.test.ts app/dashboard/analytics/_components/analytics-report-kit-charts.test.tsx app/dashboard/analytics/page.test.tsx app/dashboard/analytics/page-report-kit.test.tsx app/api/analytics/report-kit/route.test.ts lib/analytics/report-kit.test.ts
bun run typecheck
bun run lint:strict
bun run format:check
bun run docstring:check
bun run react-doctor:diff
```

## Acceptance Evidence

- RED tests đã fail đúng lý do thiếu module/route preset trước khi implement.
- Focused tests xanh: 9 files, 24 tests.
- Supabase MCP namespace: `mcp__supabase_lab_management`; project-ref repo
  mapping: `tuuqgpzgollcerqqszjr`.
- Applied migrations:
  - `20260626075430_report_filter_presets`
  - `20260626075546_report_filter_preset_actor_fk_indexes`
- RLS proof: `report_filter_presets` có policies Admin insert/update và
  member select; function `upsert_report_filter_preset_with_audit` chỉ grant
  `service_role`.
- Advisor proof: security còn warning nền `auth_leaked_password_protection`;
  performance không còn unindexed FK mới của `report_filter_presets`.
- Browser proof bằng `agent-browser`:
  - Admin đăng nhập `admin / 123456@`, chart đầu đọc preset; browser session
    gọi `PUT /api/analytics/report-kit/preset` trả `200` và DB lưu
    `receivedFrom = 2026-06-06`.
  - Viewer đăng nhập bằng shortcut Viewer, mở `/dashboard/analytics`, đọc
    preset `2026-06-06`, không có nút `Lưu preset mặc định`.
  - Viewer local override không persist sau reload; direct Viewer `PUT` bị
    chặn `403`.
