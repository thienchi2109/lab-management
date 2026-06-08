# Validation

## Proof Strategy

US-009C hoàn tất khi mobile/tablet không bị vỡ layout và column visibility được
lưu local/session mà không mutation server.

Proof bắt buộc:

- Build Web Apps plugin capability được invoke trước UI work;
- compact/mobile mode không tràn ngang hoặc overlap;
- column visibility reload/refresh behavior đúng;
- storage fallback không làm crash UI;
- không có server mutation cho preference;
- `DashboardDataTable` vẫn là table/list surface.

## Test Plan

- Unit: storage adapter nếu có.
- UI: toggle column visibility, reload behavior, fallback khi storage lỗi.
- Browser: mobile và desktop screenshots/interaction.
- Platform: typecheck, lint strict, build, React Doctor.

## Fixtures

- Grid từ US-009B với nhiều cột cơ bản.
- Viewport mobile, tablet, desktop.

## Commands

```bash
cd lab-kit-app
bun run typecheck
bun run lint:strict
bun run build
bun run react-doctor
```

Sau khi có proof:

```bash
scripts/bin/harness-cli story update --id US-009C --unit 1 --platform 1
scripts/bin/harness-cli story verify US-009C
```

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- RED: focused tests failed before implementation because
  `DashboardDataTable` did not expose responsive column metadata, Sample Grid did
  not render column preferences, and `SampleGridColumnPreferences` did not exist.
- GREEN focused tests:
  `bun run test components/dashboard/data-table.test.tsx app/dashboard/samples/_components/sample-grid-page-content.test.tsx app/dashboard/samples/_components/sample-grid-column-preferences.test.tsx`
  passed 3 files / 9 tests.
- Full app tests passed: `cd lab-kit-app && bun run test` passed 63 files / 199
  tests.
- Quality gates passed: `bun run typecheck`, `bun run lint:strict`,
  `bun run format:check`, `bun run docstring:check`, `bun run build`,
  `bun run react-doctor`, and `bun run react-doctor:diff`.
- Harness proof passed after fixing the recursive `verify_command` guard:
  `scripts/bin/harness-cli story verify US-009C`.
- Implementation keeps US-009C browser-only for preferences: no schema, RPC,
  migration, or server preference mutation was added.
- Authenticated browser E2E passed with a user-provided admin credential:
  `agent-browser` logged in through Supabase Auth, opened `/dashboard/samples`,
  confirmed seeded rows `T6_SEED_010` through `T6_SEED_001`, hid the `KIT`
  column, reloaded the page, and confirmed the stored hidden preference kept the
  `KIT` cells hidden with the checkbox unchecked.
- Regression proof added for hydration: server markup cannot read browser
  storage, then client hydration reads `localStorage` and syncs the `KIT`
  checkbox to unchecked while the column is hidden.
- Desktop browser toggle proof passed: clicking `Hiển thị KIT` again restored
  storage to `[]`, checked the toggle, and showed the `KIT` cells.
- Mobile browser proof passed at `390x844`: with preferences enabled, compact
  mode did not expose lower-priority `KIT` cells in the mobile viewport.
