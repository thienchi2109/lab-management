# FB-20260615-06 - Gallery ảnh kết quả và giới hạn 20 ảnh

## Trạng thái

planned, đã tách slice

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

Image panel chỉ xử lý một file mỗi lần (`files?.[0]`). Sau 06A,
client/domain/API docs và live RPC đã dùng giới hạn 20 ảnh/mẫu.

## Target Behavior

- Giới hạn tối đa 20 ảnh/mẫu.
- `Thư viện` cho phép chọn và tải nhiều ảnh cùng lúc.
- `Chụp ảnh`, `Thư viện`, `Xóa` nằm gọn cạnh nhau một góc khi phù hợp.
- Nút edit/delete ảnh dùng icon nhỏ, có accessible label.
- Khi nhiều ảnh, thumbnail nhỏ hơn.
- Bấm từng ảnh mở preview lớn.
- Preview có nút qua/lại để xem ảnh khác cùng mẫu.

## Slice Plan

- `FB-20260615-06A` - Hợp đồng giới hạn 20 ảnh mẫu: khóa constant/domain/API
  copy, product docs và Supabase read proof.
- `FB-20260615-06B` - Upload nhiều ảnh mẫu theo hàng đợi: thêm input
  `multiple`, queue upload, slot enforcement, audit và provider cleanup
  regression.
- `FB-20260615-06C` - Gallery ảnh mẫu và preview lớn: thêm thumbnail grid,
  lightbox/preview, next/previous, Viewer read-only và browser proof.

Thứ tự mặc định là 06A -> 06B -> 06C. 06A đã nâng live DB/RPC bằng migration
forward-only `20260618141838_sample_image_limit_20`.

## Acceptance Criteria

- Các acceptance của parent được chứng minh qua 06A, 06B và 06C.
- 06A chứng minh client/domain/API/DB-RPC contract giới hạn 20 ảnh.
- 06B chứng minh upload nhiều ảnh, slot enforcement, delete audit và provider
  cleanup.
- 06C chứng minh gallery preview, Viewer read-only và browser no-overflow.

## Non-Goals

- Không đổi provider Cloudinary.
- Không thêm chỉnh sửa ảnh nâng cao.
- Không thay đổi quyền Admin/Editor/Viewer.
