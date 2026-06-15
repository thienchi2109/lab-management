# Exec Plan

## Goal

Nâng ảnh minh chứng lên gallery 20 ảnh, hỗ trợ upload nhiều ảnh và xem ảnh lớn.

## TDD Flow

1. RED: operation tests chứng minh giới hạn 20 thay cho 10.
2. RED: component tests cho `multiple`, upload nhiều file, slot còn lại,
   Viewer read-only và delete icon.
3. RED: gallery tests cho thumbnail, preview, next/previous.
4. DISCOVERY: Supabase MCP read-only xác nhận DB/RPC constraint hiện tại.
5. GREEN: cập nhật domain constant/API/client copy.
6. GREEN: nếu live DB enforce 10, tạo migration forward-only nâng lên 20.
7. GREEN: thêm multi-file upload queue và gallery preview.
8. REFACTOR: tách gallery/lightbox/upload queue khỏi `sample-images-panel.tsx`
   để giữ file dưới 350 dòng.

## Stop Conditions

- Dừng nếu project-ref Supabase không đúng.
- Dừng nếu Cloudinary config thiếu cho live smoke; dùng mocked provider tests và
  ghi skipped provider proof.
- Dừng nếu DB/RPC hiện có logic giới hạn 10 đã applied live nhưng chưa có
  migration path forward-only.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- \
  lib/sample-images \
  app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
node scripts/validate-supabase-schema.mjs
```
