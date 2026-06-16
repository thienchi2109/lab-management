# FB-20260615-04A - Mẫu nhiều nhóm chỉ tiêu - model slice

## Trạng thái

implemented

## Lane

normal

## Parent

FB-20260615-04 - Mẫu hỗ trợ nhiều nhóm chỉ tiêu.

## Scope

- Schema sample-metadata thêm `resultGroupIds` bắt buộc với UUID hợp lệ và
  dedupe.
- Operations chuyền `resultGroupIds` vào `referencesBelongToOrganization` và
  audit field-name list.
- Thông báo lỗi tiếng Việt cho `resultGroupIds`.

## Acceptance Criteria

- `parseCreateSampleInput` và `parseUpdateSampleInput` reject input thiếu hoặc
  không hợp lệ `resultGroupIds`.
- Audit `submittedFields`/`updatedFields` bao gồm `resultGroupIds`, không lộ
  giá trị nội dung.
- Tests focused `lib/sample-metadata` xanh.

## Validation

- `cd lab-kit-app && bun run test --run lib/sample-metadata` chạy 5 file / 22
  test pass tại commit 377309a trên branch
  feature/fb-20260615-04-multi-result-groups.

## Out of Scope

- UI form, server adapter, grid filter, sample-results loader, migration, RPC.
  Các phần này thuộc 04B, 04C, 04D, 04E.
