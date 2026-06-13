# Validation

## Proof Strategy

US-016E hoàn tất khi `/dashboard/users` polish xong mà US-014 authorization và
audit contracts vẫn đúng.

Proof phải bao gồm cả code-level checks và browser proof vì đây là UI polish
trên admin-only workflow. Nếu chỉ cập nhật docs/story packet, không được ghi
runtime proof là đã hoàn tất.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | `lib/user-management/users.test.ts`, `last-admin.test.ts`, and focused component tests for changed summary/filter/table/dialog states. |
| Integration | Existing users action/page tests pass; add regression for changed UI states when server-action feedback or guard copy changes. |
| E2E | Admin opens users desktop/mobile, searches/filters, opens create dialog, opens edit dialog, no overlay, no horizontal overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |
| Security | Editor/Viewer denied behavior and last-active-admin guard unchanged. |

## Browser Proof Targets

- Desktop: `1440x1000`, `/dashboard/users`, default list, filter/search state,
  create dialog, edit dialog.
- Mobile: `390x844`, `/dashboard/users`, search-first workflow, role/status
  filter workflow, user card/list scan, create surface, edit surface, no
  horizontal overflow, no scroll trap, primary actions remain visible, and
  bottom navigation does not cover controls.
- Mobile interaction path: find one user, apply one role/status filter, clear
  filters, open create, close create, open edit, inspect role/status controls,
  close edit.
- Negative state: non-admin route denied if auth fixtures make this practical;
  otherwise cover denied behavior with existing action/page tests and state the
  limitation.

## Prior UI Rollout Proof Pattern

US-016E acceptance evidence should follow the proof style from US-016B-D:

- list focused test files and test counts;
- list `bun run quality`, `bun run docstring:check` and React Doctor result;
- list Harness story verify result, or record the exact Harness blocker;
- list browser route, credential fixture, viewport, interaction path and
  screenshot paths;
- state explicitly whether any shared component exception was taken.
- state explicitly whether any new shadcn component was added. If yes, include
  `shadcn docs`, `add --dry-run`/`--diff` evidence where relevant, files added,
  and review notes for composition/accessibility.

## Commands

```bash
cd lab-kit-app
npm exec --yes --package shadcn@latest -- shadcn info --json
bun run test lib/user-management/users.test.ts lib/user-management/last-admin.test.ts
bun run test app/dashboard/users
bun run test
bun run quality
bun run docstring:check
bun run react-doctor:diff
```

If implementation changes shared dashboard components, also run focused tests
for affected routes/components and record them here.

Use the project package runner for shadcn when it works. In this environment,
`bunx --bun shadcn@latest info --json` crashed during packet discovery, so
`npm exec --yes --package shadcn@latest -- shadcn ...` is the documented fallback
for shadcn CLI reads/adds unless Bun behavior is fixed.

## Acceptance Evidence

- Branch: `feature/us-016e-users-polish`.
- shadcn: `npm exec --yes --package shadcn@latest -- shadcn info --json`
  xác nhận bộ hiện có gồm `badge`, `button`, `card`, `checkbox`, `input`,
  `select`, `tooltip`. US-016E không thêm shadcn component mới; UI dùng lại
  shared `DashboardDataTable`, `DialogFrame` và các component shadcn đã có.
- Focused users tests:
  `bun run test app/dashboard/users/_components/user-management-client.test.tsx app/dashboard/users/_components/user-table.test.tsx app/dashboard/users/_components/user-form-dialogs.test.tsx app/dashboard/users/_components/user-management-review-fixes.test.ts`
  -> 4 files passed, 8 tests passed.
- Guard suite:
  `bun run test lib/user-management/users.test.ts lib/user-management/last-admin.test.ts app/dashboard/users`
  -> 6 files passed, 15 tests passed.
- Full suite: `bun run test` -> 93 files passed, 338 tests passed.
- Docstring gate: `bun run docstring:check` -> passed, 0 changed source files.
- React Doctor diff:
  `bun run react-doctor:diff -- --verbose` -> scanned 6 changed files, no
  issues found.
- Quality gate: `bun run quality` -> typecheck, lint strict, format check,
  React Doctor full scan and `next build` completed. React Doctor full scan
  still reports one warning in the existing codebase and does not fail the gate;
  diff scan for US-016E is clean.
- Browser proof used `agent-browser` with the e2e admin fixture
  `admin / 123456@`:
  - desktop `1440x1000`, `/dashboard/users`: page identity, non-blank content,
    no framework overlay, users list, search, role filter, empty state, clear
    filter, create dialog and edit dialog verified;
  - mobile `390x844`: card fallback, `Sửa người dùng` primary action,
    search-first command area, create/edit dialogs, bottom navigation and
    horizontal overflow checked;
  - overflow checks returned `overflowX:false` for mobile list and dialog.
- Browser screenshots:
  - `/root/images/us016e-users-desktop.png`
  - `/root/images/us016e-users-create-dialog.png`
  - `/root/images/us016e-users-mobile.png`
  - `/root/images/us016e-users-mobile-edit.png`
  - `/root/images/us016e-users-mobile-create.png`
- Browser console/page errors: `agent-browser errors` returned no page errors;
  framework overlay check returned `OK`. Console only showed dev/HMR messages
  and the existing login illustration LCP warning.
- Harness: `scripts/bin/harness-cli story verify US-016E` now runs the executable
  `verify_command` from repo root:
  `cd lab-kit-app && bun run test app/dashboard/users/_components/user-management-client.test.tsx app/dashboard/users/_components/user-table.test.tsx app/dashboard/users/_components/user-form-dialogs.test.tsx app/dashboard/users/_components/user-management-review-fixes.test.ts && bun run test lib/user-management/users.test.ts lib/user-management/last-admin.test.ts app/dashboard/users && bun run quality && bun run docstring:check && bun run react-doctor:diff -- --verbose`.
  The previous prose command failed with `sh: 1: Users: not found`; the
  Harness metadata has been corrected.
- Harness story verify result after correction: pass. Focused component tests
  passed 4 files / 8 tests; guard suite passed 6 files / 15 tests; `quality`
  completed typecheck, lint strict, format check, React Doctor full scan and
  Next build; `docstring:check` passed; React Doctor diff completed. React
  Doctor still reports one existing non-blocking warning during full scans.
