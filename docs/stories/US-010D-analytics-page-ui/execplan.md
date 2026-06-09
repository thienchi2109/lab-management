# Exec Plan

## Goal

Tạo `/dashboard/analytics` MVP tập trung vào filter summary, pivot/chart state
và Viewer read-only proof.

## Scope

Trong scope:

- route analytics page;
- filter controls;
- filter summary;
- pivot/chart/table MVP;
- responsive desktop/mobile states;
- browser verification.

Ngoài scope:

- export;
- advanced BI builder;
- migration/RPC/index;
- changing dashboard overview.

## Risk Classification

High-risk vì chạm frontend UI, responsive behavior, public navigation và
role-sensitive read surface.

## Work Phases

1. Invoke Build Web Apps plugin capability.
2. Invoke `code-deduplication` nếu thêm shared UI/helper.
3. Viết component/route tests cho filter summary và role-safe render.
4. Implement page từ API/contract US-010A/C.
5. Browser verify Admin/Editor/Viewer và mobile/desktop.
6. Run quality gates và update durable proof.

## Stop Conditions

- API contract US-010C chưa đủ.
- Cần TanStack Query.
- UI cần mutation hoặc export.
- Text tiếng Việt không có dấu.
