# Exec Plan

## Goal

Đổi điều hướng mobile theo phản hồi khách hàng mà không làm mất đường truy cập
các module hiện có.

## TDD Flow

1. RED: thêm/cập nhật test bottom nav để chứng minh `Tổng quan` không còn xuất
   hiện, `Mẫu`, `Báo cáo`, `Kho KIT`, `Thêm` xuất hiện và không có nút floating
   `Thêm mẫu`.
2. RED: thêm/cập nhật test topbar để chứng minh action `Thêm mẫu` vẫn còn.
3. GREEN: chỉnh `navigation-items` và `bottom-nav` theo contract mới.
4. GREEN: xử lý route `/dashboard` nếu implementation chọn redirect hoặc giữ
   route không hiện nav.
5. REFACTOR: giữ logic active state và menu phụ nhỏ, không tạo navigation
   primitive mới nếu shared shell hiện có đủ dùng.

## Stop Conditions

- Dừng nếu việc chuyển dashboard vào `Báo cáo` đòi đổi product contract analytics
  rộng hơn route/navigation.
- Dừng nếu role-based nav hiện có không đủ thông tin để phân quyền menu `Thêm`.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- components/layout/bottom-nav.test.tsx components/layout/sample-create-action.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```

