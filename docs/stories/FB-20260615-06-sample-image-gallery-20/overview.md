# FB-20260615-06 - Gallery ảnh kết quả và giới hạn 20 ảnh

## Trạng thái

planned

## Lane

high-risk

## Intake

- Input type: Change request từ phản hồi khách hàng ngày 2026-06-15.
- Risk flags: Frontend/UI, Data model, Public contracts, External systems,
  Audit/security, Existing behavior, Weak proof.
- Lý do high-risk: tăng giới hạn ảnh từ 10 lên 20 có thể chạm client, domain,
  API, live DB/RPC và Cloudinary upload/delete behavior.

## Product Contract

- `docs/product/api-contract.md` - upload rules.
- `docs/product/data-model.md` - `sample_images`.
- `docs/stories/US-008-cloudinary-sample-image-upload/overview.md` - image
  upload hiện tại.

## Current Behavior

Image panel chỉ xử lý một file mỗi lần (`files?.[0]`) và giới hạn 10 ảnh/mẫu ở
client/domain. Story US-008 cũng document max 10 ảnh.

## Target Behavior

- Giới hạn tối đa 20 ảnh/mẫu.
- `Thư viện` cho phép chọn và tải nhiều ảnh cùng lúc.
- `Chụp ảnh`, `Thư viện`, `Xóa` nằm gọn cạnh nhau một góc khi phù hợp.
- Nút edit/delete ảnh dùng icon nhỏ, có accessible label.
- Khi nhiều ảnh, thumbnail nhỏ hơn.
- Bấm từng ảnh mở preview lớn.
- Preview có nút qua/lại để xem ảnh khác cùng mẫu.

## Acceptance Criteria

- Upload nhiều ảnh từ thư viện xử lý tuần tự hoặc có hàng đợi rõ ràng.
- Client, domain, API và DB/RPC cùng enforce tối đa 20 ảnh.
- Không upload vượt số slot còn lại.
- Delete ảnh vẫn audit và cleanup provider như hiện tại.
- Viewer chỉ xem ảnh, không upload/delete.
- Không log secret, signature hoặc provider response nhạy cảm.

## Non-Goals

- Không đổi provider Cloudinary.
- Không thêm chỉnh sửa ảnh nâng cao.
- Không thay đổi quyền Admin/Editor/Viewer.

