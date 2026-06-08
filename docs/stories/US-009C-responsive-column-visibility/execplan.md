# Exec Plan

## Goal

Bổ sung compact/mobile mode và column visibility local/session cho sample grid
MVP mà không đổi data contract.

## Scope

Trong scope:

- responsive compact/card hoặc compact row mode;
- column visibility controls;
- local/session persistence;
- storage fallback;
- browser verification mobile/desktop.

Ngoài scope:

- query contract changes;
- result group detail;
- desktop result column mode;
- server-side preference persistence.

## Risk Classification

Normal vì slice chủ yếu chạm UI responsive và local/session preference, không
đổi data contract hoặc quyền.

## Work Phases

1. Discovery.
   - Dùng context-mode trước.
   - Đọc Code Review Graph trước code edits.

2. Frontend/reuse checkpoint.
   - Invoke Build Web Apps plugin capability.
   - Invoke `code-deduplication` nếu thêm persistence/helper dùng lại.

3. TDD/UI tests.
   - Test storage adapter nếu có.
   - Test reload/refresh behavior cho column visibility.

4. Implementation.
   - Thêm compact mode.
   - Thêm column visibility controls và persistence.

5. Verification.
   - Focused tests, typecheck, lint strict, build, React Doctor.
   - Browser verification mobile và desktop.

6. Harness closeout.
   - Cập nhật proof và `story verify US-009C`.

## Stop Conditions

- Mobile layout vẫn render toàn bộ result columns rộng.
- Preference cần database write.
- Text/UI overlap ở mobile hoặc desktop.
