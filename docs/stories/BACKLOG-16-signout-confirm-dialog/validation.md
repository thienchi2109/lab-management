# Validation

## Planned Proof

Focused tests:

```bash
cd lab-kit-app && bun run test components/ui/confirm-dialog.test.tsx components/layout/topbar.test.ts app/auth/signout/route.test.ts
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

- Story packet created for planning only.
- No application code changed yet.
- Intake `#48` recorded.
- Story row `BACKLOG-16-signout-confirm-dialog` recorded with verify command.

## Runtime Proof

Pending implementation.

