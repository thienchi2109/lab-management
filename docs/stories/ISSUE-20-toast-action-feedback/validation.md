# Validation

## Proof Strategy

Story is complete when action feedback uses the existing global toast primitive
without regressing inline validation, pending states or action security copy.

## Planned Test Plan

- `components/dashboard/action-toast.test.tsx` or equivalent shared-helper test:
  - RED: helper does not exist or does not call `useToast`.
  - Green: success state emits one toast.
  - Green: workflow error state emits one toast.
  - Green: idle state emits no toast.
  - Green: same action result does not emit duplicate toasts on re-render.

- Feature tests:
  - Samples create/edit dialog emits success toast while preserving field errors.
  - Kits action dialog emits success toast for create/update flow.
  - Result configuration create dialog emits success toast.
  - Users create/edit dialog emits success toast.
  - Sample results save flow emits success or workflow error toast if covered by
    existing action state.

- Regression checks:
  - Existing server action tests continue passing.
  - Existing form/dialog tests continue passing.
  - Toast provider remains mounted once from root layout.

## Planned Commands

```bash
cd lab-kit-app && bun run test components/ui/toast.test.tsx
cd lab-kit-app && bun run test components/dashboard/action-message.test.tsx
cd lab-kit-app && bun run test app/dashboard/samples/_components/sample-metadata-dialogs.test.tsx
cd lab-kit-app && bun run test app/dashboard/kits/_components/kit-inventory-client.test.tsx
cd lab-kit-app && bun run test app/dashboard/result-configuration/_components/result-configuration-dialogs.test.tsx
cd lab-kit-app && bun run test app/dashboard/users/_components/user-form-dialogs.test.tsx
cd lab-kit-app && bun run react-doctor:diff
cd lab-kit-app && bun run docstring:check
cd lab-kit-app && bun run build
```

If tests are renamed during implementation, update this packet and the durable
story verify command before closing the story.

## Browser Proof

Run browser smoke on at least one success path and one validation/error path:

- submit a valid create or update action and verify toast appears;
- submit invalid field data and verify field error remains inline;
- verify no framework error overlay and no layout overflow on mobile.

## Acceptance Evidence

Pending implementation.
