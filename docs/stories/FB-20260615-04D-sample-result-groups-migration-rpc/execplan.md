# Exec Plan

## Goal

Tạo nền DB/RPC cho quan hệ mẫu nhiều nhóm chỉ tiêu để 04B, 04C và 04E có thể
triển khai trên contract ổn định, có RLS, backfill và proof live.

## Scope

- Migration forward-only tạo `public.sample_result_groups`.
- Backfill dữ liệu mẫu hiện có.
- Mở rộng RPC `create_sample_metadata_with_code`.
- Cập nhật RPC `save_sample_results_with_audit`.
- Cập nhật schema-contract tests và validation script nếu cần.
- Live Supabase proof trước/sau migration bằng `mcp__supabase_lab_management`.

## Risk Classification

High-risk.

Risk flags:

- Data model.
- Authorization/RLS.
- Public RPC contract.
- Audit/security.
- Existing behavior.
- Weak proof nếu thiếu live DB verification.

## Work Phases

1. Discovery.
   - Dùng context-mode đọc story cha, 04A/04B/04C/04E, product docs và migration
     lân cận.
   - Dùng Supabase MCP read-only chứng minh namespace
     `mcp__supabase_lab_management`, project-ref `tuuqgpzgollcerqqszjr`,
     migration history, bảng/functions target.
2. RED tests.
   - Schema-contract test fail cho bảng `sample_result_groups`, RLS/index và RPC
     signature mới.
   - Sample metadata RPC tests fail cho `p_result_group_ids`.
   - Sample results tests fail cho whitelist nhóm từ bảng nối.
3. Migration design.
   - Soạn migration forward-only theo pattern `SECURITY DEFINER`, `search_path`,
     grant/revoke, RLS fail-closed của repo.
   - Không sửa migration đã apply.
4. GREEN local.
   - Cập nhật SQL migration và tests/schema validation.
   - Cập nhật app code/server adapter chỉ khi cần để test contract phản ánh RPC
     mới.
5. Pre-write live proof.
   - Trước `apply_migration`, state chính xác namespace, project-ref,
     migration history hiện tại và target tables/functions.
   - Nếu namespace/project-ref thiếu, mơ hồ hoặc khác, dừng ngay.
6. Apply live migration.
   - Chỉ dùng `mcp__supabase_lab_management.apply_migration`.
   - Không dùng generic `mcp__supabase`.
7. Post-write live proof.
   - Read-only proof bảng/RLS/index/FK/RPC signature.
   - Proof backfill không làm mẫu cũ mất khả năng xem/nhập kết quả.
8. Verification.
   - Chạy focused tests, schema validation, typecheck nếu TS contract đổi,
     React Doctor/docstring gate nếu chạm TS/TSX.
9. Harness update.
   - Update story 04D status/evidence.
   - Ghi trace high-risk/detailed với files read, changed, live proof và friction.

## Stop Conditions

- Namespace không phải `mcp__supabase_lab_management`.
- Project-ref không chứng minh được là `tuuqgpzgollcerqqszjr`.
- Live migration history khác kỳ vọng và có thể làm migration đè hoặc lặp.
- Cần sửa migration đã apply thay vì tạo migration forward-only.
- RLS/grant direction chưa rõ hoặc có nguy cơ mở quyền cross-tenant.
- Backfill không có fallback rõ cho mẫu cũ.
- RPC signature thay đổi phá callers hiện có mà chưa có compatibility plan.
- Validation yêu cầu yếu hơn live DB proof.
