# ISSUE-12B - Samples bulk soft delete an toàn

## Current Behavior

Backlog #12 ban đầu gồm cả xem, sửa và xoá mẫu. Phần xoá mẫu được tách riêng
vì high-risk: live schema hiện chưa có xoá mềm trên `samples`, còn hard delete
có thể cascade sang `sample_results`, `sample_group_conclusions` và
`sample_images`.

Chức năng xoá ảnh đã upload đã là command riêng của domain ảnh mẫu. Story này
không thay thế hoặc gộp luồng xoá ảnh đó vào xoá mềm mẫu.

## Target Behavior

- Admin chọn một hoặc nhiều mẫu bằng shadcn `Checkbox`/table selection pattern.
- Admin xoá mềm hàng loạt sau global confirm dialog.
- Confirm dialog là global primitive UI dựa trên shadcn `AlertDialog`.
- Soft delete không hard delete `samples` và không cascade mất kết quả, kết
  luận hoặc ảnh mẫu.
- Soft delete không gọi Cloudinary deletion, không gọi
  `delete_sample_image_with_audit` và không xoá `sample_images`.
- Editor và Viewer không có quyền xoá mềm theo mặc định.
- Grid mặc định ẩn mẫu đã xoá mềm.

## Affected Users

- Admin: bulk soft delete mẫu.
- Editor: không xoá mềm mẫu.
- Viewer: không xoá mềm mẫu.
- Agent triển khai: phải xử lý schema, RLS/app role, audit, tests và browser
  verification như story high-risk.

## Affected Product Docs

- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`
- `docs/stories/ISSUE-12A-samples-view-edit-side-sheet/*`
- `docs/stories/US-008-cloudinary-sample-image-upload/*`

## Non-Goals

- Không triển khai xem/sửa side sheet; thuộc `ISSUE-12A`.
- Không xoá cứng mẫu, kết quả, kết luận hoặc ảnh mẫu.
- Không thay đổi contract upload/xoá ảnh đã upload.
- Không thêm khôi phục mẫu đã xoá mềm trong scope đầu tiên.
- Không mở rộng quyền xoá cho Editor.
