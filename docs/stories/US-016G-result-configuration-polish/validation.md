# Validation

## Proof Strategy

US-016G hoàn tất khi `/dashboard/result-configuration` được polish mà US-004
configuration behavior vẫn giữ nguyên.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Result configuration filtering, schemas and operation guards still pass. |
| Integration | Page/component tests cover summary, panel switching and dialog states. |
| E2E | Admin opens result configuration desktop/mobile, searches, switches panel, opens create dialogs, no overlay, no horizontal overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |

## Commands

```bash
cd lab-kit-app
bun run test app/dashboard/result-configuration/_components/result-configuration-page-content.test.tsx \
  app/dashboard/result-configuration/actions.test.ts \
  lib/result-configuration/configuration.test.ts \
  lib/result-configuration/schemas.test.ts \
  lib/result-configuration/server.test.ts \
  lib/result-configuration/operations.test.ts
bun run quality
bun run docstring:check
bun run react-doctor:diff
```

## Browser Proof Targets

- Desktop `1440x1000`: default panel, search, panel switch, create group,
  create metric and create template dialogs.
- Mobile `390x844`: panel switching, list/card scan, dialog ergonomics, no
  horizontal overflow and no bottom-nav overlap.

## Acceptance Evidence

- Planned. Runtime proof pending implementation.
