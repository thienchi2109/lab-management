# Exec Plan

## Goal

Tạo query/read contract server-side cho bảng mẫu chính, có pagination,
search/filter/sort whitelist, tenant scope, và role read proof.

## Scope

Trong scope:

- parser/normalizer cho `searchParams`;
- page size cap và default sort;
- filter/sort whitelist;
- query một page dữ liệu mẫu;
- proof tenant scope và role read behavior;
- unit/integration tests.

Ngoài scope:

- bảng UI hoàn chỉnh;
- responsive mode và column visibility;
- group detail/result column mode;
- DB/RPC/index hardening nếu chưa có bằng chứng cần thiết.

## Risk Classification

High-risk vì slice chạm server-side query, tenant isolation, role behavior, và
khả năng ảnh hưởng dữ liệu trả về cho nhiều role.

## Work Phases

1. Discovery.
   - Dùng context-mode trước.
   - Đọc Code Review Graph trước code edits.
   - Map source of truth cho sample list và role/tenant scope.

2. TDD.
   - Viết failing tests cho normalize, page size cap, whitelist sort/filter,
     invalid input, tenant scope, và role read behavior.

3. Implementation.
   - Thêm parser/normalizer nhỏ.
   - Thêm query/read-model dùng whitelist.
   - Không thêm migration nếu chưa có proof.

4. Verification.
   - Chạy focused unit/integration tests.
   - Chạy typecheck, lint strict, build, React Doctor nếu có TS/TSX ảnh hưởng.

5. Harness closeout.
   - Cập nhật `validation.md`, proof flags, và `story verify US-009A`.

## Stop Conditions

- Query phải đọc toàn bộ dataset để filter/sort.
- Không chứng minh được tenant scope hoặc role read behavior.
- Cần Supabase write nhưng chưa chuyển sang US-009E.
