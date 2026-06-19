# FB-20260615-06B - Upload nhiều ảnh mẫu theo hàng đợi

## Trạng thái

implemented

## Lane

high-risk

## Parent

`FB-20260615-06` - Gallery ảnh kết quả và giới hạn 20 ảnh.

## Depends On

`FB-20260615-06A` phải xác nhận hợp đồng limit 20 và live DB/RPC trước khi
slice này mở rộng upload.

## Intake

- Input type: Slice từ `FB-20260615-06`.
- Risk flags: Frontend/UI, Public contracts, External systems, Audit/security,
  Existing behavior.
- Lý do high-risk: upload nhiều file chạm Cloudinary signed upload flow, API
  metadata, audit và provider cleanup khi delete.

## Product Contract

- `docs/product/api-contract.md` - upload/delete image API behavior.
- `docs/stories/US-008-cloudinary-sample-image-upload/overview.md` - signed
  upload hiện tại.
- `docs/stories/FB-20260615-06A-sample-image-limit-contract/overview.md` -
  limit contract.

## Current Behavior

`SampleImagesPanel` chỉ lấy `files?.[0]`, upload một ảnh mỗi lần. Giới hạn slot
phụ thuộc logic hiện có và chưa có queue nhiều file.

## Target Behavior

- Input `Thư viện` hỗ trợ `multiple`.
- Upload nhiều ảnh xử lý tuần tự hoặc bằng queue rõ ràng.
- Không upload vượt số slot còn lại theo limit 20 từ `FB-06A`.
- Lỗi upload được gắn theo file hoặc tổng hợp rõ ràng, không làm pending treo.
- Delete ảnh vẫn giữ audit payload và cleanup provider như hiện tại.

## Acceptance Criteria

- Component tests chứng minh input thư viện có `multiple`.
- Queue chỉ upload số file hợp lệ theo slot còn lại hoặc chặn toàn bộ bằng
  policy đã chọn và được test.
- Một file fail không làm mất trạng thái các file còn lại.
- Delete audit/provider cleanup không regression.
- Không log secret, signature hoặc provider response nhạy cảm.

## Non-Goals

- Không thêm lightbox/preview qua lại.
- Không đổi provider Cloudinary.
- Không thay đổi quyền Admin/Editor/Viewer.
