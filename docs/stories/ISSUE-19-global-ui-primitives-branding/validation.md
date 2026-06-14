# ISSUE-19 Validation

## RED

`bun run test app/branding.test.ts components/ui/toast.test.tsx` fail trước
implementation:

- `public/favicon.ico` và `public/site.webmanifest` chưa tồn tại.
- `components/ui/toast.tsx` chưa tồn tại.
- Login page còn dùng `FlaskConical`, `LabFlow Precision` và footer
  `Lab Management`.

## GREEN

- `bun run test app/branding.test.ts components/ui/toast.test.tsx app/theme-dark-mode.test.ts components/dashboard/app-select.test.tsx components/dashboard/dialog-frame.test.tsx` pass 5 files / 23 tests.
- `bun run test` pass 103 files / 366 tests.
- `bun run typecheck` pass.
- `bun run lint:strict` pass.
- `bun run format:check` pass.
- `bun run docstring:check` pass.
- `bun run react-doctor:diff` pass blocking criteria, còn 2 warning hiện hữu
  ở custom dialog frame.
- `bun run build` pass.
- `bun run quality` pass khi tạm đưa ignored `.env.local` ra ngoài repo và xóa
  `.next` artifact cũ để React Doctor full không scan secret local/build
  artifact; env vẫn được source cho build và `.env.local` đã restore.

## Browser Proof

`agent-browser` mở `http://localhost:3000/login` và xác nhận:

- Không có Next error overlay.
- Body có nội dung.
- `document.title` là `Đăng nhập | LabKit Sample Management`.
- Logo `/logo-lab-kit-removebg.png` render.
- Manifest `/site.webmanifest` render trong `<link rel="manifest">`.
- Favicon/apple icon links có mặt.
- Snapshot có form đăng nhập và region toast toàn cục `Notifications (F8)`.

Screenshot: `/tmp/issue-19-login-branding.png`.

## Notes

Backlog #19 không nhắc trực tiếp logo, tên app hoặc favicon trong mô tả durable
ban đầu; các hạng mục này được thêm vào scope theo yêu cầu người dùng trong
lượt hoàn tất #19.
