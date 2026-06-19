# PERF-20260619-02 - Lazy metadata cho overlay tạo mẫu

## Status

planned

## Lane

normal

## Product Contract

Dashboard phải vào nhanh cho mọi vai trò. Dữ liệu metadata nặng của form tạo/sửa
mẫu chỉ được tải khi người dùng admin/editor thật sự mở luồng tạo hoặc sửa mẫu,
không nằm trong đường load mặc định của dashboard shell.

## Relevant Product Docs

- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`
- `docs/product/data-model.md`

## Acceptance Criteria

- Viewer không gọi metadata tạo/sửa mẫu từ dashboard shell.
- Admin/editor vẫn có CTA tạo mẫu và mở được form tạo mẫu.
- Metadata cho form tạo mẫu được tải theo nhu cầu, không tải toàn bộ mẫu từ
  layout.
- Payload metadata không chứa danh sách mẫu không phân trang nếu form tạo mẫu
  chỉ cần reference data.
- Không thêm TanStack Query trừ khi implementation chứng minh có nhu cầu
  client-cache cụ thể cho overlay đang mở.

## Design Notes

- Commands: giữ nguyên server actions tạo/sửa mẫu hiện có.
- Queries: tách reference metadata tối thiểu cho form tạo mẫu khỏi sample grid
  dataset.
- API: ưu tiên server action hoặc route read nhỏ, tenant-scoped, parse-first.
- Tables: đọc `companies`, `customers`, `sample_types`, `kit_batches`,
  `result_groups`; không đọc toàn bộ `samples` nếu không cần.
- Domain rules: admin/editor được tạo/sửa mẫu; viewer chỉ đọc.
- UI surfaces: dashboard shell, topbar CTA, sample create overlay.

## Frontend, Reuse, And Caching Constraints

- Dùng các component overlay/form hiện có trước khi thêm component mới.
- Nếu tạo hook/helper dùng lại cho metadata lazy-load, chạy code-deduplication
  trước.
- Server-state mặc định vẫn là Server Components, server actions,
  `useActionState`, `revalidatePath`.
- TanStack Query chỉ được thêm khi story được cập nhật với yêu cầu cache cụ thể:
  cache key, stale time, invalidation sau tạo/sửa mẫu, và fallback khi lỗi.

## Validation

| Layer       | Expected proof                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------- |
| Unit        | Test dashboard layout không fetch metadata cho viewer và test admin/editor mở overlay vẫn lấy metadata.        |
| Integration | Test loader/action metadata chỉ lấy reference data cần thiết, không lấy toàn bộ `samples` khi mở form tạo mẫu. |
| E2E         | Browser smoke admin mở form tạo mẫu, viewer không thấy CTA tạo mẫu.                                            |
| Platform    | `bun run typecheck`, `bun run react-doctor:diff`.                                                              |
| Release     | So sánh production request waterfall trước/sau nếu có điều kiện, không yêu cầu thêm log mới.                   |

## Harness Delta

Không có.

## Evidence

Chưa có. Story đang ở trạng thái planned.
