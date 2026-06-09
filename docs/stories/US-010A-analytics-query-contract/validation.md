# Validation

## Proof Strategy

US-010A hoàn tất khi analytics query contract có tests và có thể được US-010B/C
dùng mà không cần đọc raw client input.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | whitelist dimensions/measures/filters, invalid payload, date range, page size, filter summary |
| Integration | read port double chứng minh aggregate mapper và unbounded-query guard |
| E2E | Không áp dụng |
| Platform | typecheck, lint, format, React Doctor nếu TSX bị chạm, build |
| Performance | query contract giới hạn page/limit và yêu cầu filter khi cần |

## Fixtures

Use test doubles cho samples, companies, sample types, kit types, result groups,
PCR conclusions và metric values.

## Commands

```bash
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
cd lab-kit-app && bun run docstring:check
scripts/bin/harness-cli story verify US-010A
```

## Acceptance Evidence

- RED proof: `cd lab-kit-app && bun run test lib/analytics/query.test.ts
  lib/analytics/operations.test.ts` failed because `./query` and
  `./operations` did not exist.
- GREEN proof: focused analytics tests passed with 2 files / 7 tests.
- Story verify passed with command:
  `cd lab-kit-app && bun run test && bun run quality && bun run docstring:check`.
- Full Vitest passed: 66 files / 230 tests.
- Quality passed: typecheck, ESLint strict, Prettier check, React Doctor with
  `--fail-on error`, and Next.js production build.
- Docstring gate passed.
- E2E not applicable for US-010A because this slice adds no UI/API route.
