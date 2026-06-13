# Exec Plan

## Goal

Tối ưu RPC lưu kết quả mẫu theo hướng set-based bằng migration forward-only,
giữ nguyên contract bảo mật, tenant/template validation và audit event.

## Scope

In scope:

- Thêm contract test cho migration SQL khóa yêu cầu set-based/no-loop.
- Tạo migration forward-only thay thế
  `public.save_sample_results_with_audit`.
- Giữ nguyên signature RPC và caller TypeScript.
- Kiểm chứng live project trước mọi Supabase write.
- Chạy test focused, schema contract, React Doctor và quality gate phù hợp.

Out of scope:

- UI nhập kết quả mẫu.
- API route contract.
- Result-engine rule mới.
- Tối ưu query/report khác.
- Chỉnh sửa migration đã apply live.

## Risk Classification

Lane: `high-risk`.

Risk flags:

- Migration forward-only.
- Transaction ghi nhiều bảng dữ liệu.
- Audit/security boundary.
- Tenant/template validation.
- RPC `SECURITY DEFINER`.

Hard gates:

- Data migration/write.
- Audit/security.
- Không được sửa migration đã apply live.
- Trước Supabase write phải chứng minh namespace
  `mcp__supabase_lab_management`, project-ref `tuuqgpzgollcerqqszjr`, migration
  history và target function/tables.

## Work Phases

1. Discovery.
   - Đọc Issue #31, Harness docs, product docs liên quan result engine.
   - Dùng Code Review Graph để khoanh `saveResultsTransaction` và caller.
   - Dùng GitNexus cho context symbol `saveResultsTransaction`.
   - Query live DB đọc function definition, grants, indexes, migration history.
2. TDD RED.
   - Tạo `lab-kit-app/lib/sample-results/schema-contract.test.ts`.
   - Test phải fail khi migration hiện tại vẫn còn `FOR LOOP` trên
     `p_results`/`p_conclusions`.
   - Test cũng assert function giữ `SECURITY DEFINER`, `search_path = public`,
     revoke public/anon/authenticated và grant `service_role`.
   - Chạy:
     `cd lab-kit-app && bun run test lib/sample-results/schema-contract.test.ts`
   - Expected RED: fail vì chưa có migration set-based/no-loop.
3. TDD GREEN.
   - Thêm migration mới, ví dụ
     `supabase/migrations/20260612XXXXXX_set_based_sample_results_rpc.sql`.
   - Implement `create or replace function
     public.save_sample_results_with_audit(...)` bằng CTE set-based.
   - Không sửa migration cũ.
   - Chạy lại focused test đến khi pass.
4. Regression tests.
   - Chạy:
     `cd lab-kit-app && bun run test lib/sample-results/operations.test.ts lib/sample-results/server.test.ts app/api/samples/[sampleId]/results/route.test.ts`
   - Chạy schema validation nếu script còn phù hợp:
     `node scripts/validate-supabase-schema.mjs`
5. Supabase apply checkpoint.
   - Trước apply, state lại:
     - MCP namespace: `mcp__supabase_lab_management`;
     - project-ref: `tuuqgpzgollcerqqszjr`;
     - URL: `https://tuuqgpzgollcerqqszjr.supabase.co`;
     - latest migration history;
     - target function/tables.
   - Chỉ dùng `mcp__supabase_lab_management.apply_migration`.
   - Không dùng namespace generic `mcp__supabase`.
6. Post-apply verification.
   - Query `pg_get_functiondef` xác nhận live function đã set-based và không
     còn vòng `FOR LOOP` cho result/conclusion upsert.
   - Query routine privileges xác nhận chỉ `service_role` và owner phù hợp có
     `EXECUTE`.
   - Chạy dữ liệu kiểm chứng repeatable nếu có fixture an toàn: invalid metric,
     invalid group, multi-result/multi-conclusion success, audit event count.
   - Chạy Supabase advisors security/performance nếu migration đã apply.
7. Final gates.
   - `rtk code-review-graph update --repo /root/lab-management`
   - `mcp__gitnexus.detect_changes` cho staged diff.
   - `cd lab-kit-app && bun run react-doctor`
   - `cd lab-kit-app && bun run quality` nếu thời gian cho phép; nếu không,
     ghi rõ gate nào chưa chạy.
   - Cập nhật validation evidence và Harness trace.

## Stop Conditions

Pause for human confirmation if:

- Live namespace hoặc project-ref khác `mcp__supabase_lab_management` /
  `tuuqgpzgollcerqqszjr`.
- Migration history live không còn khớp story này.
- Set-based rewrite buộc phải đổi RPC signature hoặc TypeScript API payload.
- Validation cần yếu hơn Issue #31 yêu cầu.
- Cần data cleanup, delete, hoặc backfill ngoài việc replace function.
- Cần mở rộng sang UI/frontend hoặc RPC khác.
