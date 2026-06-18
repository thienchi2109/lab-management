# Design

## Direction

Tập trung vào presentation sau khi data/upload contract ổn định. Tách
thumbnail grid và preview/lightbox thành component nhỏ để tránh
`sample-images-panel.tsx` vượt 350 dòng.

## Interface Contract

- Thumbnail là nút hoặc link có accessible label rõ.
- Preview có close, next và previous bằng icon button.
- Delete/edit controls vẫn nhỏ gọn và có label.
- Viewer mode chỉ render gallery/preview, không render upload/delete controls.

## Domain Contract

Không đổi domain/API. Slice này chỉ đọc danh sách ảnh đã có.

## Required Discovery

Đọc regression từ `FB-05` và `FB-08` trước khi sửa để giữ thứ tự detail layout
và context-preserving viewer.

## Error Handling

Nếu ảnh thiếu URL hoặc load fail, hiển thị fallback gọn trong thumbnail/preview
và không làm crash panel.
