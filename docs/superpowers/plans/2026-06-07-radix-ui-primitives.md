# Radix UI Primitives Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển `Badge`, `Button`, `Input`, `Select`, và `Tooltip` từ Base UI sang Radix mà giữ contract dashboard hiện tại.

**Architecture:** Các primitive shared trong `lab-kit-app/components/ui` được rewrite theo shadcn Radix registry, nhưng giữ variant helpers nội bộ để style toàn repo đồng bộ. `AppSelect` hấp thụ khác biệt API giữa Base `SelectValue` function-child và Radix placeholder/item text.

**Tech Stack:** Next.js App Router, React 19, shadcn/ui v4, Radix `radix-ui`, Vitest, React Testing Library.

---

## Chunk 1: Khóa Contract Bằng Test

### Task 1: Test primitive Radix contract

**Files:**
- Create: `lab-kit-app/components/ui/radix-primitives.test.tsx`
- Modify: `lab-kit-app/components/dashboard/form-fields.test.tsx`

- [ ] **Step 1: Viết test đỏ cho `Button asChild`, `Badge asChild`, `Input`, và `TooltipProvider`.**
- [ ] **Step 2: Mở rộng test `SelectField` để khóa placeholder và hidden input.**
- [ ] **Step 3: Chạy test focused để xác nhận fail đúng lý do thiếu Radix API.**

## Chunk 2: Migration Shared Component

### Task 2: Rewrite primitive implementation

**Files:**
- Modify: `lab-kit-app/components/ui/badge.tsx`
- Modify: `lab-kit-app/components/ui/button.tsx`
- Modify: `lab-kit-app/components/ui/input.tsx`
- Modify: `lab-kit-app/components/ui/select.tsx`
- Modify: `lab-kit-app/components/ui/tooltip.tsx`
- Modify: `lab-kit-app/components/dashboard/app-select.tsx`

- [ ] **Step 1: Thêm dependency `radix-ui`, gỡ `@base-ui/react`.**
- [ ] **Step 2: Rewrite `Badge` và `Button` bằng `Slot.Root` + `asChild`.**
- [ ] **Step 3: Rewrite `Input` bằng native `<input>`.**
- [ ] **Step 4: Rewrite `Select` bằng Radix `Root/Trigger/Value/Content/Viewport/Item`.**
- [ ] **Step 5: Rewrite `Tooltip` bằng Radix `Provider/Root/Trigger/Content`.**
- [ ] **Step 6: Sửa `AppSelect` bỏ function-child của `SelectValue`.**
- [ ] **Step 7: Chạy test focused để xác nhận green.**

## Chunk 3: Call-site Và Validation

### Task 3: Sửa call-site và kiểm chất lượng

**Files:**
- Modify: `lab-kit-app/app/dashboard/_components/dashboard-hero.tsx`
- Modify: `lab-kit-app/app/dashboard/_components/dashboard-recent-samples-card.tsx`
- Modify: `lab-kit-app/app/dashboard/samples/_components/sample-metadata-client.tsx`
- Modify: `lab-kit-app/components.json`
- Modify: `docs/stories/US-015-radix-ui-primitives-migration/overview.md`

- [ ] **Step 1: Đổi `render`/`nativeButton={false}` sang `asChild`.**
- [ ] **Step 2: Cập nhật `components.json` sang `radix-nova`.**
- [ ] **Step 3: Chạy `rg "@base-ui/react|render=|nativeButton="` để xác nhận sạch source.**
- [ ] **Step 4: Chạy `bun run typecheck`, focused test, `bun run react-doctor`, và các gate cần thiết.**
- [ ] **Step 5: Cập nhật evidence trong story.**
