# Exec Plan

## Goal

Thay filter trang Mẫu bằng bộ lọc nghiệp vụ khách hàng yêu cầu, giữ URL state và
export đồng bộ.

## TDD Flow

1. RED: test `parseSampleGridQuery` cho default 10 ngày gần nhất, bỏ sort
   direction UI, nhiều nhóm chỉ tiêu và input không hợp lệ.
2. RED: test server adapter áp dụng filter ngày, loại mẫu, công ty, khách hàng
   và nhóm chỉ tiêu.
3. RED: test render page content có tiêu đề/chú thích/export/filter mới.
4. GREEN: mở rộng query contract và server data payload.
5. GREEN: build filter controls bằng shared dashboard form/select primitives;
   chỉ thêm combobox shared nếu codebase chưa có tương đương.
6. REFACTOR: giữ file dưới 350 dòng bằng cách tách component filter nếu cần.

## Stop Conditions

- Dừng nếu live DB không có quan hệ đủ để lọc nhóm chỉ tiêu theo mẫu trước khi
  story multi-group được triển khai.
- Dừng nếu yêu cầu nhập text tự do cho customer/company cần semantics khác nhau
  giữa “contains text” và “chọn entity”.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- \
  lib/sample-grid/query.test.ts \
  lib/sample-grid/operations.test.ts \
  app/dashboard/samples/_components/sample-grid-page-content.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```
