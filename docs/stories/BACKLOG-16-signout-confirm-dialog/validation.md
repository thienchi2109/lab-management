# Validation

## Planned Proof

Focused tests:

```bash
cd lab-kit-app && bun run test components/ui/confirm-dialog.test.tsx components/layout/topbar.test.tsx app/auth/signout/route.test.ts
```

Quality gates:

```bash
cd lab-kit-app && bun run react-doctor:diff
cd lab-kit-app && bun run docstring:check
```

Recommended browser proof after implementation:

- Desktop dashboard: click `Đăng xuất`, verify dialog opens and URL/session stay
  unchanged until confirm.
- Cancel, backdrop and Escape close dialog without sign out.
- Confirm signs out and lands on `/login` through current POST route.
- Mobile width: dialog text/buttons fit, no overflow, bottom nav does not hide
  actions.

## Current Evidence

- Implemented shared `ConfirmDialog` primitive in `components/ui`.
- Updated `Topbar` so the `Đăng xuất` icon opens confirm dialog first and the
  confirm action submits the existing `POST /auth/signout` form.
- Added focused regression coverage for shared confirm behavior and sign-out
  submit gating.
- Intake `#48` recorded.
- Story row `BACKLOG-16-signout-confirm-dialog` recorded with verify command.

## Runtime Proof

- `cd lab-kit-app && bun run test components/ui/confirm-dialog.test.tsx components/layout/topbar.test.tsx app/auth/signout/route.test.ts`
  passed: 3 files, 9 tests.
- `cd lab-kit-app && bun run typecheck` passed.
- `cd lab-kit-app && bun run format:check` passed.
- `cd lab-kit-app && bun run react-doctor:diff` passed with no issues.
- `cd lab-kit-app && bun run docstring:check` passed.
- `scripts/bin/harness-cli story verify BACKLOG-16-signout-confirm-dialog`
  passed.
- Browser smoke test intentionally skipped because the user asked to test the
  dev server manually.
