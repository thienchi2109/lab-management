# FB-20260615-04B - Sample grid lọc theo nhiều nhóm chỉ tiêu

## Trạng thái

planned

## Lane

normal

## Parent

FB-20260615-04 - Mẫu hỗ trợ nhiều nhóm chỉ tiêu.

## Scope

- `parseSampleGridQuery` whitelist `resultGroupIds[]` (UUID, max N, dedupe).
- `SampleGridFilters` mở rộng `resultGroupIds`.
- Server adapter dùng bảng nối `sample_result_groups` để lọc sample IDs trước
  khi đọc trang.
- Filter chip hiển thị nhóm chỉ tiêu đã chọn.
- Tests focused cho query parser và server adapter.

## Acceptance Criteria

- URL `?resultGroupIds=uuid&resultGroupIds=uuid` đi vào filter, bỏ giá trị
  không hợp lệ.
- Server query lọc đúng theo bảng nối, không leak tenant.
- Filter UI cho phép chọn/xóa nhóm chỉ tiêu, giữ trạng thái URL.

## Validation

- `cd lab-kit-app && bun run test --run lib/sample-grid app/dashboard/samples`
- `bun run typecheck && bun run react-doctor:diff`

## Dependencies

- 04D phải xong trước hoặc song song để có bảng `sample_result_groups`.

## Out of Scope

- Sample-results loader, sample-metadata create/edit form, migration/RPC.
