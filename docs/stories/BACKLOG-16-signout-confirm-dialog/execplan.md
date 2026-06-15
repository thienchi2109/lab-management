# BACKLOG-16 Confirm Dialog Khi Đăng Xuất Implementation Plan

> **For agentic workers:** REQUIRED: Use `superpowers:executing-plans` to
> implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm confirm dialog trước khi đăng xuất bằng shared primitive có thể
tái dùng cho destructive actions.

**Architecture:** Compose shared `DialogFrame` thành `ConfirmDialog` ở
`components/ui`, rồi dùng primitive đó trong topbar để submit form sign out hiện
có. Không đổi route sign out hoặc redirect behavior.

**Tech Stack:** Next.js App Router, React client component, Vitest,
Testing Library, shared UI primitives.

---

## Task 1: Khóa regression shared confirm primitive

**Files:**

- Create: `lab-kit-app/components/ui/confirm-dialog.test.tsx`
- Modify: `lab-kit-app/components/ui/confirm-dialog.tsx`

- [ ] Viết test fail cho `ConfirmDialog` render title, description, cancel và
      confirm labels.
- [ ] Viết test fail rằng cancel gọi `onOpenChange(false)` và không gọi
      `onConfirm`.
- [ ] Viết test fail rằng confirm gọi `onConfirm` khi dùng callback mode.
- [ ] Viết test fail rằng confirm button có `form=<id>` khi dùng form-submit
      mode.
- [ ] Chạy:
      `cd lab-kit-app && bun run test components/ui/confirm-dialog.test.tsx`
      Expected: fail vì component chưa tồn tại hoặc thiếu behavior.
- [ ] Implement tối thiểu `ConfirmDialog` bằng `DialogFrame` và `Button`.
- [ ] Chạy lại focused test, expected pass.

## Task 2: Dùng confirm primitive trong topbar

**Files:**

- Modify: `lab-kit-app/components/layout/topbar.tsx`
- Modify: `lab-kit-app/components/layout/topbar.test.ts`

- [ ] Viết hoặc mở rộng test topbar để chứng minh source không còn submit trực
      tiếp từ nút icon đăng xuất.
- [ ] Thêm test component-level nếu setup cho phép: click nút đăng xuất mở dialog
      và chỉ confirm mới submit form.
- [ ] Chạy:
      `cd lab-kit-app && bun run test components/layout/topbar.test.ts`
      Expected: fail trước implementation.
- [ ] Cập nhật topbar: nút icon mở state dialog; form sign out có id ổn định;
      `ConfirmDialog` submit form qua `confirmFormId`.
- [ ] Giữ sr-only label `Đăng xuất` và copy tiếng Việt có dấu.
- [ ] Chạy lại focused topbar test, expected pass.

## Task 3: Bảo vệ sign out route hiện có

**Files:**

- Verify only: `lab-kit-app/app/auth/signout/route.test.ts`
- Verify only: `lab-kit-app/app/auth/signout/route.ts`

- [ ] Không đổi route sign out nếu không có test fail bắt buộc.
- [ ] Chạy:
      `cd lab-kit-app && bun run test app/auth/signout/route.test.ts`
      Expected: pass, redirect host regression vẫn xanh.

## Task 4: Quality gate và evidence

**Files:**

- Modify: `docs/stories/BACKLOG-16-signout-confirm-dialog/validation.md`
- Update DB: `scripts/bin/harness-cli story update`

- [ ] Chạy:
      `cd lab-kit-app && bun run test components/ui/confirm-dialog.test.tsx components/layout/topbar.test.ts app/auth/signout/route.test.ts`
- [ ] Chạy:
      `cd lab-kit-app && bun run react-doctor:diff`
- [ ] Chạy:
      `cd lab-kit-app && bun run docstring:check`
- [ ] Nếu có TS/TSX exports mới, thêm JSDoc theo docstring gate.
- [ ] Ghi validation evidence vào `validation.md`.
- [ ] Cập nhật story durable row với proof flags phù hợp.

