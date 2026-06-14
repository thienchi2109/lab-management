# Exec Plan

## Goal

Hoàn thiện phần xem và sửa mẫu của backlog #12 trên trang Samples mà không kéo
theo phần xoá mềm.

## Scope

Trong scope:

- Read-only side sheet xem chi tiết mẫu.
- Role-based row actions cho xem và cập nhật.
- Giữ edit side sheet hiện có.
- Focused UI/action tests.

Ngoài scope:

- Xoá mềm.
- Multiple selection.
- Bulk toolbar.
- Global confirm dialog.
- Migration hoặc Supabase write.

## Risk Classification

Lane: normal.

Story này thay đổi UI và server action tests nhưng không chạm schema, RLS hoặc
destructive behavior.

## Work Phases

1. Discovery.
   - Đọc packet này và `ISSUE-12B` để không trộn scope.
   - Dùng Code Review Graph trước khi sửa code Samples.
   - Dùng GitNexus sau khi graph đã chỉ ra target symbols.

2. RED tests.
   - Test view side sheet chưa tồn tại.
   - Test Viewer không thấy cập nhật.
   - Test Admin/Editor vẫn mở edit side sheet.

3. Implementation.
   - Tách component nếu file gần vượt 350 dòng.
   - Dùng `SideSheetFrame` từ shared overlay primitive.
   - Không thêm bulk selection hoặc confirm dialog.

4. Verification.
   - Chạy focused tests theo story verify command.
   - Chạy React Doctor diff và docstring gate.
   - Browser smoke Samples desktop/mobile nếu UI thay đổi đáng kể.

5. Harness closeout.
   - Cập nhật validation evidence.
   - Cập nhật proof flags.
   - Ghi trace Harness.

## Stop Conditions

Dừng nếu:

- Phát hiện cần xoá mềm hoặc migration.
- Cần thêm global primitive destructive confirm.
- File code vượt 350 dòng mà chưa tách được scope nhỏ.
