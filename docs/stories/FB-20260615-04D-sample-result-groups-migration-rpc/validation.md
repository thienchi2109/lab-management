# Validation

## Proof Strategy

04D chỉ hoàn tất khi local tests, schema-contract checks và live Supabase proof
cùng chứng minh bảng nối/RPC mới tồn tại, an toàn tenant và không phá mẫu cũ.

## Test Plan

- Schema contract:
  - migration tạo `public.sample_result_groups`;
  - RLS enabled;
  - PK/FK/index theo sample/group/organization;
  - RPC `create_sample_metadata_with_code` có `p_result_group_ids uuid[]`;
  - `save_sample_results_with_audit` dùng group whitelist từ bảng nối.
- Sample metadata:
  - create sample reject danh sách nhóm rỗng/khác organization/inactive;
  - create sample insert đúng bảng nối;
  - audit payload chỉ ghi field name `resultGroupIds`.
- Sample results:
  - save result reject metric thuộc nhóm không gắn với sample;
  - mẫu cũ có backfill/fallback vẫn xem/nhập được kết quả.
- Live DB:
  - trước migration: chứng minh target chưa tồn tại hoặc trạng thái hiện tại;
  - sau migration: chứng minh bảng/RLS/index/FK/RPC và backfill.

## Fixtures

- Một organization có ít nhất một sample cũ.
- Ít nhất một `result_group` active.
- Result template hiện có suy ra được group qua `result_template_metrics`.
- Case fallback cho sample không suy ra được template/group nếu local tests tạo
  fixture được.

## Commands

```bash
cd lab-kit-app
bun run test --run lib/sample-metadata lib/sample-results
node scripts/validate-supabase-schema.mjs
bun run typecheck
```

Nếu có staged TS/TSX source:

```bash
cd lab-kit-app
bun run react-doctor:staged
bun run docstring:check
```

Live read-only proof phải dùng:

```text
mcp__supabase_lab_management.list_migrations
mcp__supabase_lab_management.execute_sql
mcp__supabase_lab_management.list_tables
```

Live write chỉ được dùng sau pre-write proof:

```text
mcp__supabase_lab_management.apply_migration
```

## Acceptance Evidence

- Story evidence ghi migration version/name.
- Story evidence ghi namespace/project-ref đã chứng minh:
  `mcp__supabase_lab_management/tuuqgpzgollcerqqszjr`.
- Story evidence ghi local tests/schema validation pass.
- Story evidence ghi live post-migration proof:
  - `public.sample_result_groups` tồn tại;
  - RLS enabled;
  - RPC signature mới tồn tại;
  - backfill/fallback có dữ liệu hoặc lý do không có fixture;
  - không dùng namespace generic.
