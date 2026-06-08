# US-009E - DB/RPC/Index Hardening For Data Grid

**Lane:** high-risk  
**Phase:** 8  
**Status:** planned conditional  
**Parent:** [US-009](../US-009-data-grid-filters-views/overview.md)

## Current Behavior

US-009A đến US-009D ưu tiên dùng query/schema hiện có. Nếu các slice đó chứng
minh query hiện tại không thể paginate/filter/sort hoặc fetch result detail an
toàn, cần một slice riêng cho DB/RPC/index hardening.

## Target Behavior

Khi có bằng chứng cần thiết, US-009E thêm thay đổi database forward-only, có
proof target Supabase rõ ràng:

- chứng minh namespace `mcp__supabase_lab_management`;
- chứng minh project-ref `tuuqgpzgollcerqqszjr`;
- đọc migration history hiện tại;
- chỉ rõ target tables/functions/indexes;
- thêm migration/RPC/index nhỏ, phục vụ đúng query grid;
- kiểm tra security/performance/tenant scope sau apply.

## Affected Users

- Admin, Editor, Viewer: được bảo vệ khỏi grid chậm hoặc query thiếu scope.
- Reviewer: review DB changes riêng, không bị trộn với UI.

## Affected Product Docs

- `docs/product/data-model.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- UI grid changes.
- Result-engine semantics changes.
- Migration chỉnh sửa file đã apply.
- Supabase write nếu không chứng minh đúng namespace/project-ref.
