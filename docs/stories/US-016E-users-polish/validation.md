# Validation

## Proof Strategy

US-016E hoàn tất khi `/dashboard/users` polish xong mà US-014 authorization và
audit contracts vẫn đúng.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Dialog/form state and guard message tests if touched. |
| Integration | Existing users action/page tests pass; add regression for changed UI states. |
| E2E | Admin open users desktop/mobile, open create/edit dialog, no overlay, no overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |
| Security | Editor/Viewer denied behavior and last active admin guard unchanged. |

## Commands

```bash
cd lab-kit-app
bun run test app/dashboard/users
bun run quality
bun run docstring:check
```

## Acceptance Evidence

- Planned. Runtime proof pending implementation.
