# Exec Plan

## Goal

Triển khai backlog #12 theo TDD: hoàn thiện xem, sửa và xoá mẫu trên trang
Samples, trong đó xoá mẫu dùng xoá mềm admin-only để bảo toàn dữ liệu xét
nghiệm, kết luận và ảnh.

## Scope

Trong scope:

- Detail side sheet read-only cho mẫu.
- Edit side sheet hiện có, có thêm guard cho mẫu đã xoá mềm.
- Delete confirm dialog cho Admin.
- Server action/domain operation xoá mềm mẫu.
- Giữ nguyên command xoá ảnh đã upload; xoá mềm mẫu không tự xoá ảnh.
- Forward-only Supabase migration cho cột/index xoá mềm.
- Grid/query mặc định ẩn mẫu đã xoá mềm.
- Unit, integration-style, UI và live schema proof.

Ngoài scope:

- Khôi phục mẫu đã xoá mềm.
- Màn hình quản trị thùng rác.
- Xoá vật lý dữ liệu con.
- Thay đổi contract upload/xoá ảnh đã upload.
- Refactor lớn trang Samples ngoài các điểm cần để giữ file dưới 350 dòng.

## Risk Classification

Lane: high-risk.

Lý do:

- Có rủi ro mất dữ liệu nếu dùng hard delete.
- Chạm live schema, migration, RLS, role Admin/Editor/Viewer và audit.
- Live schema hiện có cascade từ `samples` sang `sample_results`,
  `sample_group_conclusions` và `sample_images`.
- Product docs nói `Delete samples` mặc định chỉ Admin, trong khi live RLS hiện
  có policy delete cho Admin/Editor. Triển khai phải thu hẹp hành vi app-facing
  về Admin-only và ghi nhận gap RLS nếu chưa sửa trong cùng story.

## Work Phases

1. Discovery refresh.
   - Đọc Harness docs bắt buộc và matrix.
   - Đọc backlog #12, trace #137 và story #19.
   - Chạy Code Review Graph trước khi đọc code sâu.
   - Dùng GitNexus sau khi graph đã chỉ ra target symbols.

2. Live schema proof.
   - Chỉ dùng `mcp__supabase_lab_management`.
   - Chứng minh namespace, project-ref `tuuqgpzgollcerqqszjr`, migration
     history, target tables và target functions trước mọi write.
   - Inspect columns, FK delete rules, indexes, RLS policies và RPC liên quan
     đến `samples`.

3. RED tests.
   - Test domain operation xoá mềm ghi audit, không gọi hard delete và từ chối
     mẫu đã xoá.
   - Test server action chỉ Admin được xoá, Editor/Viewer bị từ chối.
   - Test grid/query thêm `deleted_at is null`.
   - Test hoặc kiểm tra contract rằng soft-delete mẫu không gọi port xoá ảnh và
     không gọi `delete_sample_image_with_audit`.
   - Test UI hiển thị actions đúng role và confirm dialog giữ lỗi khi action
     fail.

4. Migration.
   - Tạo migration forward-only.
   - Không sửa migration đã apply live.
   - Thêm schema validation nếu repo có script phù hợp.

5. Domain and server actions.
   - Tách file mới nếu `operations.ts`, `server.ts` hoặc `actions.ts` sắp vượt
     350 dòng.
   - Giữ audit payload field-name policy.
   - Revalidate `/dashboard/samples`.

6. UI integration.
   - Dùng `SideSheetFrame` và `DialogFrame` từ shared UI primitive.
   - Không tạo primitive mới nếu component hiện có đủ dùng.
   - Giữ Vietnamese copy có đầy đủ dấu.

7. Verification.
   - Chạy focused tests trước.
   - Chạy schema validation nếu có migration.
   - Chạy full relevant app gates:
     `cd lab-kit-app && bun run test`,
     `cd lab-kit-app && bun run quality`.
   - Chạy React Doctor qua package script, không dùng `bunx`.
   - Browser verification cho desktop/mobile nếu UI thay đổi.

8. Harness closeout.
   - Cập nhật `validation.md` bằng bằng chứng thật.
   - Cập nhật story proof flags.
   - Đóng backlog #12 chỉ khi story hoàn tất và đã verify.
   - Ghi trace Harness theo `docs/TRACE_SPEC.md`.

## Stop Conditions

Dừng và hỏi user nếu:

- Namespace Supabase không phải `mcp__supabase_lab_management`.
- Project-ref không xác nhận được là `tuuqgpzgollcerqqszjr`.
- Có yêu cầu hard delete mẫu hoặc xoá dữ liệu con.
- Migration cần sửa file đã apply live.
- RLS/app role conflict không thể thu hẹp an toàn trong story này.
- File code cần sửa vượt 350 dòng mà không có cách tách scope nhỏ.
