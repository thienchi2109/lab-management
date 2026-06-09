# Validation

## Proof Strategy

US-010D hoàn tất khi `/dashboard/analytics` render ổn định cho Admin, Editor,
Viewer và hiển thị filter summary/pivot state đúng trên desktop/mobile.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | filter summary UI, empty/error/loading components |
| Integration | page render với mocked analytics response/options |
| E2E | anonymous redirect; Admin/Editor/Viewer open analytics; apply filter; no error overlay |
| Platform | quality, React Doctor package script, Next build |
| Accessibility | labels cho filter controls và chart/table fallback text |

## Fixtures

Use deterministic analytics responses từ US-010C tests. Browser E2E dùng auth
fixtures hiện có.

## Commands

```bash
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
cd lab-kit-app && bun run docstring:check
scripts/bin/harness-cli story verify US-010D
```

## Acceptance Evidence

Pending implementation.
