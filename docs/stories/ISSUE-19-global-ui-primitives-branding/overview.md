# ISSUE-19 Global UI Primitives Và Branding

## Status

implemented

## Lane

normal

## Product Contract

Backlog #19 hoàn tất lớp UI foundation dùng chung cho app: bảng màu xanh lâm
sàng, overlay/form/select primitives nhất quán, toast primitive toàn cục, và
branding LabKit Sample Management có logo/favicon thống nhất trên metadata và
trang đăng nhập.

## Relevant Product Docs

- `docs/product/ui-contract.md`
- `docs/product/tech-stack.md`

## Acceptance Criteria

- Theme toàn cục dùng semantic token xanh lâm sàng, không quay lại hard-coded
  trắng/đen/zinc cho shell, select và overlay.
- Root layout mount global toast primitive một lần để các flow sau dùng API
  chung, không tự dựng thông báo cục bộ.
- Favicon, app icon, apple touch icon, manifest và logo được lấy từ
  `/root/favicon_logo`.
- Tên app thống nhất là `LabKit Sample Management` trong metadata và trang
  đăng nhập.
- Trang đăng nhập dùng logo brand chuẩn thay vì icon Lucide/tên tạm.

## Design Notes

- UI surfaces: root layout, login page, global toast viewport, semantic theme
  tokens, app metadata/icons.
- Shared code: thêm brand constants/component và toast primitive dùng Radix
  đang có sẵn qua dependency `radix-ui`.
- Không thay đổi auth, server actions, database, API, audit hoặc luồng nghiệp
  vụ.

## Frontend, Reuse, And Caching Constraints

- Dùng shared component cho brand mark và toast primitive.
- Không thêm dependency toast mới khi `radix-ui` đã cung cấp Toast primitive.
- Không thêm TanStack Query vì không có client-cache requirement.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Focused Vitest cho theme, branding, toast, app select và dialog frame. |
| Integration | TypeScript, ESLint strict, Prettier, docstring gate. |
| E2E | Browser smoke login/dashboard nếu dev server chạy được. |
| Platform | Next build và React Doctor diff. |
| Release | Không áp dụng trong lượt này. |

## Harness Delta

Gom branding vào backlog #19 theo yêu cầu mới vì đây là phần UI foundation;
không đóng các backlog hiệu năng/workflow riêng.

## Evidence

- RED: `bun run test app/branding.test.ts components/ui/toast.test.tsx` failed
  vì thiếu asset public, thiếu `components/ui/toast.tsx`, login còn brand tạm
  `LabFlow Precision`.
- GREEN focused: `bun run test app/branding.test.ts components/ui/toast.test.tsx app/theme-dark-mode.test.ts components/dashboard/app-select.test.tsx components/dashboard/dialog-frame.test.tsx` pass 5 files / 23 tests.
- Full unit: `bun run test` pass 103 files / 366 tests.
- Gates: `bun run typecheck`, `bun run lint:strict`, `bun run format:check`,
  `bun run docstring:check`, `bun run build`, `bun run react-doctor:diff`, và
  `bun run quality` pass.
- React Doctor diff còn 2 warning ở `components/dashboard/dialog-frame.tsx:96`
  về custom `role="dialog"` thay vì native `<dialog>`; đây là trade-off đã
  được test khóa để dropdown portal trong overlay vẫn hoạt động.
- Browser smoke: `agent-browser` mở `http://localhost:3000/login`, không có
  error overlay, title là `Đăng nhập | LabKit Sample Management`, logo render,
  manifest `/site.webmanifest` và favicon/apple icon links có mặt. Screenshot:
  `/tmp/issue-19-login-branding.png`.
