# FB-20260615-04E - Form tạo/sửa mẫu chọn nhiều nhóm chỉ tiêu

## Trạng thái

implemented

## Lane

normal

**Depends on:** [FB-20260615-04D](../FB-20260615-04D-sample-result-groups-migration-rpc/overview.md)

## Parent

FB-20260615-04 - Mẫu hỗ trợ nhiều nhóm chỉ tiêu.

## Scope

- `CreateSampleDialog` và `EditSampleDialog` thêm trường `Nhóm chỉ tiêu` cho
  phép chọn nhiều `result_groups` đang active của tổ chức.
- Server actions `app/dashboard/samples/actions.ts` đọc `resultGroupIds[]` từ
  FormData, validate qua schema 04A và truyền vào port.
- `createSupabaseSampleMetadataPort.createSample` truyền `p_result_group_ids`
  vào RPC `create_sample_metadata_with_code`.
- `createSupabaseSampleMetadataPort.updateSample` đồng bộ bảng nối
  `sample_result_groups` cho mẫu hiện có (insert/delete tối thiểu trong cùng
  organization).
- Hiển thị field error tiếng Việt khi `resultGroupIds` rỗng hoặc không hợp lệ.
- Không thêm client cache mới; form lấy danh sách nhóm qua server boundary hiện
  có và invalidate bằng server action/revalidate path nếu dữ liệu mẫu đổi.

## Acceptance Criteria

- Admin/Editor mở modal Tạo mẫu, chọn nhiều nhóm chỉ tiêu, lưu thành công và
  bảng nối `sample_result_groups` được ghi đúng.
- Side sheet Cập nhật mẫu cho phép sửa danh sách nhóm chỉ tiêu, không làm mất
  kết quả đã nhập.
- Form hiển thị lỗi rõ ràng khi không chọn nhóm nào.
- Không thay đổi contract của các RPC khác hoặc audit policy đã có ở 04A.

## Validation

- `cd lab-kit-app && bun run test --run lib/sample-metadata app/dashboard/samples/_components app/dashboard/samples/actions.test.ts`
- `cd lab-kit-app && bun run typecheck && bun run react-doctor:diff`
- Live smoke (sau khi 04D applied): tạo mẫu mới với 2 nhóm, sửa lại còn 1
  nhóm, xác nhận bảng nối khớp.

## Acceptance Evidence

- 2026-06-17: RED tests fail đúng lý do thiếu metadata
  `resultGroupOptions/resultGroupIds`, thiếu checkbox `resultGroupIds` trong
  form tạo/sửa, và update adapter chưa đồng bộ `sample_result_groups`.
- 2026-06-17: Implemented form field `Nhóm chỉ tiêu` cho
  `CreateSampleDialog`/`EditSampleDialog`, metadata server nạp active
  `result_groups` và nested `sample_result_groups`, update adapter diff-sync
  insert/delete tối thiểu cho bảng nối theo contract 04D.
- 2026-06-17: `scripts/bin/harness-cli story verify FB-20260615-04E` pass:
  focused tests 10 files/39 tests, `typecheck`, `format:check`,
  `react-doctor:diff`, `docstring:check`, và schema validator pass.
- 2026-06-17: `cd lab-kit-app && bun run react-doctor` pass. Live smoke chưa
  chạy.

## Dependencies

- 04A merged: schema và operations contract resultGroupIds.
- 04D applied: bảng nối `sample_result_groups` và RPC mới.
- UI implementation phải dùng shared form/dialog/select primitives sẵn có; nếu
  cần helper dùng chung mới thì chạy `code-deduplication` trước khi thêm.

## Out of Scope

- Sample grid filter, result entry loader, migration/RPC. Các phần này thuộc
  04B, 04C, 04D.
