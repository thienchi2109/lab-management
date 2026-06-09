# US-010A - Analytics Query Contract & Read Port

**Lane:** high-risk
**Phase:** 9
**Parent:** [US-010](../US-010-dashboard-pivot-analytics/overview.md)
**Status:** implemented

## Current Behavior

US-010 parent đã xác định dashboard/pivot cần dữ liệu thật và API whitelist,
nhưng repo chưa có contract analytics, read port, parser hoặc aggregate mapper
riêng. Sample grid đã có query parser/filter pattern có thể tham khảo, nhưng
analytics cần contract riêng để không kéo UI/API vào trước.

## Target Behavior

US-010A khóa phần nền tảng đọc dữ liệu analytics:

- DTO analytics được parse bằng Zod;
- dimensions, measures, filters và limit/page được whitelist;
- filter summary được normalize để UI/API dùng chung;
- read actor server-side cho Admin, Editor, Viewer được xác định rõ;
- read port aggregate không nhận raw SQL từ client và không fetch dataset mở.

Implementation đã thêm `lab-kit-app/lib/analytics/query.ts` và
`lab-kit-app/lib/analytics/operations.ts`, kèm tests cho parser, whitelist,
filter summary, actor, bounded-read guard và read-port boundary.

## Affected Users

- Admin, Editor, Viewer: hưởng lợi gián tiếp từ read contract đúng quyền.
- Developer/reviewer: có contract testable trước khi dashboard/API/UI dùng tới.

## Affected Product Docs

- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/product/data-model.md`
- `docs/product/result-engine.md`
- `docs/product/roles-permissions.md`

## Non-Goals

- Tạo `/api/analytics/pivot`.
- Sửa `/dashboard` hoặc thêm `/dashboard/analytics`.
- Thêm chart package.
- Migration/RPC/index.
- Export Excel/CSV.
