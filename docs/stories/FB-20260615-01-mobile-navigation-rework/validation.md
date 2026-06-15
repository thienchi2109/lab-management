# Validation

## Proof Strategy

Story hoàn tất khi navigation mobile mới có test coverage, route shell không có
link chết và browser proof xác nhận không có overlap bottom nav trên mobile.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit/Component | Bottom nav labels, menu `Thêm`, absence của floating `+`, active state. |
| Integration | Topbar vẫn dispatch được create sample request. |
| Browser | Mobile viewport xác nhận 4 tab chính, không overlap nội dung, `Thêm` mở menu phụ. |
| Platform | Typecheck, React Doctor diff, docstring nếu có export đổi. |

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.

