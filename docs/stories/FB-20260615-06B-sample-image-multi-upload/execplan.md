# Exec Plan

## Goal

Mở rộng upload ảnh mẫu từ một file sang nhiều file theo hàng đợi, giữ limit 20
và audit/provider safety.

## TDD Flow

1. RED: component tests cho input `multiple`, upload nhiều file và Viewer
   read-only.
2. RED: operation/API tests cho slot còn lại, file vượt slot và duplicate public
   ID.
3. RED: delete regression test cho audit payload và provider cleanup.
4. GREEN: thêm upload queue/helper client nhỏ, không để `sample-images-panel.tsx`
   vượt 350 dòng.
5. GREEN: nối queue vào panel và giữ server/domain limit từ `FB-06A`.
6. REFACTOR: tách helper/component nếu panel phình trách nhiệm.

## Stop Conditions

- Dừng nếu `FB-06A` chưa xác nhận limit 20 và live DB/RPC.
- Dừng nếu Cloudinary config thiếu cho live smoke; dùng mocked provider tests và
  ghi skipped provider proof.
- Dừng nếu cần đổi schema/RPC; tạo slice migration riêng thay vì trộn vào
  upload queue.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- \
  lib/sample-images \
  app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```
