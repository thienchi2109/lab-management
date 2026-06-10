# Validation

## Proof Strategy

US-016A hoàn tất khi `/login` được polish mà không đổi auth behavior.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Form render, error state, disabled/pending state nếu component hóa. |
| Integration | Existing login route/page tests vẫn pass; thêm regression nếu đổi state rendering. |
| E2E | Anonymous open `/login`, invalid login shows error, valid admin login redirects. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |
| Accessibility | Keyboard focus visible; labels gắn với input; contrast pass. |

## Commands

```bash
cd lab-kit-app
bun run test app/auth/login/route.test.ts app/global-font.test.ts
bun run quality
bun run docstring:check
```

## Acceptance Evidence

- Planned. Runtime proof pending implementation.
