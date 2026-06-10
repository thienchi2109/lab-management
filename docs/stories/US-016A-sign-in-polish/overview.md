# US-016A - Polish trang đăng nhập

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/login` để entry experience rõ ràng, đáng tin và responsive tốt hơn.
Không đổi auth route, credential contract, session behavior hoặc redirect
contract đã có.

## Current Behavior

`/login` đã cho phép đăng nhập username/password và hiển thị lỗi theo auth flow.
Trang còn cần polish về visual hierarchy, trạng thái pending/error, copy trợ
giúp và responsive layout để không nhìn như scaffold.

## Acceptance Criteria

- Form đăng nhập có hierarchy rõ: tiêu đề, mô tả ngắn, username, password, CTA
  và error state.
- Pending state của submit rõ ràng, không tạo double-submit affordance.
- Error message trực tiếp, không dùng giọng văn cảm thán hoặc mơ hồ.
- Mobile viewport không tràn ngang, CTA luôn dễ chạm.
- Keyboard focus visible trên input, CTA và link điều hướng nếu có.
- Anonymous-only behavior, redirect sau login và invalid login behavior giữ
  nguyên theo US-003.

## Design Notes

- Ưu tiên layout yên tĩnh, trust-first, không hero marketing.
- Không thêm hình minh họa nếu không có asset thật hoặc lý do sản phẩm rõ.
- Nếu cần chỉnh `Button`, `Input` hoặc form primitive, phải chuyển sang story
  shared-component hoặc ghi rõ blast radius trong story này.

## Non-Goals

- Không thêm forgot-password, reset-password hoặc SSO.
- Không đổi route `/api/auth/*`, cookie, session hoặc credential schema.
- Không đổi copy pháp lý ngoài phạm vi form đăng nhập.
