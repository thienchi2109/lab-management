# US-010B - Dashboard Overview Data MVP

**Lane:** high-risk
**Phase:** 9
**Parent:** [US-010](../US-010-dashboard-pivot-analytics/overview.md)
**Depends on:** [US-010A](../US-010A-analytics-query-contract/overview.md)
**Status:** planned

## Current Behavior

`/dashboard` render cards, trend chart và recent samples bằng dữ liệu
hard-coded trong dashboard components.

## Target Behavior

`/dashboard` dùng dữ liệu thật bounded ở mức MVP:

- summary cards từ aggregate samples/KIT/results;
- trend số mẫu theo thời gian;
- recent samples từ dữ liệu tenant/role-scoped;
- trạng thái empty/error/loading phù hợp;
- không đổi navigation shell mobile/desktop hiện có.

## Affected Users

- Admin: xem nhanh khối lượng và trạng thái lab.
- Editor: xem workload và mẫu mới.
- Viewer: xem dashboard read-only.

## Affected Product Docs

- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/data-model.md`

## Non-Goals

- `/dashboard/analytics`.
- `POST /api/analytics/pivot`.
- Export.
- Advanced chart distribution.
- Migration/RPC/index.
