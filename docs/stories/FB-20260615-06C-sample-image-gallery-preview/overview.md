# FB-20260615-06C - Gallery ảnh mẫu và preview lớn

## Trạng thái

planned

## Lane

normal

## Parent

`FB-20260615-06` - Gallery ảnh kết quả và giới hạn 20 ảnh.

## Depends On

- `FB-20260615-06A` cho limit 20.
- `FB-20260615-06B` cho upload nhiều file và Viewer read-only controls.

## Intake

- Input type: Slice từ `FB-20260615-06`.
- Risk flags: Frontend/UI, Existing behavior, Weak proof.
- Lý do normal: slice này chủ yếu đổi presentation và browser workflow sau khi
  data/upload contract đã được khóa ở `FB-06A/06B`.

## Product Contract

- `docs/stories/FB-20260615-05-sample-result-detail-layout/overview.md` - thứ tự
  summary/results/images trong result detail.
- `docs/stories/FB-20260615-08-result-context-preserving-viewer/overview.md` -
  result viewer không làm mất context danh sách mẫu.
- `docs/stories/FB-20260615-06B-sample-image-multi-upload/overview.md` - upload
  nhiều file.

## Current Behavior

Image panel hiển thị ảnh nhưng chưa có gallery preview lớn với next/previous.
Nhiều ảnh có thể làm thumbnail/control chiếm chỗ trên mobile.

## Target Behavior

- Thumbnail grid responsive theo số ảnh.
- Khi nhiều ảnh, thumbnail nhỏ hơn và controls gọn ở một góc khi phù hợp.
- Bấm ảnh mở preview lớn.
- Preview có next/previous và close.
- Viewer chỉ xem ảnh, không upload/delete.
- Không phá context-preserving result viewer từ `FB-08`.

## Acceptance Criteria

- Gallery thumbnails không gây overflow trên mobile/desktop.
- Lightbox/preview mở đúng ảnh được chọn.
- Next/previous hoạt động trong cùng mẫu và xử lý đầu/cuối danh sách.
- Keyboard/accessible labels đủ cho close/next/previous/delete icon.
- Browser proof xác nhận không mất context danh sách mẫu khi mở/đóng viewer.

## Non-Goals

- Không đổi upload queue.
- Không đổi DB/API/Cloudinary behavior.
- Không thêm chỉnh sửa ảnh nâng cao.
