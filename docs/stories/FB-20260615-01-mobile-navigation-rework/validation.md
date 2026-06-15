# Validation

## Proof Strategy

Story hoàn tất khi navigation mobile mới có test coverage, `Báo cáo` chứa cả
overview lẫn pivot hiện có và route shell không có internal link chết. Browser
proof mobile được bỏ theo yêu cầu người dùng trong lượt triển khai này.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit/Component | Bottom nav labels, menu `Thêm`, absence của floating `+`, active state. |
| Integration | Topbar vẫn dispatch được create sample request; `Báo cáo` render overview và pivot. |
| Route/link | Không còn internal default entry trỏ `/dashboard`; route index `/dashboard` bị xóa khỏi app surface. |
| Browser | Bỏ theo yêu cầu người dùng; không chạy browser proof trong lượt này. |
| Platform | Typecheck, React Doctor diff, docstring nếu có export đổi. |

## Acceptance Evidence

- Implemented on 2026-06-15.
- RED đã được chứng minh cho bottom nav mới, bỏ floating `Thêm mẫu`, redirect
  mặc định sang `/dashboard/analytics`, analytics page render overview trước
  pivot và xóa route index `/dashboard`.
- Follow-up sizing trên 2026-06-15 tăng vừa phải bottom nav mobile từ `h-16`
  lên `h-[4.5rem]`, icon từ `size-5` lên `size-6`, label từ `text-[10px]`
  lên `text-[11px]` và tăng padding shell tương ứng.
- Focused suite passed:
  `cd lab-kit-app && bun run test -- components/layout/bottom-nav.test.tsx components/layout/sample-create-action.test.tsx components/layout/navigation-items.test.ts app/branding.test.ts app/auth/login/route.test.ts app/auth/viewer-login/route.test.ts app/dashboard/layout.test.tsx app/dashboard/analytics/page.test.tsx app/dashboard/analytics/_components/analytics-page-client.test.tsx app/dashboard/_components/dashboard-page-content.test.tsx`
  với 10 files / 28 tests pass.
- `cd lab-kit-app && bun run typecheck` passed sau khi xóa cache generated
  `.next/types` cũ do route `/dashboard` bị loại bỏ.
- `cd lab-kit-app && bun run format:check` passed.
- `cd lab-kit-app && bun run lint:strict` passed.
- `cd lab-kit-app && bun run docstring:check` passed.
- `cd lab-kit-app && bun run react-doctor:diff` passed.
- `rtk scripts/bin/harness-cli story verify FB-20260615-01` passed.
- Browser proof không chạy theo yêu cầu người dùng.
