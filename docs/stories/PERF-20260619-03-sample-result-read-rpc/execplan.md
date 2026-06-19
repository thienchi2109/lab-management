# Exec Plan

## Goal

Giảm độ trễ khi mở kết quả mẫu bằng một read RPC tenant-scoped, giữ nguyên
quyền đọc/ghi và rule kết quả.

## Scope

In scope:

- Read-only RPC cho payload kết quả mẫu.
- Server adapter/page loader gọi RPC thay vì nhiều query REST.
- Zod parse response ở boundary.
- Regression tests cho admin/editor/viewer và sample ngoài tenant.
- Migration forward-only nếu cần tạo RPC.

Out of scope:

- Save result RPC hiện có.
- Tính toán lại Kết Quả Chung.
- Tắt hoặc nới RLS.
- Refactor UI kết quả mẫu ngoài phần nối data loader.

## Risk Classification

Risk flags:

- Authorization.
- Data model.
- Public contracts.
- Server state.
- Existing behavior.
- Weak proof.

Hard gates:

- Authorization.
- Data model.

## Work Phases

1. Discovery bằng Code Review Graph cho loader kết quả mẫu, route API, tests và
   SQL/RPC hiện có.
2. Live DB read-only inspection qua `mcp__supabase_lab_management` để xác nhận
   project-ref `tuuqgpzgollcerqqszjr`, schema, function grants, indexes và RLS.
3. Viết RED tests cho adapter hiện tại hoặc contract loader mới.
4. Thiết kế RPC SQL forward-only, security definer/search_path/grants theo
   pattern migration hiện có.
5. Nối server loader với RPC và parse response bằng Zod.
6. Chạy focused tests, typecheck, React Doctor diff và schema validation nếu có.
7. Apply migration chỉ khi người dùng duyệt DB write theo rule repo.
8. Cập nhật Harness evidence.

## Stop Conditions

Pause for human confirmation if:

- Namespace Supabase hoặc project-ref khác `mcp__supabase_lab_management` /
  `tuuqgpzgollcerqqszjr`.
- RPC cần trả thêm dữ liệu nhạy cảm hoặc thay đổi role matrix.
- Cần migration index có rủi ro lock đáng kể.
- Test cho thấy UI hiện phụ thuộc side effect của nhiều REST query cũ.
