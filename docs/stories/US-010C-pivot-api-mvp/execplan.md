# Exec Plan

## Goal

Tạo public API pivot nhỏ, testable, dựa trên US-010A và chưa dựng UI.

## Scope

Trong scope:

- route `app/api/analytics/pivot/route.ts`;
- auth/role guard;
- Zod body parse;
- error contract;
- response normalized;
- tests cho invalid payload và unbounded-query guard.

Ngoài scope:

- `/dashboard/analytics`;
- chart/table UI;
- export;
- migration/RPC/index.

## Risk Classification

High-risk vì thêm public API contract và role-sensitive read surface.

## Work Phases

1. Đọc API route patterns hiện có.
2. Viết failing route tests cho `401`/`403`/`400`/`422`/success.
3. Implement route handler mỏng gọi US-010A use case.
4. Verify no raw SQL path và no raw payload logging.
5. Cập nhật durable verify command.

## Stop Conditions

- API cần permission mới.
- API cần DB write.
- UI bắt đầu xuất hiện trong cùng slice.
