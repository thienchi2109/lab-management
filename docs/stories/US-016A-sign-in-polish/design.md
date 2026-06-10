# Design

## Interface Contract

Trang đăng nhập vẫn là một form tập trung. Polish chỉ thay đổi presentation và
states:

- vùng form có chiều rộng giới hạn, spacing ổn định trên mobile/desktop;
- label nằm trên input, không dùng placeholder thay label;
- error nằm gần form và không che input;
- pending state disable CTA và thể hiện tiến trình bằng text/surface rõ ràng;
- focus ring đạt tương phản.

## Implementation Boundary

Không đọc database trực tiếp từ component. Nếu cần thay đổi action/auth handling,
story phải dừng lại để mở story auth riêng vì đó là high-risk hard gate.

## Testing Focus

Tập trung vào invalid login, pending/disabled affordance, mobile layout và
không flash giao diện sai trạng thái.
