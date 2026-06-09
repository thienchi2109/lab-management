# US-010E - Analytics DB/RPC/Index Hardening Survey

**Lane:** high-risk
**Phase:** 9
**Parent:** [US-010](../US-010-dashboard-pivot-analytics/overview.md)
**Depends on:** US-010A, US-010B, US-010C, US-010D
**Status:** planned

## Current Behavior

US-009E đã đóng data grid DB hardening theo hướng conditional no-op vì live DB
chưa chứng minh cần migration. US-010 analytics có query shape khác nên cần
survey riêng sau khi query thật đã rõ.

## Target Behavior

Sau US-010A-D, kiểm tra live Supabase/advisor/EXPLAIN cho analytics query:

- nếu query hiện tại đủ, đóng US-010E là conditional no-op;
- nếu cần DB support, tạo migration/RPC/index forward-only với target proof đầy
  đủ trước mọi write.

## Affected Users

- Admin, Editor, Viewer: hưởng lợi từ dashboard/report không chậm hoặc lỗi.
- Operator: cần biết rõ có hay không DB change trong Phase 9.

## Affected Product Docs

- `docs/product/api-contract.md`
- `docs/product/data-model.md`
- `docs/product/ui-contract.md`

## Non-Goals

- Thay đổi UI/API behavior.
- Tối ưu speculative khi chưa có query thật.
- Supabase write khi chưa chứng minh namespace/project-ref.
