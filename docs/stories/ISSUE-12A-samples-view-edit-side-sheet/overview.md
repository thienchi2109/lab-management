# ISSUE-12A - Samples xem và sửa bằng side sheet

## Current Behavior

Backlog #12 ban đầu gom cả xem, sửa và xoá mẫu. Scope đó quá lớn vì phần xoá
mẫu chạm schema, RLS, audit và rủi ro mất dữ liệu. Story này chỉ giữ phần xem
và sửa mẫu trên trang Samples.

Trang Samples hiện có bảng metadata mẫu và action cập nhật mở side sheet qua
shared `SideSheetFrame`. Luồng xem chi tiết mẫu chưa rõ ràng; người dùng phải
đọc trực tiếp trong row hoặc đi sang trang nhập kết quả.

## Target Behavior

- Người dùng có quyền đọc mở được side sheet xem chi tiết mẫu từ bảng Samples.
- Admin và Editor tiếp tục sửa metadata mẫu bằng side sheet hiện có.
- Viewer chỉ xem, không thấy hành động cập nhật.
- View/edit dùng shared overlay primitive từ `components/ui/overlay-frame`.
- Không có xoá mềm, multiple selection, bulk action, migration hoặc RLS change
  trong story này.

## Affected Users

- Admin: xem và sửa mẫu.
- Editor: xem và sửa mẫu.
- Viewer: xem mẫu.
- Agent triển khai: xử lý UI/action boundary nhỏ, không kéo theo DB delete.

## Affected Product Docs

- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`
- `docs/stories/US-006-sample-metadata-crud/*`
- `docs/stories/ISSUE-19-global-ui-primitives-branding/*`
- `docs/stories/ISSUE-12B-samples-bulk-soft-delete/*`

## Non-Goals

- Không thêm xoá mềm.
- Không thêm multiple selection hoặc bulk toolbar.
- Không tạo migration.
- Không thay đổi chức năng upload/xoá ảnh đã upload.
- Không đổi luồng nhập kết quả mẫu.
