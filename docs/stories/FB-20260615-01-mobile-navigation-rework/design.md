# Design

## Direction

Giữ dashboard shell hiện có, chỉ thay đổi cấu trúc navigation mobile và mapping
label. `Báo cáo` trở thành điểm vào cho phần dashboard/report; `Thêm` là menu
phụ, không phải hành động tạo mẫu.

## Interface Contract

- `mobileNavItems` có thứ tự chính: `Mẫu`, `Báo cáo`, `Kho KIT`, `Thêm`.
- `Thêm` phải có accessible label rõ và mở menu phụ.
- `+ Thêm mẫu` là action ở topbar/header; không còn nút floating giữa bottom
  nav.
- Route `/dashboard` cần được quyết định trong implementation: hoặc redirect
  sang `/dashboard/analytics`, hoặc giữ route nhưng không hiện trong nav.

## Component Scope

- `lab-kit-app/components/layout/navigation-items.ts`
- `lab-kit-app/components/layout/bottom-nav.tsx`
- `lab-kit-app/components/layout/topbar.tsx`
- Tests layout/navigation liên quan.

## Error Handling

Nếu một mục phụ không khả dụng theo quyền, menu `Thêm` phải giữ hành vi hiện có:
ẩn hoặc chặn theo role, không tạo dead link.

## Implementation Notes

Trước implementation, chạy Code Review Graph/GitNexus impact cho các component
layout vì đây là shell dùng toàn app.

