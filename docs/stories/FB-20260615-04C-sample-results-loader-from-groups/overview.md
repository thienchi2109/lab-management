# FB-20260615-04C - Result entry tải theo sample_result_groups

## Trạng thái

implemented

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

## Acceptance Evidence

- RED: `cd lab-kit-app && bun run test --run lib/sample-results/server.test.ts`
  fail vì loader vẫn trả cả nhóm chưa chọn.
- RED bổ sung: cùng command fail khi nhóm đã chọn có metric active nhưng
  `result_template_metrics` của sample type cũ không liệt kê metric đó.
- GREEN: `cd lab-kit-app && bun run test --run lib/sample-results/server.test.ts`
  pass với test chỉ trả metric thuộc `sample_result_groups` và lấy metric
  active trực tiếp từ nhóm đã chọn.
- Focused sample results/API: `cd lab-kit-app && bun run test --run
  lib/sample-results app/api/samples/[sampleId]/results/route.test.ts` pass
  5 files, 25 tests.
- Sample grid regression: `cd lab-kit-app && bun run test --run
  app/dashboard/samples/_components/sample-grid-result-group-filter.test.tsx
  app/dashboard/samples/_components/sample-grid-page-content.test.tsx
  lib/sample-grid` pass 9 files, 41 tests.
- Contract/type gates: `node scripts/validate-supabase-schema.mjs` pass,
  `cd lab-kit-app && bun run typecheck` pass.
- Quality gates: `cd lab-kit-app && bun run docstring:check` pass,
  `cd lab-kit-app && bun run react-doctor` pass.
- Live smoke chưa chạy trong slice này vì không thực hiện live write/UI 04E;
  loader đã được khóa bằng adapter tests và schema/RPC whitelist đã thuộc 04D.

## Dependencies

- 04D bắt buộc trước (bảng nối + RPC contract).

## Out of Scope

- Migration/RPC, grid filter, form UI tạo/sửa.
