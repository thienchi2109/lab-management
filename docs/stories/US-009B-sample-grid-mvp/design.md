# Design

## Domain Model

US-009B tiêu thụ read contract từ US-009A và render mỗi `sample` thành một row
cơ bản. Row actions chỉ nối đến flow đã có từ US-006, US-007, và US-008.

## Application Flow

1. Người dùng mở dashboard sample grid.
2. Server đọc URL state và gọi query contract US-009A.
3. Bảng render bằng `DashboardDataTable`.
4. Người dùng đổi search/filter/sort/page; URL phản ánh state đủ để refresh.
5. Row actions mở flow hiện có theo quyền của user.

## Interface Contract

- Search input có debounce hợp lý hoặc submit rõ ràng.
- Filters dùng shared dashboard controls.
- Sort key đi qua whitelist US-009A.
- Pagination không giữ stale page khi filter/search đổi.
- Viewer chỉ thấy action đọc.

## Data Model

Không thêm schema. Không bypass query contract US-009A.

## UI / Platform Impact

Slice này chạm UI/frontend, table/list surface, dashboard interaction state, và
browser verification.

Implementation phải:

- invoke Build Web Apps plugin capability trước UI work;
- invoke `code-deduplication` trước reusable UI/hooks/helpers;
- dùng `DashboardDataTable`;
- dùng shared dashboard messages/controls;
- giữ server-state mặc định bằng Server Components/server actions;
- không thêm TanStack Query nếu chưa có client-cache requirement cụ thể.

## Observability

UI không log dữ liệu mẫu nhạy cảm. Query/error logs đi theo contract US-009A.

## Alternatives Considered

1. Dựng bảng custom local.
   - Bị loại vì Harness yêu cầu dùng shared table surface.

2. Dùng `DashboardDataTable` cho MVP.
   - Được chọn để giảm diff và giữ UI nhất quán.
