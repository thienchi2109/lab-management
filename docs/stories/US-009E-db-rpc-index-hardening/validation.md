# Validation

## Proof Strategy

US-009E được closeout theo hướng conditional no-op sau US-009D. Proof không
phải là migration pass, mà là bằng chứng đọc cho thấy chưa cần DB/RPC/index
hardening ở thời điểm hiện tại.

Proof bắt buộc:

- namespace đúng `mcp__supabase_lab_management`;
- project-ref đúng `tuuqgpzgollcerqqszjr`;
- migration history được đọc;
- target tables/functions/indexes được nêu rõ;
- performance advisor được đọc;
- representative `EXPLAIN` không chứng minh cần hardening;
- không sửa migration đã apply.

## Test Plan

- Không chạy app tests vì không đổi runtime code.
- Không chạy schema migration validation vì không tạo migration.
- Dùng live read-only proof để chứng minh không cần DB write.

## Fixtures

Không tạo fixture mới. Live DB hiện có đủ dữ liệu tối thiểu để xác nhận query
path hiện tại không bị lỗi và chưa đủ lớn để justify index/RPC speculative.

## Commands

Closeout hiện tại:

```bash
scripts/bin/harness-cli story update --id US-009E --status implemented --integration 1 --platform 1
scripts/bin/harness-cli story verify US-009E
```

Nếu mở lại để apply DB change, phải chạy thêm Supabase advisors và focused app
tests phụ thuộc sau migration.

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- Khảo sát sau khi US-009D merge xác nhận đúng namespace
  `mcp__supabase_lab_management`, project-ref `tuuqgpzgollcerqqszjr`, URL
  `https://tuuqgpzgollcerqqszjr.supabase.co`.
- Live migration history đọc bằng `list_migrations`; migration cuối là
  `20260607160012_sample_image_rpc_max_limit_guard`.
- Không có RPC `sample_grid_*` trong live DB; các RPC hiện có chỉ thuộc result
  configuration, sample image, và sample result audit flow.
- Live row count còn nhỏ: `samples` 11, `sample_results` 1,
  `sample_group_conclusions` 1.
- Live index inventory có các index grid chính:
  `samples_org_status_received_idx`, `samples_org_billing_idx`,
  `sample_results_sample_idx`, `sample_group_conclusions_sample_idx`, cùng các
  index FK/organization hiện hữu.
- Performance advisor chỉ báo unused indexes, không báo missing index cho data
  grid.
- Representative `EXPLAIN` cho page query dùng `samples_org_billing_idx`; result
  summary query dùng index hiện có hoặc bitmap path trên các bảng nhỏ.
- Không tạo migration/RPC/index vì chưa có benchmark, advisor finding, row
  count, hoặc query plan chứng minh cần hardening.
