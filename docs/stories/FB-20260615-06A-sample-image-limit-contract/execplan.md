# Exec Plan

## Goal

Tách và khóa hợp đồng giới hạn 20 ảnh/mẫu để các slice upload/gallery phía sau
không phải đoán nguồn chặn cuối cùng.

## TDD Flow

1. RED: thêm domain/unit tests chứng minh limit hiện tại vẫn là 10 hoặc chưa
   thống nhất.
2. DISCOVERY: Supabase MCP read-only xác nhận migration history,
   function/constraint liên quan và giới hạn live hiện tại.
3. GREEN: cập nhật constant/domain/API copy/product docs sang 20.
4. GREEN: nếu live DB/RPC enforce 10, dừng và tạo migration slice forward-only
   riêng trước khi đánh dấu `FB-06A` hoàn tất.
5. REFACTOR: giữ helper/constant tập trung, không tạo duplicate limit trong UI.

## Stop Conditions

- Dừng nếu Supabase namespace hoặc project-ref không đúng.
- Dừng nếu phát hiện DB/RPC enforce 10 nhưng chưa có migration path
  forward-only.
- Dừng nếu thay đổi bắt đầu đụng upload nhiều file hoặc lightbox; chuyển sang
  slice sau.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- lib/sample-images
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
node scripts/validate-supabase-schema.mjs
```
