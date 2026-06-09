# Exec Plan

## Goal

Đóng câu hỏi DB/RPC/index cho Phase 9 bằng bằng chứng live, không đoán trước.

## Scope

Trong scope:

- inspect live project target;
- migration history;
- row counts/query plans/advisor;
- conditional no-op hoặc migration/RPC/index forward-only nếu có bằng chứng.

Ngoài scope:

- UI/API feature changes;
- export;
- speculative optimization;
- generic Supabase namespace.

## Risk Classification

High-risk vì có khả năng chạm DB, migrations, indexes, RPC và live project.

## Work Phases

1. Xác nhận đúng namespace/project-ref/repo mapping.
2. Liệt kê query shapes từ US-010A-D.
3. Chạy live DB survey và EXPLAIN/advisor.
4. Nếu no-op: ghi evidence và close story.
5. Nếu cần write: tạo forward-only migration, apply sau target proof, verify
   schema/advisor/tests.

## Stop Conditions

- Namespace không phải `mcp__supabase_lab_management`.
- Project-ref không phải `tuuqgpzgollcerqqszjr`.
- Query shape chưa ổn định vì US-010A-D chưa xong.
- Migration đã applied nhưng có yêu cầu sửa file cũ.
