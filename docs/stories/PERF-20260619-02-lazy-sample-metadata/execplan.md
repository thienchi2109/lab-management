# Exec Plan

## Goal

Rút metadata tạo mẫu ra khỏi đường load mặc định của dashboard và chỉ tải khi
admin/editor mở overlay tạo/sửa mẫu.

## Scope

In scope:

- Tách loader metadata tối thiểu cho form tạo mẫu.
- Gating theo vai trò admin/editor.
- Regression tests cho viewer và admin/editor.

Out of scope:

- Đổi sample grid pagination.
- Đổi result entry loader.
- Thêm TanStack Query nếu chưa có yêu cầu cache được chứng minh.
- Thay đổi schema hoặc RLS.

## Risk Classification

Risk flags:

- Authorization.
- Frontend/UI.
- Server state.
- Existing behavior.
- Weak proof.

Hard gates:

- Authorization.

## Work Phases

1. Map call graph của dashboard shell, topbar CTA, overlay và metadata loader.
2. Viết RED tests cho viewer không fetch metadata và admin/editor lazy-load khi
   mở overlay.
3. Tách loader reference metadata tối thiểu.
4. Nối overlay với loader lazy-load theo pattern hiện có.
5. Chạy focused tests, typecheck, React Doctor diff.
6. Browser smoke admin/viewer nếu có credential/dev server.
7. Cập nhật Harness evidence.

## Stop Conditions

Pause for human confirmation if:

- Cần thay đổi quyền tạo/sửa mẫu ngoài admin/editor.
- Implementation muốn thêm TanStack Query mà chưa có cache contract cụ thể.
- Loader cần một endpoint public mới thay vì server-only/action path.
- Test cho thấy form tạo mẫu đang thật sự phụ thuộc danh sách toàn bộ samples.
