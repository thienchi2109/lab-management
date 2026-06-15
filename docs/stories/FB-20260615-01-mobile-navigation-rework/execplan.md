# Exec Plan

## Goal

Đổi điều hướng mobile theo phản hồi khách hàng, hợp nhất dashboard overview vào
`Báo cáo` và không làm mất đường truy cập các module hiện có.

## TDD Flow

1. RED: thêm/cập nhật test bottom nav để chứng minh `Tổng quan` không còn xuất
   hiện, `Mẫu`, `Báo cáo`, `Kho KIT`, `Thêm` xuất hiện và không có nút floating
   `Thêm mẫu`.
2. RED: thêm/cập nhật test topbar để chứng minh action `Thêm mẫu` vẫn còn.
3. GREEN: chỉnh `navigation-items` và `bottom-nav` theo contract mới.
4. RED: thêm/cập nhật test cho route/default link để chứng minh internal entry
   không còn trỏ về `/dashboard`.
5. GREEN: chuyển dashboard overview vào `/dashboard/analytics` và xóa
   `app/dashboard/page.tsx`.
6. GREEN: đổi các internal link/default redirect còn trỏ `/dashboard` sang
   `/dashboard/analytics`.
7. REFACTOR: giữ logic active state và menu phụ nhỏ, không tạo navigation
   primitive mới nếu shared shell hiện có đủ dùng.

## Stop Conditions

- Dừng nếu việc chuyển dashboard vào `Báo cáo` đòi đổi API analytics hoặc đổi
  dữ liệu báo cáo ngoài việc compose lại UI/server reads hiện có.
- Dừng nếu role-based nav hiện có không đủ thông tin để phân quyền menu `Thêm`.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- components/layout/bottom-nav.test.tsx components/layout/sample-create-action.test.tsx
cd lab-kit-app && bun run test -- app/dashboard/analytics
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```
