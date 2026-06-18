# Validation

## Proof Strategy

Chứng minh bằng regression tests và browser proof rằng workflow xem kết quả giữ
nguyên context danh sách mẫu, trong khi route kết quả trực tiếp vẫn dùng được.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit/Component | Trigger `Xem kết quả` mở viewer, tab/segmented controls render đúng, close không reset state cục bộ. |
| Integration | Danh sách mẫu giữ filter/search/sort/page sau khi mở và đóng viewer; deep link route kết quả vẫn hoạt động. |
| Behavior | Save result vẫn gọi request hiện có; Viewer vẫn read-only. |
| Browser | Desktop/mobile không overflow; focus trap, close button, Escape/back behavior hoạt động dự đoán được. |
| Platform | Typecheck, React Doctor diff, docstring check nếu có named export mới. |

## Acceptance Evidence

- Harness story verify pass.
- Screenshot hoặc browser notes cho mobile viewer.
- Test output cho preserve-context và read-only/edit regression.
- Ghi rõ route kết quả hiện tại còn hoạt động hay được giữ làm fallback.
