# Validation

## Proof Strategy

US-016F hoàn tất khi `/dashboard/kits` được polish mà inventory behavior từ
US-005 vẫn giữ nguyên.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Kit inventory schemas, inventory view model and focused UI states. |
| Integration | Existing kit page/component tests and action-related guards still pass. |
| E2E | Admin opens kits desktop/mobile, searches/filters, opens create/update dialogs, no overlay, no horizontal overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |

## Commands

```bash
cd lab-kit-app
bun run test app/dashboard/kits/_components/kit-inventory-page-content.test.tsx \
  lib/kit-inventory/schemas.test.ts \
  lib/kit-inventory/inventory.test.ts \
  lib/kit-inventory/schema-contract.test.ts \
  lib/kit-inventory/operations.test.ts
bun run quality
bun run docstring:check
bun run react-doctor:diff
```

## Browser Proof Targets

- Desktop `1440x1000`: default inventory list, search, status/type filters,
  create type dialog, create batch dialog, add units dialog, update status dialog.
- Mobile `390x844`: list/card scan, filters, dialog open/close, no horizontal
  overflow and no bottom-nav overlap.

## Acceptance Evidence

- Planned. Runtime proof pending implementation.
