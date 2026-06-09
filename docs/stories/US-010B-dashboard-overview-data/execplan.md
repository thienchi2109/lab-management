# Exec Plan

## Goal

Thay `/dashboard` hard-coded bằng dữ liệu thật bounded mà không kéo thêm API
pivot hoặc analytics page.

## Scope

Trong scope:

- dashboard overview data loader;
- props/view models cho cards, trend và recent samples;
- empty/error/loading states;
- Viewer read proof.

Ngoài scope:

- route `/dashboard/analytics`;
- `POST /api/analytics/pivot`;
- chart package mới nếu chưa cần;
- export;
- migration/RPC/index.

## Risk Classification

High-risk vì chạm dashboard UI, role-sensitive read surface, server state và
multi-domain aggregate.

## Work Phases

1. Invoke Build Web Apps plugin capability trước UI work.
2. Invoke `code-deduplication` nếu thêm shared helper/component.
3. Viết tests cho dashboard content dùng view model thật và không phụ thuộc
   hard-coded arrays.
4. Implement server-side data loader và component props.
5. Browser verify dashboard cho Admin/Editor/Viewer và anonymous redirect.
6. Cập nhật durable proof.

## Stop Conditions

- Scope bắt đầu thêm `/dashboard/analytics` hoặc pivot API.
- Cần Supabase write.
- UI tạo duplicate table/list thay vì shared primitive phù hợp.
- Cần TanStack Query.
