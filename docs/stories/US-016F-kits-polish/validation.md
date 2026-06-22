# Validation

## Proof Strategy

US-016F hoàn tất khi `/dashboard/kits` được polish mà inventory behavior từ
US-005 vẫn giữ nguyên.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Kit inventory schemas, inventory view model and focused UI states. |
| Integration | Existing kit page/component tests and action-related guards still pass. |
| E2E | Admin opens kits desktop/mobile, searches/filters, opens create/update dialogs, no overlay, no horizontal overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |

## Commands

```bash
cd lab-kit-app
bun run test --run \
  app/dashboard/kits/_components/kit-inventory-page-content.test.tsx \
  app/dashboard/kits/_components/kit-inventory-polish.test.tsx \
  app/dashboard/kits/_components/kit-sample-cost-summary-ui.test.tsx \
  lib/kit-inventory/schema-contract.test.ts \
  lib/kit-inventory/operations.test.ts
bun run docstring:check
bun run react-doctor:diff
bun run quality
```

## Browser Proof Targets

- Desktop `1440x1000`: default inventory list, search, status/type filters,
  create type dialog, create batch dialog, add units dialog, update status dialog.
- Mobile `390x844`: list/card scan, filters, dialog open/close, no horizontal
  overflow and no bottom-nav overlap.

## Acceptance Evidence

- Đã triển khai ngày 2026-06-22.
- Bằng chứng TDD: lượt chạy focused đầu tiên fail với 3 assertion layout đúng
  kỳ vọng, sau đó regression test cho background mark fail trước khi triển khai
  cleanup opacity riêng cho trang.
- Kiểm chứng focused đã pass: 5 file / 21 test cho polish trang KIT, UI chi phí
  mẫu, schema contract và operations.
- Kiểm chứng platform đã pass: `bun run docstring:check`,
  `bun run react-doctor:diff` không có issue, và `bun run quality`. React
  Doctor full vẫn báo 3 warning không blocking đã tồn tại ngoài diff thay đổi.
- Bằng chứng agent-browser đã pass với phiên admin trên local webpack dev
  server: desktop `1440x1000`, mobile `390x844`, không tràn ngang
  (`scrollWidth` 375, `clientWidth` 375), input tìm kiếm cập nhật, dialog cập
  nhật trạng thái mở được, và console không có app error.
- Ảnh chụp lưu ngoài repo:
  `/root/images/us016f-kits-before-desktop.png`,
  `/root/images/us016f-kits-before-mobile.png`,
  `/root/images/us016f-kits-after-desktop.png`,
  `/root/images/us016f-kits-after-mobile.png`,
  `/root/images/us016f-kits-after-mobile-dialog.png`.
- Stitch MCP project `5136804635614976650` đã sinh screen
  `d6530d5fb97c400c9c204bf223e9ed3b` và design system asset
  `37e50e4edc2a4725b02c4f4f26ef82e2`; implementation lấy hướng hierarchy nhưng
  không sao chép dòng dữ liệu giả hoặc màu cảnh báo do Stitch tự bịa.
- Code Review Graph đã update sau thay đổi. GitNexus `detect_changes` báo risk
  low cho 4 file modified nhưng bỏ sót 3 file mới, nên direct diff review,
  focused tests và Code Review Graph được dùng để cover các file mới đó.
