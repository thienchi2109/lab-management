# Validation

## Proof Strategy

Story hoàn tất khi component tests và browser proof chứng minh gallery/preview
hoạt động trên desktop/mobile, Viewer read-only và result viewer giữ context.

## Test Plan

| Layer | Cases |
| --- | --- |
| Component | Thumbnail grid, preview open/close, next/previous, Viewer read-only. |
| Browser | Mobile/desktop gallery, no overflow, controls usable, return to list context. |
| Platform | Typecheck, React Doctor diff, docstring gate nếu thêm named exports. |

## Acceptance Evidence

- RED component proof:
  `cd lab-kit-app && bun run test -- app/dashboard/samples/[sampleId]/results/_components/sample-image-gallery.test.tsx`
  fail trước implementation vì thumbnail chưa có button `Mở ảnh minh chứng`,
  preview lớn, next/previous hoặc delete boundary trong preview.
- GREEN focused proof:
  `cd lab-kit-app && bun run test -- app/dashboard/samples/[sampleId]/results/_components/sample-image-gallery.test.tsx app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.test.tsx`
  pass, 2 files / 13 tests. Bộ test bao phủ thiết kế Stitch đã duyệt: count
  chip, helper ngắn, grid 3 cột trên mobile, chip overlay, lightbox tối và
  touch target 44px.
- Sample image regression proof:
  `cd lab-kit-app && bun run test -- lib/sample-images app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.test.tsx app/dashboard/samples/[sampleId]/results/_components/sample-image-gallery.test.tsx`
  pass, 7 files / 34 tests.
- Platform proof:
  `cd lab-kit-app && bun run typecheck`,
  `cd lab-kit-app && bun run react-doctor:diff` và
  `cd lab-kit-app && bun run docstring:check` đều pass.
- Harness proof:
  `scripts/bin/harness-cli story verify FB-20260615-06C` pass sau khi verify
  command được cập nhật để chạy cả `sample-image-gallery.test.tsx` và
  docstring gate.
- Browser proof dùng `bunx next dev --webpack` vì `next dev` mặc định
  Turbopack panic tại `/dashboard/page`. Admin `admin / 123456@` mở
  `/dashboard/samples/14f1cd11-e779-494c-aa1e-cbdb55d19140/results`,
  tab `Ảnh` hiển thị 3 thumbnail preview và 3 delete buttons. Mobile viewport
  390px và desktop viewport 1365px đều không horizontal overflow. Preview mở
  đúng ảnh, next/previous hoạt động, close giữ nguyên URL kết quả mẫu. Không
  chạy Playwright cho vòng áp dụng thiết kế Stitch theo yêu cầu sau cùng của
  người dùng.
- Viewer read-only boundary được chứng minh bằng component test: `canWrite=false`
  vẫn mở preview nhưng không render `Xóa ảnh minh chứng N`; editor/admin vẫn có
  delete control. Browser proof viewer riêng bị chặn vì quick viewer login không
  giữ session trong agent-browser session tách biệt.
