# Design

## Direction

Giữ `DashboardDataTable` làm surface chính nếu có thể. Nếu shared component
không hỗ trợ mật độ card mới, mở rộng bằng prop hẹp có default giữ hành vi cũ.

## Interface Contract

- `Mã mẫu` không render trong mobile card list.
- `Mã mẫu` vẫn render trong detail side sheet và result detail.
- Card dùng các label ngắn, tránh mô tả dài.
- Result group/Kết quả chung hiển thị dạng tóm tắt, không bung ma trận chỉ tiêu.

## Component Scope

- `lab-kit-app/components/dashboard/data-table.tsx`
- `lab-kit-app/components/ui/overlay-frame.tsx`
- `lab-kit-app/app/dashboard/samples/_components/sample-grid-filter-form.tsx`
- `lab-kit-app/app/dashboard/samples/_components/sample-grid-filter-params.ts`
- `lab-kit-app/app/dashboard/samples/_components/sample-grid-mobile-filter-sheet.tsx`
- `lab-kit-app/app/dashboard/samples/_components/sample-grid-table-section.tsx`
- `lab-kit-app/app/dashboard/samples/_components/sample-grid-mobile-card.tsx`
- `lab-kit-app/app/dashboard/samples/_components/sample-grid-status-badge.tsx`
- Tests `data-table` và `sample-grid-page-content`.
- Tests `overlay-frame` và `sample-grid-mobile-filter-sheet` cho bottom sheet.

## Error Handling

Nếu thiếu công ty/khách hàng/nhóm chỉ tiêu, card hiển thị trạng thái rỗng ngắn
gọn như `Chưa có`, không tạo khoảng trống lớn.

## Reuse Constraints

Trước khi thêm UI primitive mới, dùng workflow code-deduplication để kiểm tra
shared card/list patterns hiện có.

## Mobile Filter Follow-up

- Chọn Stitch MCP phương án 2: search-first toolbar, filter badge và bottom
  sheet khi cần lọc.
- Desktop/tablet giữ filter inline hiện tại.
- Mobile không render filter form mở sẵn trên trang chính.
