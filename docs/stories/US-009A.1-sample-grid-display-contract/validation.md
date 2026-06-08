# Validation

## Proof Strategy

US-009A.1 hoàn tất khi focused tests chứng minh contract trả display labels và
role capabilities mà không thay đổi UI grid hoặc database schema.

## Test Plan

- Unit/domain: `listSampleGridPage()` trả capability đúng cho Editor và Viewer.
- Server adapter: Supabase select có relationship labels cần cho display row.
- Server adapter: row map fallback an toàn khi thiếu company hoặc KIT.

## Commands

```bash
cd lab-kit-app
bun run test lib/sample-grid/operations.test.ts lib/sample-grid/server.test.ts
bun run typecheck
bun run lint:strict
bun run format:check
bun run react-doctor
bun run docstring:check
bun run build
```

Sau khi có proof:

```bash
scripts/bin/harness-cli story update --id US-009A.1 --unit 1 --integration 1 --platform 0
scripts/bin/harness-cli story verify US-009A.1
```

## Acceptance Evidence

- Story split from US-009B before UI implementation.
- RED: focused tests failed because `SampleGridPage.capabilities` was
  `undefined` and Supabase select did not include `sample_types(name)`.
- GREEN focused tests: `bun run test lib/sample-grid` passed `3` files and `9`
  tests.
- Full Vitest: `bun run test` passed `59` files and `189` tests.
- Quality gates passed: `bun run typecheck`, `bun run lint:strict`,
  `bun run format:check`, `bun run docstring:check`, `bun run build`, and
  `bun run react-doctor`.
- Harness: `scripts/bin/harness-cli story verify US-009A.1` passed after
  setting verify command to `cd lab-kit-app && bun run test lib/sample-grid`.
- Friction: direct `bun test` invoked Bun native runner and crashed on this CPU
  with missing AVX support; repo script `bun run test` uses Vitest and passed.
