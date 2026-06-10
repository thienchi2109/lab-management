# Validation

## Proof Strategy

US-010C hoàn tất khi API pivot có route tests cho auth, role, validation,
success response và query guard.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | request/response mapper nếu tách riêng |
| Integration | route tests cho 401, 403, 400, 422, success |
| E2E | Không áp dụng |
| Platform | typecheck, lint, format, build |
| Security | no raw SQL, no secret/PII-heavy payload logging |

## Fixtures

Use route test doubles cho session, actor và analytics use case.

## Commands

```bash
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
cd lab-kit-app && bun run docstring:check
scripts/bin/harness-cli story verify US-010C
```

## Acceptance Evidence

- 2026-06-10: Focused analytics route/contract tests pass với 3 files / 14
  tests:
  `cd lab-kit-app && bun run test lib/analytics/query.test.ts lib/analytics/operations.test.ts app/api/analytics/pivot/route.test.ts`.
- 2026-06-10: `scripts/bin/harness-cli story verify US-010C` pass sau khi cập
  nhật verify command sang
  `cd lab-kit-app && bun run test && bun run quality && bun run docstring:check`;
  full gate pass với 71 files / 250 tests, quality, React Doctor, Next build và
  docstring gate.
