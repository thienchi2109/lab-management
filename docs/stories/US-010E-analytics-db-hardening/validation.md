# Validation

## Proof Strategy

US-010E hoàn tất khi có bằng chứng live đủ để no-op hoặc có migration/RPC/index
forward-only đã verify.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Không áp dụng nếu no-op |
| Integration | query representative sau migration nếu có |
| E2E | Không áp dụng |
| Platform | schema validator và quality nếu runtime code đổi |
| DB | target proof, migration history, advisor, EXPLAIN summary |

## Fixtures

Use live Supabase lab project only after target proof:

- namespace `mcp__supabase_lab_management`;
- project-ref `tuuqgpzgollcerqqszjr`;
- target tables/functions from US-010A-D query shapes.

## Commands

```bash
node scripts/validate-supabase-schema.mjs
scripts/bin/harness-cli story verify US-010E
```

## Acceptance Evidence

Pending US-010A-D implementation and live DB survey.
