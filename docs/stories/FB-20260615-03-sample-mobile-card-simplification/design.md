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
- `lab-kit-app/app/dashboard/samples/_components/sample-grid-table-section.tsx`
- Tests `data-table` và `sample-grid-page-content`.

## Error Handling

Nếu thiếu công ty/khách hàng/nhóm chỉ tiêu, card hiển thị trạng thái rỗng ngắn
gọn như `Chưa có`, không tạo khoảng trống lớn.

## Reuse Constraints

Trước khi thêm UI primitive mới, dùng workflow code-deduplication để kiểm tra
shared card/list patterns hiện có.

