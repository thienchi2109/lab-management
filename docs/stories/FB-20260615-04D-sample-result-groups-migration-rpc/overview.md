# FB-20260615-04D - Migration và RPC cho sample_result_groups

## Trạng thái

planned

## Lane

high-risk

## Parent

FB-20260615-04 - Mẫu hỗ trợ nhiều nhóm chỉ tiêu.

## Scope

- Forward-only migration tạo bảng `public.sample_result_groups` (sample_id,
  result_group_id, organization_id, created_at) với PK kép, FK tới
  `samples`/`result_groups`, index theo sample/group, RLS theo tenant.
- Backfill: với mẫu hiện có, copy nhóm suy từ `result_template_metrics` của
  active template; nếu không suy được, copy tất cả nhóm active.
- Mở rộng `create_sample_metadata_with_code` thêm `p_result_group_ids uuid[]`,
  insert song hành vào bảng nối.
- Cập nhật `save_sample_results_with_audit`: nguồn group whitelist là bảng nối
  thay cho template metrics.
- Audit event payload thêm `resultGroupIds` (chỉ field name, không leak data
  vào audit).

## Acceptance Criteria

- Live MCP `mcp__supabase_lab_management/tuuqgpzgollcerqqszjr` áp dụng migration
  bằng `apply_migration` sau khi đã chứng minh không có write nào đụng vào
  schema cần migrate.
- Schema-contract tests phản ánh RPC mới.
- Không phá rãnh hiện có: mẫu cũ vẫn xem/nhập được kết quả.

## Validation

- `cd lab-kit-app && bun run test --run lib/sample-metadata lib/sample-results`
- `node scripts/validate-supabase-schema.mjs`
- Live read-only proof trước migration; live read-only proof sau migration để
  xác nhận bảng mới và RPC mới.

## Dependencies

- 04A (model) đã merged, dùng làm hợp đồng input cho RPC.

## Out of Scope

- Sample grid filter UI, result entry loader, form chọn nhóm. Sẽ được làm trong
  04B, 04C.
