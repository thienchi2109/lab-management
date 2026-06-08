# Exec Plan

## Goal

Thêm DB/RPC/index hardening tối thiểu cho data grid khi có evidence query hiện
tại không đủ, không trộn vào PR UI hoặc query contract ban đầu.

## Scope

Trong scope:

- proof target Supabase;
- migration forward-only nhỏ;
- RPC/view/index phục vụ data grid contract nếu cần;
- grants/RLS/security proof;
- performance proof cho query grid.

Ngoài scope:

- UI changes;
- result-engine semantics;
- export/dashboard/report;
- quyền mới ngoài role matrix hiện có.

## Risk Classification

High-risk vì slice có thể chạm schema, RPC, grants, policies, indexes, tenant
scope, và live Supabase write.

## Work Phases

1. Evidence gate.
   - Chỉ bắt đầu khi US-009A hoặc US-009D chứng minh query hiện tại không đủ.

2. Target proof.
   - Chứng minh namespace `mcp__supabase_lab_management`.
   - Chứng minh project-ref `tuuqgpzgollcerqqszjr`.
   - Đọc repo mapping, migration history, và target objects.

3. TDD/SQL proof.
   - Viết hoặc cập nhật tests/smoke checks cho tenant scope, grants, role read,
     và performance path.

4. Migration.
   - Tạo migration forward-only.
   - Không sửa migration đã apply.
   - Apply bằng đúng MCP namespace sau proof.

5. Verification.
   - Chạy schema/security/performance checks phù hợp.
   - Chạy focused app tests phụ thuộc.

6. Harness closeout.
   - Cập nhật proof và `story verify US-009E`.

## Stop Conditions

- Namespace hoặc project-ref thiếu, mơ hồ, hoặc khác expected value.
- Không chứng minh được target tables/functions.
- Cần quyền mới ngoài role matrix.
- Migration muốn sửa file đã apply.
