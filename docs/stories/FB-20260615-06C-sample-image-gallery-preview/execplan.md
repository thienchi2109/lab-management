# Exec Plan

## Goal

Thêm gallery thumbnail responsive và preview lớn cho ảnh mẫu, giữ Viewer
read-only và không phá result viewer context.

## TDD Flow

1. RED: component tests cho thumbnail grid, mở preview đúng ảnh và close.
2. RED: tests cho next/previous ở đầu/cuối danh sách.
3. RED: tests cho Viewer read-only và accessible labels của controls.
4. GREEN: tách thumbnail grid/preview component khỏi panel nếu cần.
5. GREEN: nối preview vào `SampleImagesPanel`.
6. Browser proof: desktop/mobile không overflow, controls dùng được, đóng viewer
   quay lại đúng context danh sách mẫu từ `FB-08`.

## Stop Conditions

- Dừng nếu cần thay đổi upload queue hoặc API; scope đó thuộc `FB-06B`.
- Dừng nếu layout thay đổi thứ tự summary/results/images từ `FB-05`.
- Dừng nếu browser proof cần auth fixture chưa có; ghi rõ e2e gap thay vì claim
  pass.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- \
  app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```
