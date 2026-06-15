# Exec Plan

## Goal

Rút gọn danh sách mẫu mobile theo phản hồi khách hàng mà không phá shared table
surface.

## TDD Flow

1. RED: component test chứng minh mobile row/card không chứa `Mã mẫu` nhưng
   detail action vẫn có dữ liệu sample id.
2. RED: test trang Mẫu không render `Tùy chọn cột` và `Cột kết quả desktop`.
3. RED: test card render ngày, loại mẫu, khách hàng, công ty, trạng thái, nhóm
   chỉ tiêu và kết quả chung.
4. GREEN: chỉnh caller/shared props để đạt contract.
5. REFACTOR: tách helper nếu file tiến gần giới hạn 350 dòng.

## Stop Conditions

- Dừng nếu bỏ column controls làm mất một desktop workflow còn được product
  contract bảo vệ; khi đó cần quyết định giữ desktop riêng hay bỏ toàn bộ.

## Expected Commands

```bash
cd lab-kit-app && bun run test -- \
  components/dashboard/data-table.test.tsx \
  app/dashboard/samples/_components/sample-grid-page-content.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```
