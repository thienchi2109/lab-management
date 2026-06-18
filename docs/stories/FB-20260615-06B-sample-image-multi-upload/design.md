# Design

## Direction

Giữ signed upload flow hiện có, bọc phía client bằng upload queue có trạng thái
rõ ràng. Server/domain vẫn là nguồn chặn cuối cùng cho limit 20.

## Interface Contract

- `SampleImagesPanel` gọi helper queue thay vì tự xử lý toàn bộ file list.
- Input thư viện dùng `multiple`.
- UI hiển thị trạng thái ngắn gọn: đang tải, thành công, thất bại hoặc bị bỏ
  qua vì hết slot.
- Viewer không thấy upload/delete controls.

## Domain Contract

- Queue nhận danh sách file, số ảnh hiện có và limit từ `FB-06A`.
- Policy slot phải được chọn rõ trong implementation:
  - upload phần hợp lệ và bỏ qua phần vượt slot, hoặc
  - chặn toàn bộ batch khi vượt slot.
- API upload metadata vẫn kiểm tra limit và duplicate public ID.

## Required Discovery

Đọc code hiện có cho Cloudinary signed upload, image metadata API, delete API,
audit payload và tests trước khi sửa. Không thêm provider mới.

## Error Handling

Một file fail phải trả lỗi file đó hoặc thông báo tổng hợp, đồng thời dọn
pending state. Không log secret, signature hoặc raw provider response.
