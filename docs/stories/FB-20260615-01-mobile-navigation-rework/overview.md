# FB-20260615-01 - Điều hướng mobile theo phản hồi khách hàng

## Trạng thái

implemented

## Lane

high-risk

## Intake

- Input type: Change request từ phản hồi khách hàng ngày 2026-06-15.
- Risk flags: Frontend/UI, Cross-platform, Public contracts, Existing behavior,
  Weak proof.
- Lý do high-risk: thay đổi cách người dùng mobile truy cập các route chính,
  bỏ `Tổng quan` khỏi điều hướng chính, hợp nhất nội dung dashboard overview
  vào `Báo cáo` và loại bỏ app surface `/dashboard`.

## Product Contract

- `docs/product/ui-contract.md` - dashboard navigation mobile/desktop.
- `docs/product/overview.md` - product surfaces.
- `docs/product/api-contract.md` - analytics/dashboard surface nếu route
  `Báo cáo` cần chứa dashboard.

## Current Behavior

Bottom nav mobile hiện có `Tổng quan`, `Mẫu`, `Báo cáo`, nút nổi `+ Thêm mẫu`
ở giữa và menu `Thêm` cho các mục còn lại. Route `/dashboard` đang render nội
dung dashboard overview riêng, còn `/dashboard/analytics` render báo cáo pivot.
Desktop topbar vẫn có `Thêm mẫu`.

## Target Behavior

- Bỏ hẳn `Tổng quan` khỏi bottom nav mobile.
- Hợp nhất nội dung dashboard/tổng quan vào tab `Báo cáo`.
- Xóa app surface `/dashboard`; các entry nội bộ mặc định phải chuyển sang
  `/dashboard/analytics`.
- Bottom nav mobile chính gồm `Mẫu`, `Báo cáo`, `Kho KIT`, `Thêm`.
- `Thêm` mở các mục phụ còn lại như quản lý tài khoản, cấu hình chỉ tiêu và
  cài đặt.
- Bỏ nút `+` nổi ở bottom nav.
- Vẫn giữ nút `+ Thêm mẫu` ở góc trên bên phải khi route/shell cho phép.

## Acceptance Criteria

- Mobile bottom nav không còn item `Tổng quan`.
- Mobile bottom nav hiển thị rõ 4 item: `Mẫu`, `Báo cáo`, `Kho KIT`, `Thêm`.
- Không còn primary floating `+` ở thanh bottom nav.
- `/dashboard/analytics` hiển thị cả nội dung overview trước đây và báo cáo
  pivot hiện có.
- Repo không còn internal link/default redirect trỏ về `/dashboard`.
- Người dùng vẫn có đường vào thao tác `Thêm mẫu` từ topbar/header action.
- Các mục quản trị/phụ vẫn truy cập được qua `Thêm`.
- Desktop navigation không bị đổi ngoài phạm vi đã nêu.

## Non-Goals

- Không thiết kế lại toàn bộ dashboard analytics.
- Không đổi quyền truy cập của Admin/Editor/Viewer.
- Không đổi API analytics hoặc dữ liệu báo cáo.
