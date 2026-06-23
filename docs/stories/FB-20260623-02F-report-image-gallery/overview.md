# FB-20260623-02F - Gallery ảnh báo cáo cho Viewer

## Current Behavior

Ứng dụng đã có upload ảnh minh chứng theo từng mẫu qua Cloudinary và
`sample_images`. Giới hạn hiện tại là 20 ảnh cho mỗi mẫu, mỗi ảnh không quá
5 MB. Viewer có thể xem ảnh minh chứng theo mẫu, nhưng không có gallery ảnh báo
cáo chung trong tab `Báo cáo`.

## Target Behavior

Admin có thể import/upload và xóa khoảng 20 ảnh báo cáo chung để Viewer xem
trong tab `Báo cáo`. Mỗi ảnh không vượt quá 5 MB. Viewer chỉ xem, không thêm
hoặc xóa ảnh.

## Affected Users

- Admin: upload/xóa ảnh báo cáo.
- Viewer: xem ảnh báo cáo đã được Admin đăng.
- Editor: giữ quyền hiện tại; nếu Editor cần upload ảnh báo cáo thì phải chốt
  thêm vì feedback chỉ nêu Admin.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/tech-stack.md`
- `docs/decisions/0007-cloudinary-media-upload-provider.md`

## Non-Goals

- Không thay đổi ảnh minh chứng theo từng mẫu.
- Không dùng `sample_images` để gắn ảnh báo cáo vào sample giả.
- Không đổi provider Cloudinary nếu provider hiện tại vẫn đáp ứng.
- Không cho Viewer upload hoặc xóa.
- Không xử lý OCR hoặc tự phân tích nội dung ảnh.
