# US-009E - DB/RPC/Index Hardening For Data Grid

**Lane:** high-risk  
**Phase:** 8  
**Status:** implemented conditional no-op  
**Parent:** [US-009](../US-009-data-grid-filters-views/overview.md)

## Current Behavior

US-009A đến US-009D đã ưu tiên dùng query/schema hiện có. Khảo sát sau khi
US-009D merge không chứng minh được nhu cầu thêm RPC/index/migration: live DB
còn nhỏ, các index chính đã tồn tại, và planner hiện dùng index cho đường grid
đại diện.

## Target Behavior

US-009E đóng theo hướng conditional no-op: ghi bằng chứng rằng chưa cần thay
đổi DB/RPC/index ở thời điểm này và giữ rule cho lần mở lại sau này. Nếu dữ
liệu hoặc benchmark sau này chứng minh query hiện tại không đủ, US-009E phải
mở lại bằng migration forward-only, có proof target Supabase rõ ràng:

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
- DB/RPC/index speculative khi chưa có benchmark, advisor finding, hoặc query
  plan chứng minh cần hardening.
