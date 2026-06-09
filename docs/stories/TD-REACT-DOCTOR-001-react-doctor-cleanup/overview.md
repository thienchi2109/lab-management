# TD-REACT-DOCTOR-001 React Doctor Warning Cleanup

## Status

implemented

## Lane

normal

## Product Contract

Dọn 6 cảnh báo React Doctor non-blocking hiện tại trước US-010 mà không đổi
hành vi sản phẩm. Các thay đổi phải giữ nguyên hợp đồng sample grid, sample
image upload/delete, và result summary hiện có.

## Relevant Product Docs

- `docs/FEATURE_INTAKE.md`
- `docs/TEST_MATRIX.md`
- `docs/ARCHITECTURE.md`

## Acceptance Criteria

- React Doctor full scan không còn cảnh báo hiện tại:
  `label-has-associated-control`, `async-parallel`,
  `js-set-map-lookups`, `server-sequential-independent-await`, và
  `js-tosorted-immutable`.
- Có RED tests trước production code cho các vùng bị cảnh báo.
- Các test tập trung của sample grid và sample images vẫn xanh.
- Không có Supabase write, migration, hoặc thay đổi hợp đồng dữ liệu.

## Design Notes

- Commands: `cd lab-kit-app && bun run react-doctor:verbose`
- UI surfaces: sample grid search controls.
- API: sample image delete route.
- Domain rules: giữ nguyên kiểm tra quyền và giới hạn số lượng ảnh.
- Tables: không thay đổi.

## Frontend, Reuse, And Caching Constraints

- Không thêm shared UI/helper mới nếu không cần.
- Giữ `DashboardDataTable` và các control hiện có.
- Không thêm client cache hoặc thư viện mới.
