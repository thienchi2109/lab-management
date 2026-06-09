# Exec Plan

## Goal

Khóa analytics query contract và read port test-first trước khi làm dashboard,
API hoặc UI báo cáo.

## Scope

Trong scope:

- Zod parser cho analytics query;
- whitelist dimensions/measures/filters;
- filter summary;
- read actor và permission check cho Admin, Editor, Viewer;
- aggregate mapper và unbounded-query guard.

Ngoài scope:

- HTTP route;
- dashboard UI;
- analytics page;
- DB migration/RPC/index;
- export.

## Risk Classification

High-risk vì đây là contract nền cho public API, server-state reads và
multi-domain analytics.

## Work Phases

1. Đọc sample grid query/server patterns, auth/session helpers và Supabase read
   patterns.
2. Viết failing tests cho parser, whitelist, role read và unbounded-query guard.
3. Implement module `lib/analytics/*` theo architecture layer.
4. Chạy focused tests, full tests cần thiết và quality gate.
5. Cập nhật durable story verify command.

## Stop Conditions

- Cần Supabase write.
- Contract cần permission mới ngoài role matrix.
- Implementation bắt đầu tạo API/UI trong cùng slice.
- Query buộc raw SQL từ client payload.
