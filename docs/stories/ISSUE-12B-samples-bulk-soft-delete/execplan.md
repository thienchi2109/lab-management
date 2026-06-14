# Exec Plan

## Goal

Triển khai bulk soft delete mẫu theo TDD, tách khỏi story xem/sửa Samples.

## Scope

Trong scope:

- Multiple selection bằng shadcn `Checkbox`.
- Bulk toolbar cho Admin.
- Global confirm dialog primitive dựa trên shadcn `AlertDialog`.
- Server action/domain operation bulk soft delete.
- Forward-only migration cho cột/index xoá mềm.
- Grid/query mặc định ẩn mẫu đã xoá mềm.
- Audit an toàn.

Ngoài scope:

- View/edit side sheet; thuộc `ISSUE-12A`.
- Xoá ảnh đã upload.
- Hard delete.
- Khôi phục mẫu đã xoá mềm.
- Màn hình thùng rác.

## Risk Classification

Lane: high-risk.

Lý do:

- Chạm schema live và migration.
- Chạm destructive UX, role Admin, RLS/app authorization và audit.
- Hard delete hiện có rủi ro cascade sang kết quả, kết luận và ảnh mẫu.

## Work Phases

1. Discovery.
   - Đọc packet này, `ISSUE-12A`, product docs và prior traces.
   - Chạy Code Review Graph trước code edits.
   - Dùng GitNexus sau khi graph thu hẹp target.
   - Refresh shadcn docs cho `checkbox` và `alert-dialog`; nếu Bun crash, dùng
     package runner phù hợp khác như `npm exec`.

2. Live schema proof.
   - Dùng đúng `mcp__supabase_lab_management`.
   - Chứng minh project-ref `tuuqgpzgollcerqqszjr`.
   - Inspect migrations, columns, FK delete rules, indexes, policies và RPCs.

3. RED tests.
   - Domain bulk soft delete.
   - Server action Admin-only.
   - Grid hides `deleted_at is not null`.
   - UI row/header selection, indeterminate state và bulk toolbar.
   - Global confirm primitive pending/error behavior.
   - Image contract: soft delete không gọi xoá Cloudinary hoặc
     `delete_sample_image_with_audit`.

4. Migration.
   - Tạo migration forward-only.
   - Không sửa migration đã apply live.

5. Implementation.
   - Tách file mới nếu file hiện tại gần 350 dòng.
   - Dùng shadcn `Checkbox`.
   - Thêm shadcn `AlertDialog` nếu chưa có, rồi bọc thành global
     `ConfirmDialog`.
   - Không thêm TanStack Query.

6. Verification.
   - Focused tests.
   - Schema validation nếu có.
   - `cd lab-kit-app && bun run test`.
   - `cd lab-kit-app && bun run quality`.
   - Browser verification desktop/mobile.

7. Harness closeout.
   - Cập nhật validation evidence.
   - Cập nhật proof flags.
   - Ghi trace Harness.

## Stop Conditions

Dừng nếu:

- Namespace/project-ref Supabase không đúng.
- Yêu cầu chuyển sang hard delete.
- Cần sửa migration đã apply live.
- Không thể tạo global confirm primitive mà không vượt scope.
