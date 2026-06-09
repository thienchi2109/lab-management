# Exec Plan

## Goal

Đóng US-009E theo hướng conditional no-op khi chưa có evidence query hiện tại
không đủ; chỉ mở DB/RPC/index hardening sau này nếu có proof thật.

## Scope

Trong scope:

- proof target Supabase;
- live migration/index/function inventory;
- performance advisor và representative query plan;
- Harness evidence rằng không tạo migration/RPC/index khi chưa có proof.

Ngoài scope:

- UI changes;
- result-engine semantics;
- export/dashboard/report;
- quyền mới ngoài role matrix hiện có;
- migration/RPC/index speculative.

## Risk Classification

High-risk vì slice có thể chạm schema, RPC, grants, policies, indexes, tenant
scope, và live Supabase write nếu mở lại. Closeout hiện tại chỉ dùng read-only
proof.

## Work Phases

1. Evidence gate.
   - Đã khảo sát sau US-009D merge.
   - Không mở migration khi US-009A đến US-009D chưa chứng minh query hiện tại
     không đủ.

2. Target proof.
   - Chứng minh namespace `mcp__supabase_lab_management`.
   - Chứng minh project-ref `tuuqgpzgollcerqqszjr`.
   - Đọc repo mapping, migration history, và target objects.

3. TDD/SQL proof.
   - Dùng read-only live SQL/advisor/EXPLAIN cho closeout hiện tại.
   - Nếu mở lại, viết hoặc cập nhật tests/smoke checks cho tenant scope, grants,
     role read, và performance path.

4. Migration.
   - Không tạo migration trong closeout hiện tại.
   - Nếu mở lại, tạo migration forward-only.
   - Không sửa migration đã apply.
   - Apply bằng đúng MCP namespace sau proof.

5. Verification.
   - Chạy schema/performance read checks phù hợp.
   - Chạy Harness story verify bằng verify command docs-only.

6. Harness closeout.
   - Cập nhật proof và `story verify US-009E`.

## Stop Conditions

- Namespace hoặc project-ref thiếu, mơ hồ, hoặc khác expected value.
- Không chứng minh được target tables/functions.
- Cần quyền mới ngoài role matrix.
- Migration muốn sửa file đã apply.
