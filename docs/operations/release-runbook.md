# Runbook vận hành release MVP

## Phạm vi

Runbook này dùng cho release production của Lab Management trên Vercel, Supabase
và Cloudinary. Không ghi token, secret hoặc mật khẩu vào repo, issue, trace hoặc
log.

## Tài khoản và token

- Vercel CLI của repo này phải dùng token riêng qua biến môi trường tạm
  `VERCEL_TOKEN`.
- Không dùng global Vercel auth, không chạy `vercel login`, `vercel logout` hoặc
  đổi account global trên máy này.
- Token hiện được cấp ngoài repo. Sau khi token bị lộ trong terminal hoặc
  transcript, phải rotate token.

## Kiểm tra trước deploy

1. Xác nhận repo sạch và `main` đã push:

   ```bash
   rtk git status --short
   rtk git rev-parse --short HEAD
   rtk git rev-parse --short origin/main
   ```

2. Kiểm tra production env trên Vercel:

   ```bash
   cd lab-kit-app
   VERCEL_TOKEN="$VERCEL_TOKEN" rtk vercel env ls
   ```

3. Kiểm tra Supabase qua đúng namespace MCP:

   - Namespace: `mcp__supabase_lab_management`
   - Project ref: `tuuqgpzgollcerqqszjr`
   - Đọc migration history và bảng chính trước mọi thao tác write.

4. Chạy quality gates:

   ```bash
   cd lab-kit-app
   bun run test
   bun run quality
   ```

   Nếu full React Doctor quét trúng `.env.local` hoặc `.next` ignored local
   artifact, tạm ẩn các artifact đó trong cùng shell rồi khôi phục ngay sau gate.

## Deploy production

Chạy từ `lab-kit-app/`:

```bash
VERCEL_TOKEN="$VERCEL_TOKEN" rtk vercel pull --yes --environment=production
VERCEL_TOKEN="$VERCEL_TOKEN" rtk vercel build --prod
VERCEL_TOKEN="$VERCEL_TOKEN" rtk vercel deploy --prebuilt --prod --yes
```

Sau deploy, inspect deployment:

```bash
VERCEL_TOKEN="$VERCEL_TOKEN" rtk vercel inspect https://aquatic-lab.vercel.app
```

## Smoke test sau deploy

1. Mở `https://aquatic-lab.vercel.app/login`.
2. Đăng nhập bằng tài khoản test do người vận hành cung cấp.
3. Xác nhận `/dashboard` render, không có Next.js error overlay.
4. Mở `/dashboard/samples`, xác nhận bảng mẫu tải xong.
5. Mở trang nhập kết quả của một mẫu seed, xác nhận form kết quả và panel ảnh
   minh chứng render.
6. Gọi export mẫu và export kết quả từ UI hoặc API đã đăng nhập.
7. Gọi endpoint ký upload Cloudinary bằng payload ảnh nhỏ để xác nhận signed
   upload configuration hoạt động.

## Backup và restore

Trước khi release production thật, operator phải xác nhận chính sách backup
Supabase hiện hành trong dashboard Supabase. Nếu cần diễn tập restore, thực hiện
trên môi trường branch hoặc dự án khôi phục riêng; không restore đè production
khi chưa có kế hoạch rollback đã duyệt.

## Gap release hiện tại

Release US-013 ngày 2026-06-13 đã deploy thành công, nhưng chưa thể xác nhận
tiêu chí nhập kết quả chất lượng nước vì production chỉ có cấu hình PCR.
Theo dõi issue #70 để seed và verify nhóm chất lượng nước.
