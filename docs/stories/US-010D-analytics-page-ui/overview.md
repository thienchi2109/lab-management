# US-010D - Analytics Page & Pivot UI MVP

**Lane:** high-risk
**Phase:** 9
**Parent:** [US-010](../US-010-dashboard-pivot-analytics/overview.md)
**Depends on:** [US-010A](../US-010A-analytics-query-contract/overview.md),
[US-010C](../US-010C-pivot-api-mvp/overview.md)
**Status:** planned

## Current Behavior

Navigation đã có `/dashboard/analytics`, nhưng route chưa tồn tại.

## Target Behavior

Tạo analytics page MVP:

- route `/dashboard/analytics`;
- filter controls theo time range, khách hàng/công ty, loại mẫu, loại KIT, nhóm
  kết quả khi options sẵn có;
- filter summary luôn hiển thị;
- pivot/chart/table MVP dùng API/contract đã whitelist;
- Viewer đọc được, không có controls sửa dữ liệu;
- mobile không bung matrix rộng.

## Affected Users

- Admin: xem báo cáo nhanh.
- Editor: xem workload và kết quả theo bộ lọc.
- Viewer: xem report read-only.

## Affected Product Docs

- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`

## Non-Goals

- Export file.
- Full BI builder.
- DB hardening.
- Dashboard overview cards.
