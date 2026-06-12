# Exec Plan

## Goal

Khóa audit, authorization hardening, secret-safety, error contract và UX an toàn
cho các write path chính trước MVP release.

## Scope

In scope:

- Inventory write path và permission matrix thực tế.
- Regression tests cho viewer/editor bypass trên API/server action quan trọng.
- Audit coverage cho admin config changes và write path chính.
- Chuẩn hóa error response và user-facing safety UX liên quan quyền/lỗi.
- RLS, role bypass và secret exposure review.

Out of scope:

- UI polish tổng quát đã thuộc US-016.
- Redesign dashboard shell, typography, spacing hoặc responsive cleanup rộng.
- Role model mới hoặc workflow nghiệp vụ mới.
- DB rewrite hoặc chỉnh migration đã apply.

## Risk Classification

Risk flags:

- Auth/RBAC.
- RLS và role bypass.
- Audit/data-retention.
- Error contract và secret exposure.
- Có thể cần migration forward-only.

Hard gates:

- Supabase MCP target proof trước mọi DB write.
- Code Review Graph trước code edits.
- GitNexus context trước shared hoặc non-obvious edits.
- Code-deduplication trước khi thêm helper/component/hook/service dùng lại.
- Build Web Apps plugin capability trước mọi UI/frontend implementation.
- React Doctor qua package script trước commit/push.

## Work Phases

1. Discovery: đọc product docs, story packets liên quan và Code Review Graph để
   lập matrix write path, role, audit, error và UX an toàn.
2. Live DB proof: nếu cần DB/RLS/audit inspection, chứng minh đúng namespace
   `mcp__supabase_lab_management` và project-ref `tuuqgpzgollcerqqszjr`.
3. Test-first: thêm regression tests cho bypass case trước khi sửa guard.
4. Implementation: sửa guard, audit, sanitizer, error contract hoặc safety UX
   theo từng path hẹp.
5. Verification: chạy unit/integration/E2E/platform proof phù hợp và
   `cd lab-kit-app && bun run quality`.
6. Harness update: cập nhật validation evidence, trace và follow-up nếu discovery
   cho thấy cần tách story nhỏ hơn.

## Stop Conditions

Pause for human confirmation if:

- Discovery cho thấy US-012 quá rộng để làm một PR an toàn.
- Cần migration audit/RLS nhưng live DB proof chưa đầy đủ.
- Có nguy cơ thay đổi quyền hợp lệ của `admin`, `editor` hoặc `viewer`.
- Cần quyết định retention hoặc nội dung audit payload nhạy cảm.
- UI/frontend scope vượt khỏi UX an toàn và trùng US-016.
- Validation phải yếu hơn các acceptance criteria đã ghi.
