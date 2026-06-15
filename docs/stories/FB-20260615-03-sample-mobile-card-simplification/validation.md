# Validation

## Proof Strategy

Story hoàn tất khi render tests chứng minh card mobile mới và browser proof xác
nhận mật độ hiển thị không còn quá thưa.

## Test Plan

| Layer | Cases |
| --- | --- |
| Component | Mobile card fields, absence của mã mẫu, absence của column controls. |
| Browser | Mobile 390px: card không overflow, action dễ chạm, mật độ gần mục tiêu 4 mẫu/màn hình. |
| Platform | Typecheck, React Doctor diff, format check. |

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.

