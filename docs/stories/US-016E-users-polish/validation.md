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

- Planned. Runtime proof pending implementation.
