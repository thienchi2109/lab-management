# Design

## Domain Model

US-009D đọc `sample_results`, `result_groups`, `result_metrics`, và
`result_templates` để hiển thị summary/chi tiết kết quả cho page hiện tại.
Không thay đổi cách tính `KQ_CHUNG`, input types, hoặc template ownership.

## Application Flow

1. Người dùng mở sample grid.
2. Desktop chọn nhóm/chỉ tiêu để hiển thị cột kết quả có giới hạn.
3. Người dùng mở group detail cho một mẫu.
4. Detail chỉ đọc hoặc điều hướng sang flow US-007 theo quyền hiện có.
5. Mobile dùng group detail thay vì bung toàn bộ cột.

## Interface Contract

- Result group/metric keys phải được whitelist.
- Chỉ fetch kết quả cần cho page hiện tại.
- Desktop column mode có giới hạn số cột hoặc group đang chọn.
- Mobile không render ma trận rộng.
- Viewer chỉ đọc.

## Data Model

Không thêm schema trong slice này nếu query hiện tại đủ. Nếu cần view/RPC/index
để tránh query nặng, dừng và chuyển sang US-009E.

## UI / Platform Impact

Slice này chạm UI phức tạp, responsive behavior, result detail, và table column
mode.

Implementation phải:

- invoke Build Web Apps plugin capability trước UI work;
- invoke `code-deduplication` trước reusable result/table helpers;
- giữ `DashboardDataTable` cho table surface;
- không thêm TanStack Query nếu chưa có client-cache requirement cụ thể.

## Observability

Không log dữ liệu kết quả mẫu đầy đủ. Nếu query lỗi, log key/summary đã sanitize.

## Alternatives Considered

1. Render toàn bộ result metrics thành cột.
   - Bị loại vì phá mobile và có rủi ro performance.

2. Group detail + desktop selected columns.
   - Được chọn vì đúng acceptance criteria và giảm payload.
