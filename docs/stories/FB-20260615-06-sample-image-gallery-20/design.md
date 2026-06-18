# Design

## Direction

Giữ Cloudinary signed upload flow hiện có. Mở rộng client để nhận nhiều file,
nhưng domain/server vẫn là nguồn chặn giới hạn cuối cùng.

Parent story không nên implement trong một PR. Dùng ba slice sau để giới hạn
blast radius: 06A khóa limit contract, 06B mở rộng upload queue, 06C hoàn thiện
gallery preview.

## Interface Contract

- `SampleImagesPanel` hiển thị toolbar gọn với icon và text ngắn khi đủ chỗ.
- Library input dùng `multiple`.
- Upload nhiều file phải báo tiến trình/lỗi ngắn gọn.
- Thumbnail grid responsive theo số ảnh.
- Lightbox/preview có next/previous và close.

## Domain Contract

- `MAX_IMAGES_PER_SAMPLE = 20` phải thống nhất ở client copy, domain operation,
  tests và live DB/RPC nếu có.
- Khi chọn nhiều file hơn slot còn lại, chỉ upload phần hợp lệ hoặc chặn toàn bộ
  với thông báo rõ. Implementation phải chọn một policy và test policy đó.

## Slice Boundaries

- 06A không thêm UI upload nhiều file hoặc lightbox.
- 06B không đổi gallery preview hoặc result viewer context ngoài phần cần thiết
  cho upload/delete controls.
- 06C không đổi API, DB/RPC hoặc Cloudinary provider behavior.

## Required Discovery

Trước mọi Supabase write, chứng minh namespace `mcp__supabase_lab_management`,
project-ref `tuuqgpzgollcerqqszjr`, migration history và function/constraint
đang enforce giới hạn ảnh.

## Error Handling

Upload nhiều file phải có lỗi theo file hoặc thông báo tổng hợp, không để trạng
thái pending treo nếu một file fail.
