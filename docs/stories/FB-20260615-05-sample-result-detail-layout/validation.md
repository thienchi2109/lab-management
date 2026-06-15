# Validation

## Proof Strategy

Story hoàn tất khi tests và browser proof xác nhận thứ tự layout mới trên
desktop/mobile, đồng thời save result và Viewer read-only không đổi.

## Test Plan

| Layer | Cases |
| --- | --- |
| Component | Thứ tự summary -> results -> images, sample summary fields, read-only state. |
| Integration | Save result vẫn gọi request hiện có. |
| Browser | Desktop/mobile không overflow, image panel ở cuối, save action dùng được. |
| Platform | Typecheck, React Doctor diff, format check. |

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.

