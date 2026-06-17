# Exec Plan

## Goal

Thay filter trang Mẫu bằng bộ lọc nghiệp vụ khách hàng yêu cầu, giữ URL state và
export đồng bộ.

## TDD Flow

1. `FB-20260615-02A`: RED/GREEN parser tests cho default 10 ngày gần nhất,
   fixed sort, nhiều nhóm chỉ tiêu, input không hợp lệ và export parity.
2. `FB-20260615-02B`: RED/GREEN operations/server tests cho option payload và
   filter ngày, loại mẫu, công ty, khách hàng, nhóm chỉ tiêu.
3. `FB-20260615-02C`: RED/GREEN component/browser tests cho tiêu đề, chú thích,
   export placement, filter controls, URL state, pagination và việc bỏ filter
   trạng thái mẫu/thanh toán/sort direction.
4. REFACTOR: giữ file dưới 350 dòng bằng cách tách component filter nếu cần.

## Stop Conditions

- Dừng nếu live DB không có quan hệ đủ để lọc nhóm chỉ tiêu theo mẫu trước khi
  story multi-group được triển khai.
- Dừng nếu yêu cầu nhập text tự do cho customer/company cần semantics khác nhau
  giữa “contains text” và “chọn entity”.

## Expected Commands

```bash
cd lab-kit-app && bun run test --run \
  lib/sample-grid/query.test.ts \
  lib/export/query.test.ts
cd lab-kit-app && bun run test --run \
  lib/sample-grid/query.test.ts \
  lib/sample-grid/operations.test.ts \
  app/dashboard/samples/_components/sample-grid-page-content.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```
