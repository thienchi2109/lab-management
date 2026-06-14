# ISSUE-12 - Samples CRUD và xoá mềm an toàn

## Current Behavior

Backlog #12 ghi nhận trang Samples còn thiếu vòng đời CRUD đầy đủ cho mẫu xét
nghiệm. Luồng tạo mẫu đã được sửa ở backlog trước, luồng sửa mẫu hiện dùng
side sheet qua shared primitive `components/ui/overlay-frame`, và thao tác nhập
kết quả vẫn đi qua trang kết quả mẫu riêng.

Trang Samples chưa có luồng xem chi tiết mẫu rõ ràng và chưa có thao tác xoá
mẫu. Live schema hiện chưa có cột xoá mềm trên `public.samples`. Nếu xoá cứng,
Postgres sẽ cascade sang `sample_results`, `sample_group_conclusions` và
`sample_images`, làm mất dữ liệu xét nghiệm, kết luận và metadata ảnh. Đây là
rủi ro dữ liệu, không nên xử lý như một nút xoá UI đơn giản.

## Target Behavior

Hoàn thiện CRUD mẫu theo hướng bảo toàn dữ liệu:

- Người dùng có quyền đọc xem chi tiết mẫu từ trang Samples bằng side sheet
  dùng shared overlay primitive.
- Admin và Editor tiếp tục sửa metadata mẫu bằng side sheet hiện có.
- Chỉ Admin được xoá mẫu theo mặc định, bám theo `docs/product/roles-permissions.md`.
- Xoá mẫu là xoá mềm, không xoá cứng hàng `samples` và không cascade mất
  `sample_results`, `sample_group_conclusions` hoặc `sample_images`.
- Chức năng xoá ảnh đã upload được giữ nguyên như command riêng của luồng ảnh
  mẫu; soft-delete mẫu không tự xoá ảnh Cloudinary hoặc metadata ảnh.
- Danh sách Samples mặc định ẩn mẫu đã xoá mềm.
- Thao tác xoá ghi audit event an toàn, không lưu tràn dữ liệu nhạy cảm.

## Affected Users

- Admin: xem, sửa và xoá mềm mẫu.
- Editor: xem và sửa mẫu, không xoá mẫu theo mặc định.
- Viewer: chỉ xem mẫu và dữ liệu liên quan.
- Agent triển khai sau: cần story này làm boundary trước khi viết migration,
  server action, UI và tests.

## Affected Product Docs

- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`
- `docs/stories/US-006-sample-metadata-crud/*`
- `docs/stories/ISSUE-19-global-ui-primitives-branding/*`

## Non-Goals

- Không triển khai code trong lượt tạo story packet này.
- Không apply migration trong lượt tạo story packet này.
- Không xoá cứng mẫu, kết quả, kết luận hoặc ảnh mẫu.
- Không thay đổi contract upload/xoá ảnh đã upload. Ảnh chỉ bị xoá khi người
  dùng gọi thao tác xoá ảnh riêng và quyền hiện có cho phép.
- Không thêm cơ chế khôi phục mẫu đã xoá mềm trong scope đầu tiên.
- Không thay đổi luồng nhập kết quả ngoài việc chặn hoặc ẩn mẫu đã xoá mềm.
- Không mở rộng quyền xoá cho Editor nếu chưa có quyết định sản phẩm riêng.
