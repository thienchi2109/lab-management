# Validation

## Proof Strategy

US-016C hoàn tất khi `/dashboard/analytics` polish xong mà US-010C/US-010D
contracts vẫn pass.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Filter summary, empty/error/loading visual states. |
| Integration | Analytics route tests và table/chart fallback tests. |
| E2E | Admin open analytics desktop/mobile, apply filter, no overlay, no overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |
| Accessibility | Filter labels, chart/table fallback text, keyboard focus. |

## Commands

```bash
cd lab-kit-app
bun run test app/dashboard/analytics/error.test.tsx
bun run test
bun run quality
bun run docstring:check
```

## Acceptance Evidence

- Planned. Runtime proof pending implementation.
