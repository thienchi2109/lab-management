# FB-20260615-04C - Result entry tải theo sample_result_groups

## Trạng thái

planned

## Lane

high-risk

## Parent

FB-20260615-04 - Mẫu hỗ trợ nhiều nhóm chỉ tiêu.

## Scope

- `createSupabaseSampleResultsPort.getTemplateForSample` đọc nhóm từ bảng nối
  `sample_result_groups` thay cho map theo `sample_type` template.
- Fallback: nếu mẫu cũ chưa có bản ghi join, dùng nhóm suy ra từ
  `sample_results` đã nhập, hoặc tất cả nhóm active còn lại.
- Save flow giữ nguyên RPC `save_sample_results_with_audit` nhưng group
  whitelist phải khớp danh sách nhóm chọn cho mẫu.

## Acceptance Criteria

- Mẫu có `sample_result_groups` chỉ thấy đúng nhóm/chỉ tiêu đã chọn khi nhập
  kết quả.
- Mẫu cũ không bị mất khả năng nhập/xem kết quả.
- RPC từ chối ghi kết quả thuộc nhóm không nằm trong selection.

## Validation

- `cd lab-kit-app && bun run test --run lib/sample-results
  app/dashboard/samples/[sampleId]/results`
- `bun run typecheck && bun run react-doctor:diff`
- Live smoke: tạo mẫu mới với 2 nhóm, nhập kết quả, xác nhận chỉ ghi đúng nhóm.

## Dependencies

- 04D bắt buộc trước (bảng nối + RPC contract).

## Out of Scope

- Migration/RPC, grid filter, form UI tạo/sửa.
