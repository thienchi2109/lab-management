# US-016B - Polish dashboard overview

## Trạng thái

implemented

## Lane

normal

## Intake

- Intake: Harness #29.
- Type: Change request.
- Risk flags: Frontend/UI, Existing behavior, Weak proof.
- Reason: story chỉ polish route `/dashboard`; không đổi auth, RBAC, SQL,
  analytics read ports, API contract, server-state strategy hoặc dashboard
  shell.

## Product Contract

Polish `/dashboard` để dashboard overview dễ quét hơn cho dữ liệu mẫu, KIT, PCR
và mẫu gần đây. Không đổi analytics read ports, query contract hoặc role access.

## Current Behavior

US-010B đã đưa `/dashboard` sang dữ liệu thật, gồm cards, trend, PCR metrics và
recent samples. Trang cần một pass polish để thống nhất hierarchy, density, số
liệu, spacing và trạng thái ít dữ liệu.

US-016B đã áp dụng polish có chọn lọc từ Stitch reference: giữ shell và dữ liệu
repo hiện tại, bỏ greeting/CTA giả, dùng hierarchy clinical/data-first, tabular
numbers, low-data states và mobile recent-sample cards qua shared
`DashboardDataTable`.

## Current Dashboard Design Description

Dashboard hiện tại là một màn hình vận hành nội bộ, không có sidebar. Shell dùng
`Topbar` trên desktop, `BottomNav` trên mobile/tablet và nền `zinc-50/50`
trong `main`. Nội dung route là một stack dọc với gap trung bình:
`DashboardHero`, `DashboardStatsGrid`, rồi `DashboardMainGrid`.

Hero hiện tại rất đơn giản: bên trái là lời chào hard-code
`Xin chào, Nguyễn Văn A 👋` và một câu mô tả ngắn; bên phải là hai CTA nhỏ:
`Xuất báo cáo ngày` và `Nhập kết quả mới`. Cảm giác hiện tại vẫn giống
scaffold vì greeting không lấy từ session, dùng emoji trong màn hình nghiệp vụ,
và nút export chưa có target rõ trong story này.

Stats grid có bốn card bằng nhau, mỗi card là một surface shadcn `Card` với
icon Lucide trong ô bo góc, label nhỏ, số liệu lớn và detail rất nhỏ. Màu nhấn
đang trộn `primary`, `secondary`, `destructive`, xanh dương, emerald và amber.
Các số liệu chưa khóa tabular numbers nên nhịp số chưa thật chắc cho dashboard.

Khu chính có một grid desktop ba cột: trend card chiếm hai cột, PCR metric card
chiếm một cột. Trend card là bar chart custom 7 ngày, có gridline mờ, legend
`Tổng mẫu` và `Dương tính`, tooltip hover chỉ hiện số mẫu. PCR metric card là
danh sách progress bar theo chỉ tiêu, có empty text khi không có dữ liệu PCR.

Recent samples là một card table thủ công với `overflow-x-auto`, header chữ hoa,
badge trạng thái và link `Xem tất cả`. Trên mobile, table vẫn là bảng ngang có
scroll thay vì card/stack theo tinh thần mobile-first của UI contract. Empty
state hiện chỉ là một dòng chữ trong table, dễ nhìn như thiếu dữ liệu hoặc layout
chưa hoàn thiện.

Tóm lại, trang đang đúng chức năng nhưng yếu về hierarchy, density, màu sắc,
mobile scan, low-data state và tính nhất quán với polish login sau US-016A.

## Design Read

Reading this as: dashboard vận hành nội bộ cho người dùng phòng lab, với ngôn
ngữ clinical, yên tĩnh, utilitarian và data-first; leaning toward Tailwind +
shadcn hiện có, typography/tabular-number polish, restrained motion, không
marketing hero và không decorative gradient.

## Acceptance Criteria

- Metric cards và trend có hierarchy rõ, số liệu dùng tabular numbers.
- Recent samples dễ scan trên desktop và mobile, không tràn ngang.
- Loading/empty/error hoặc low-data states không nhìn như khoảng trắng lỗi.
- Header/shell hiện tại được giữ; không thêm sidebar.
- Viewer vẫn chỉ đọc, không thấy CTA chỉnh sửa sai quyền.
- Không đổi dữ liệu trả về từ analytics dashboard read port.
- Copy visible dùng tiếng Việt có dấu đầy đủ và giọng nghiệp vụ trực tiếp.
- Không còn CTA inert hoặc gây hiểu nhầm nếu action chưa được story này hỗ trợ.

## Design Notes

- Dùng dashboard tone nghiêm túc, không marketing hero.
- Nếu thiết lập visual language chung, ghi rõ token/spacing dùng lại được nhưng
  không refactor shared primitives khi chưa cần.
- Ưu tiên cải thiện route components hiện có trước khi chạm shared components.
- Dùng Build Web Apps/frontend design workflow trước implementation: concept
  hoặc visual direction phải được duyệt, sau đó kiểm chứng desktop/mobile bằng
  browser screenshot.
- Dùng checklist taste/frontend như audit chống pattern generic: tránh card
  đồng đều không phân cấp, nhiều accent cạnh tranh, text quá nhỏ, số liệu không
  tabular, empty state chỉ là một dòng chữ.
- `design-taste-frontend` không phải skill chính cho dashboard theo mô tả của
  chính skill; chỉ dùng làm anti-slop checklist. Skill chính cho implementation
  là `redesign-existing-projects`, `frontend-app-builder`,
  `frontend-testing-debugging`, `responsive-design`, và React Doctor gate.

## Non-Goals

- Không thêm KPI mới hoặc chart mới.
- Không đổi API, database query, date range contract hoặc refresh strategy.
- Không thêm client cache mới.
- Không đổi dashboard shell sang sidebar.
- Không mở rộng US-016C samples grid, US-016D analytics/pivot hoặc US-016E user
  management.
