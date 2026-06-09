# US-010 - Dashboard, Pivot & Analytics Parent Tracker

**Lane:** high-risk
**Phase:** 9
**Status:** planned
**Affects:** điều phối các slice Phase 9 cho dashboard tổng quan, pivot
analytics, route báo cáo, chart/filter UI, read contract và DB hardening nếu
cần

## Current Behavior

US-009 đã hoàn tất data grid mẫu với query contract server-side, phân trang,
filter/search/sort, responsive mode, column visibility, group detail và closeout
DB/RPC/index theo hướng chưa cần migration.

Dashboard hiện tại ở `/dashboard` vẫn là shell tĩnh: cards, biểu đồ giả lập và
danh sách mẫu gần đây dùng dữ liệu hard-coded. Navigation đã có link
`/dashboard/analytics` với nhãn `Báo cáo`, nhưng chưa có route analytics hoặc
API pivot runtime.

## Target Behavior

US-010 là parent tracker cho Phase 9. Runtime implementation phải đi qua các
slice nhỏ, merge và verify độc lập:

- [US-010A](../US-010A-analytics-query-contract/overview.md): analytics query
  contract, whitelist dimensions/measures/filters, role read actor và aggregate
  read port không raw SQL.
- [US-010B](../US-010B-dashboard-overview-data/overview.md): thay dashboard
  overview hard-coded bằng dữ liệu thật bounded cho cards, trend và recent
  samples.
- [US-010C](../US-010C-pivot-api-mvp/overview.md): API
  `POST /api/analytics/pivot` với Zod parse, auth/role errors và
  unbounded-query guard.
- [US-010D](../US-010D-analytics-page-ui/overview.md): route
  `/dashboard/analytics` với filter summary, pivot/chart MVP và read-only
  Viewer flow.
- [US-010E](../US-010E-analytics-db-hardening/overview.md): survey live
  DB/RPC/index sau US-010A-D; close conditional no-op nếu chưa có bằng chứng
  cần migration.

## Affected Users

- Admin: cần theo dõi khối lượng mẫu, khách hàng/công ty, loại mẫu/KIT, tỷ lệ
  PCR `SẠCH`/`NHIỄM` và tín hiệu bất thường theo nhóm kết quả.
- Editor: cần xem nhanh workload, mẫu đang xử lý và xu hướng kết quả.
- Viewer: cần xem dashboard/report ở chế độ chỉ đọc.
- Reviewer: cần PR nhỏ, có proof riêng, không gom toàn bộ Phase 9 vào một diff.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/product/data-model.md`
- `docs/product/result-engine.md`
- `docs/product/roles-permissions.md`
- `docs/product/tech-stack.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- Implement runtime code trong parent US-010.
- Export Excel/CSV hoặc export pivot dataset file; phần đó thuộc Phase 10.
- Report view cho mẫu đã duyệt.
- Thay đổi thuật toán `KQ_CHUNG`.
- Thêm role hoặc permission mới ngoài ma trận hiện có.
- Offline cache/PWA cho dashboard.
- Thêm TanStack Query nếu chưa chứng minh cần client cache riêng.
