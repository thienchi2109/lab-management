# FB-20260621-05 - Đồng bộ sử dụng KIT với tồn kho lô

## Status

implemented

## Lane

normal

## Product Contract

Khi một KIT được sử dụng, số tồn kho theo lô và theo loại phải không bị lệch so
với trạng thái KIT thực tế. Story này khóa lại nguồn sự thật cho công thức `số
kit nhận vào trừ số kit đã sử dụng` trước khi dựa vào dữ liệu đó để báo cáo.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/stories/US-005-kit-inventory-module/overview.md`
- `docs/stories/FB-20260621-02-kit-stock-by-type-chart.md`

## Acceptance Criteria

- Có test chứng minh chuyển KIT sang `used` không làm lệch số tồn hiển thị.
- Có quyết định rõ `remaining_quantity` là dữ liệu nguồn, dữ liệu cache, hay dữ
  liệu có thể tính lại từ `kits.status`.
- Nếu `remaining_quantity` cần cập nhật khi `kits.status` đổi, việc cập nhật
  phải atomic và có audit phù hợp.
- Nếu chọn tính động từ `kits.status`, phải không còn chart/report nào phụ thuộc
  mù vào `remaining_quantity`.
- Không thay đổi UI ngoài những gì cần để chứng minh dữ liệu đúng.

## Design Notes

- Commands: không thêm command người dùng.
- Queries: kiểm tra `getKitInventory`, `updateKitStatus`, và mọi mapper summary.
- API: có thể cần server action/helper cập nhật batch tồn kho cùng lúc với KIT.
- Tables: `kit_batches`, `kits`, `audit_events`.
- Domain rules: hiện `updateKitStatus` chỉ cập nhật bảng `kits`; `remaining_quantity`
  được lưu ở `kit_batches`.
- UI surfaces: không đổi UI trừ test/fixtures.
- Dependency: làm trước hoặc cùng `FB-20260621-02` nếu phát hiện tồn kho hiện tại
  có nguy cơ lệch.

## Frontend, Reuse, And Caching Constraints

- Đây là story domain/server; không tạo UI mới nếu không cần.
- Trước khi tạo helper shared, chạy code-deduplication.
- Không thêm TanStack Query.
- Nếu phát sinh migration/RPC, tuân thủ forward-only migration và quy trình chứng
  minh Supabase project trước write.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260621-05 --unit 1 --integration 1 --e2e 0 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Test domain update/tính lại tồn kho khi KIT đổi sang `used` và khi hoàn tác nếu được hỗ trợ. |
| Integration | Test server operation/RPC cập nhật KIT và batch trong cùng contract. |
| E2E | Không bắt buộc trừ khi UI cập nhật trạng thái KIT đổi hành vi. |
| Platform | Bắt buộc nếu có migration/RPC mới. |
| Release | Ghi rõ nguồn sự thật tồn kho đã chọn. |

## Harness Delta

Thêm story packet kỹ thuật để bảo vệ phần 1 của phản hồi khách ngày 2026-06-21.

## Evidence

- Quyết định nguồn sự thật: read model tồn kho KIT hiển thị tính động từ
  `kits.status === "in_stock"`; `kit_batches.remaining_quantity` chỉ còn là dữ
  liệu lưu/snapshot nhập lô và không được mapper dùng mù cho tồn hiển thị.
- Code đã đối chiếu: `getKitInventory` đọc `kit_batches.remaining_quantity` và
  `kits.status`; `updateKitStatus` chỉ cập nhật `kits`, nên tránh mở rộng sang
  DB/RPC trong story này để không thêm write path không atomic.
- Regression RED: `rtk npm exec vitest -- run lib/kit-inventory/inventory.test.ts`
  fail đúng kỳ vọng `expected 2 to be 1` khi batch stale còn `remaining_quantity = 2`
  nhưng một KIT đã `used`.
- GREEN: `rtk npm exec vitest -- run lib/kit-inventory app/dashboard/kits/_components/kit-inventory-page-content.test.tsx`
  pass 6 files / 21 tests, bao gồm mapper unit, server test `getKitInventory`
  với Supabase double, và test page content đã được format lại.
- Gates: `rtk bun run typecheck` pass; `rtk bun run docstring:check` pass;
  `rtk bun run format:check` pass; `rtk bun run react-doctor:diff` pass.
- Không có migration/RPC/live Supabase write; không cần chứng minh project-ref
  write vì không thực hiện DB write.
- GitNexus `detect_changes` báo impact vào flow `KitInventoryPage → DaysUntil`;
  GitNexus không liệt kê file mới `server.test.ts`, nên file mới được đối chiếu
  bằng `git diff --name-only`.
