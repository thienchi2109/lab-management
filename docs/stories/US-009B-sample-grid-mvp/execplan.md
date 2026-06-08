# Exec Plan

## Goal

Triển khai bảng mẫu chính MVP trên contract US-009A, đủ cho tra cứu hằng ngày
nhưng chưa gom responsive preferences hoặc result group detail.

## Scope

Trong scope:

- route/surface bảng mẫu chính;
- `DashboardDataTable`;
- search/filter/sort/page URL state;
- loading, empty, error, permission-denied states;
- role-aware row actions dùng flow hiện có;
- focused UI/integration tests và browser verification cơ bản.

Ngoài scope:

- compact/card mode và column visibility;
- desktop result column mode;
- group detail;
- DB/RPC/index changes.

## Risk Classification

High-risk vì slice chạm table/list surface dùng hằng ngày, role-aware actions,
và dashboard navigation.

## Work Phases

1. Discovery.
   - Dùng context-mode trước.
   - Đọc Code Review Graph trước code edits.
   - Dùng GitNexus sau khi graph thu hẹp symbol shared table/route.

2. Frontend/reuse checkpoint.
   - Invoke Build Web Apps plugin capability.
   - Invoke `code-deduplication` nếu thêm reusable components/helpers.

3. TDD.
   - Test URL state, filter reset, states, và Viewer read-only actions.

4. Implementation.
   - Render `DashboardDataTable` từ US-009A contract.
   - Nối row actions vào flow hiện có.

5. Verification.
   - Focused tests, typecheck, lint strict, build, React Doctor.
   - Browser verification desktop.

6. Harness closeout.
   - Cập nhật proof và `story verify US-009B`.

## Stop Conditions

- Không dùng được `DashboardDataTable` và chưa có ngoại lệ được duyệt.
- Row actions yêu cầu quyền mới.
- UI cần result matrix rộng hoặc mobile compact mode để pass MVP.
