# Exec Plan

## Goal

Thêm group detail và desktop column mode cho kết quả động trong sample grid,
không đổi result-engine semantics.

## Scope

Trong scope:

- group detail cho từng mẫu;
- desktop result column mode theo group/metric whitelist;
- mobile giữ compact/detail mode, không bung ma trận rộng;
- role-aware read/edit navigation;
- tests cho result detail và selected columns.

Ngoài scope:

- sửa thuật toán `KQ_CHUNG`;
- sửa schema nhập kết quả;
- export/report/dashboard;
- DB/RPC/index hardening nếu chưa có proof.

## Risk Classification

High-risk vì slice chạm result domain, table column behavior, responsive layout,
và role read/edit boundaries.

## Work Phases

1. Discovery.
   - Dùng context-mode trước.
   - Đọc Code Review Graph trước code edits.
   - Map result-engine contracts và US-007 boundaries.

2. Frontend/reuse checkpoint.
   - Invoke Build Web Apps plugin capability.
   - Invoke `code-deduplication` trước result/table helpers.

3. TDD.
   - Test whitelist group/metric keys, page-scoped result fetch, Viewer
     read-only, và mobile no-wide-matrix behavior.

4. Implementation.
   - Thêm group detail.
   - Thêm desktop selected result columns.
   - Nối edit navigation vào flow US-007.

5. Verification.
   - Focused tests, typecheck, lint strict, build, React Doctor.
   - Browser verification mobile và desktop.

6. Harness closeout.
   - Cập nhật proof và `story verify US-009D`.

## Stop Conditions

- Cần đổi result-engine semantics.
- Query phải fetch toàn bộ result dataset.
- Mobile buộc render ma trận cột kết quả rộng.
- Cần DB/RPC/index mà chưa chuyển sang US-009E.
