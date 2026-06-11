# Design

## Interface Contract

Dashboard overview nên là màn hình scan nhanh:

- top section nêu trạng thái tổng quan và thời điểm dữ liệu;
- metric cards phân cấp theo mức quan trọng thay vì mọi card giống nhau;
- trend/PCR/recent samples giữ cùng nhịp spacing;
- trạng thái ít dữ liệu vẫn cho biết app đang hoạt động bình thường.

## Visual Direction

Ngôn ngữ thiết kế nên là dashboard lab operations: sạch, có trật tự, ít trang
trí, đủ tương phản, ưu tiên đọc số và trạng thái. Tránh hero marketing,
decorative blob/gradient, badge thừa và motion nặng. Một màn hình tốt phải cho
người dùng hiểu nhanh: hôm nay/7 ngày qua có bao nhiêu mẫu, PCR có vấn đề gì,
KIT còn đủ không, và mẫu mới nào cần chú ý.

Hướng đề xuất cho agent UI:

- Giữ shell hiện tại: topbar desktop, bottom nav mobile/tablet, không sidebar.
- Biến hero thành summary header thực dụng: title theo ngữ cảnh, range dữ liệu,
  trạng thái cập nhật, một CTA chính thật sự có ích; bỏ hoặc thay greeting
  hard-code.
- Metric cards nên có hierarchy: tổng mẫu là card neo chính, trạng thái rủi ro
  PCR nổi bật nhưng không la hét, KIT và mẫu sạch là secondary.
- Số liệu dùng tabular numbers; label và detail đủ lớn để đọc trên laptop.
- Trend chart cần rõ baseline, label, tooltip/focus affordance và low-data copy.
- PCR metric list nên giải thích được tỷ lệ, có trạng thái không có dữ liệu và
  không phụ thuộc chỉ vào màu.
- Recent samples desktop có thể giữ table nếu scan tốt; mobile nên có card/list
  stack hoặc dùng shared table pattern có mobile treatment rõ.
- Empty state là một khối có tiêu đề, mô tả và đường đi tiếp theo phù hợp quyền,
  không chỉ một dòng text trong table.

## Current Weak Points To Address

- Greeting `Nguyễn Văn A` đang hard-code, không phản ánh session.
- Emoji trong heading nghiệp vụ làm tone kém nghiêm túc.
- Nút `Xuất báo cáo ngày` có thể tạo affordance giả nếu chưa có flow xuất báo
  cáo ở `/dashboard`.
- Các card có hình thức quá giống nhau, thiếu card chính/phụ.
- Màu semantic và accent đang phân tán: primary, secondary, destructive, blue,
  emerald, amber.
- Recent samples chưa dùng shared `DashboardDataTable`; nếu tiếp tục table
  riêng thì story phải giải thích vì sao route-level exception là đủ.
- Mobile table dựa vào horizontal scroll, chưa theo mobile-first card/accordion
  của `docs/product/ui-contract.md`.
- Empty/low-data state còn quá mỏng.

## Data Flow

Giữ Server Component/read-port flow hiện có. UI chỉ nhận view model đã typed và
render presentation.

Không đổi:

- `getDashboardOverviewPage()`;
- `DashboardOverviewData`;
- analytics query/date range contract;
- RBAC và redirect của `app/dashboard/layout.tsx`;
- server-state strategy.

Nếu cần copy display name từ session, xem đó là route/shell presentation input,
không đổi auth behavior.

## Component Scope

Ứng viên chính:

- `lab-kit-app/app/dashboard/_components/dashboard-page-content.tsx`
- `lab-kit-app/app/dashboard/_components/dashboard-hero.tsx`
- `lab-kit-app/app/dashboard/_components/dashboard-stats-grid.tsx`
- `lab-kit-app/app/dashboard/_components/dashboard-stat-card.tsx`
- `lab-kit-app/app/dashboard/_components/dashboard-main-grid.tsx`
- `lab-kit-app/app/dashboard/_components/dashboard-trend-card.tsx`
- `lab-kit-app/app/dashboard/_components/dashboard-metric-card.tsx`
- `lab-kit-app/app/dashboard/_components/dashboard-recent-samples-card.tsx`

Shared component edits chỉ được làm khi route-level component không đủ; trước đó
phải chạy code-deduplication và ghi blast radius.

## Testing Focus

Kiểm tra card hierarchy, empty/low-data branch, mobile stack và không phá
snapshot/expectation của dashboard data tests hiện tại.

Browser proof phải gồm desktop và mobile viewport, không Next.js error overlay,
không console error liên quan, không horizontal overflow ngoài vùng được thiết
kế chủ ý.
