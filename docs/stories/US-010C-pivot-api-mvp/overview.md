# US-010C - Pivot API MVP

**Lane:** high-risk
**Phase:** 9
**Parent:** [US-010](../US-010-dashboard-pivot-analytics/overview.md)
**Depends on:** [US-010A](../US-010A-analytics-query-contract/overview.md)
**Status:** planned

## Current Behavior

Product docs list `POST /api/analytics/pivot`, but repo chưa có route runtime.

## Target Behavior

Tạo `POST /api/analytics/pivot` MVP:

- parse body bằng Zod;
- reject dimensions/measures/filters ngoài whitelist;
- `401` khi chưa đăng nhập;
- `403` khi actor không có quyền đọc;
- `400` cho payload không hợp lệ;
- `422` khi query quá rộng và thiếu filter/limit bắt buộc;
- response gồm rows, totals, filter summary và warnings nếu có.

## Affected Users

- Admin, Editor, Viewer: dùng API gián tiếp qua analytics UI.
- Developer: có public contract ổn định cho US-010D.

## Affected Product Docs

- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`

## Non-Goals

- Analytics page UI.
- Dashboard overview UI.
- Export file.
- Audit log export.
- Migration/RPC/index.
