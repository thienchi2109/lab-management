# Design

## Direction

Giữ dashboard shell hiện có, thay đổi cấu trúc navigation mobile và hợp nhất
dashboard overview vào route `Báo cáo`. `Báo cáo` trở thành điểm vào duy nhất
cho phần tổng quan/report; `Thêm` là menu phụ, không phải hành động tạo mẫu.

## Interface Contract

- `mobileNavItems` có thứ tự chính: `Mẫu`, `Báo cáo`, `Kho KIT`, `Thêm`.
- `Thêm` phải có accessible label rõ và mở menu phụ.
- `+ Thêm mẫu` là action ở topbar/header; không còn nút floating giữa bottom
  nav.
- Route `/dashboard/analytics` hiển thị dashboard overview trước, rồi đến phần
  báo cáo pivot hiện có.
- Route index `/dashboard` không còn là app surface. Implementation phải xóa
  `app/dashboard/page.tsx` và đổi internal default entry sang
  `/dashboard/analytics` để tránh link chết nội bộ.

## Component Scope

- `lab-kit-app/components/layout/navigation-items.ts`
- `lab-kit-app/components/layout/bottom-nav.tsx`
- `lab-kit-app/components/layout/topbar.tsx`
- `lab-kit-app/app/dashboard/page.tsx`
- `lab-kit-app/app/dashboard/analytics/page.tsx`
- Dashboard overview components dưới `lab-kit-app/app/dashboard/_components/`
- Tests layout/navigation liên quan.

## Error Handling

Nếu một mục phụ không khả dụng theo quyền, menu `Thêm` phải giữ hành vi hiện có:
ẩn hoặc chặn theo role, không tạo dead link.

## Implementation Notes

Trước implementation, chạy Code Review Graph/GitNexus impact cho các component
layout vì đây là shell dùng toàn app.
