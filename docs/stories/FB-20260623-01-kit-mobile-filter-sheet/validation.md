# Validation

## Proof

- RED: `npm exec -- vitest run app/dashboard/kits/_components/kit-inventory-mobile-filter-sheet.test.tsx`
  fail đúng vì chưa có `data-mobile-kit-filter-toolbar` và nút `Tìm kiếm và lọc KIT`.
- GREEN:
  `npm exec -- vitest run app/dashboard/kits/_components/kit-inventory-mobile-filter-sheet.test.tsx app/dashboard/kits/_components/kit-inventory-page-content.test.tsx app/dashboard/samples/_components/sample-grid-mobile-filter-sheet.test.tsx`
  pass 3 files, 14 tests.
- `bun run typecheck` pass.
- `bun run format:check` pass.
- `bun run docstring:check` pass. Lưu ý: command báo 0 changed source files vì
  source mới còn untracked; export mới `DashboardMobileFilterSheet` đã có JSDoc.
- `bun run react-doctor:diff` pass, không có issue.
- `bun run lint:strict` pass.
- Code Review Graph `detect_changes_tool` đọc đủ 7 file thay đổi, risk score
  0.65; scope chính là `KitInventoryClient`, `KitInventoryCommandBand` và
  shared mobile filter shell.
- GitNexus `detect_changes` báo risk low cho 3 tracked file; limitation: không
  thấy file mới chưa tracked, nên dùng CRG + diff trực tiếp cho phần này.
- `bun run build` pass với Next.js 16.2.7/Turbopack.
- `scripts/bin/harness-cli story verify FB-20260623-01-kit-mobile-filter-sheet`
  pass, chạy focused tests, `typecheck` và `format:check`.
- Agent Browser E2E mobile viewport `390x844`, admin demo login:
  `/dashboard/kits` render toolbar mobile, desktop filter ẩn, mở bottom sheet có
  tìm kiếm/trạng thái/loại KIT, nhập `khong-co-kit` làm `Bộ lọc (1)` và
  `Đang hiển thị 0/1 KIT`, `Xóa lọc` trả về placeholder và `Đang hiển thị 1/1
  KIT`, không Next error overlay, không horizontal overflow (`docWidth=375`,
  `innerWidth=390`). Lưu ý dev-only `nextjs-portal` của Next Dev Tools che hit
  target góc trái bottom sheet; E2E đã ẩn portal trước khi click `Xóa lọc`.
