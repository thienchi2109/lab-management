# FB-20260615-06A - Hợp đồng giới hạn 20 ảnh mẫu

## Trạng thái

implemented

## Lane

high-risk

## Parent

`FB-20260615-06` - Gallery ảnh kết quả và giới hạn 20 ảnh.

## Intake

- Input type: Slice từ `FB-20260615-06`.
- Risk flags: Data model, Public contracts, Audit/security, Existing behavior,
  Weak proof.
- Lý do high-risk: giới hạn ảnh phải thống nhất giữa client, domain, API và
  live DB/RPC trước khi mở rộng upload/gallery.

## Product Contract

- `docs/product/api-contract.md` - upload rules.
- `docs/product/data-model.md` - `sample_images`.
- `docs/stories/US-008-cloudinary-sample-image-upload/overview.md` - image
  upload hiện tại.
- `docs/stories/FB-20260615-06-sample-image-gallery-20/overview.md` - parent
  scope.

## Current Behavior

Image panel vẫn xử lý một file mỗi lần. Sau 06A, client/domain/API docs và
live RPC đã dùng giới hạn 20 ảnh/mẫu.

## Target Behavior

- `MAX_IMAGES_PER_SAMPLE = 20` là hợp đồng duy nhất cho ảnh mẫu.
- Client copy, domain validation, API behavior và product docs cùng dùng giới
  hạn 20.
- Có Supabase read proof cho namespace `mcp__supabase_lab_management`,
  project-ref `tuuqgpzgollcerqqszjr`, migration history và function/constraint
  liên quan.
- Live DB/RPC đã được nâng bằng migration forward-only
  `20260618141838_sample_image_limit_20`.

## Acceptance Criteria

- Unit/domain tests chứng minh limit 20 và không cho vượt slot.
- Product docs đã mô tả giới hạn 20 ảnh/mẫu.
- Supabase read proof ghi rõ live DB/RPC có hoặc không enforce giới hạn ảnh.
- Không thực hiện Supabase write nếu chưa chứng minh đúng namespace,
  project-ref, migration history và target function/constraint.

## Non-Goals

- Không thay đổi upload nhiều file.
- Không thêm lightbox/gallery preview.
- Không đổi Cloudinary provider hoặc quyền Admin/Editor/Viewer.
