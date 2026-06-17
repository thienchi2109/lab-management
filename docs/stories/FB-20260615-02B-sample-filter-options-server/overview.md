# FB-20260615-02B - Server/options cho bộ lọc mẫu

## Status

planned

## Lane

normal

## Product Contract

Slice này thuộc story cha `FB-20260615-02` và cung cấp server payload cho các
filter nghiệp vụ: loại mẫu, khách hàng, công ty và nhóm chỉ tiêu.

## Relevant Product Docs

- `docs/product/data-model.md`
- `docs/product/ui-contract.md`
- `docs/stories/FB-20260615-02-sample-search-filters/overview.md`
- `docs/stories/FB-20260615-04-sample-multi-result-groups/overview.md`

## Acceptance Criteria

- Page payload có option loại mẫu đang dùng trong tổ chức.
- Page payload có gợi ý khách hàng và công ty từ dữ liệu hiện có.
- Customer/company filter chấp nhận text tự do và vẫn có thể chọn từ gợi ý.
- Page payload có option nhóm chỉ tiêu active, tương thích contract
  `sample_result_groups` từ `FB-20260615-04`.
- Server list samples áp dụng filter ngày, loại mẫu, khách hàng, công ty và
  nhóm chỉ tiêu theo contract `FB-20260615-02A`.
- Pagination/count không bị duplicate khi lọc nhiều nhóm chỉ tiêu.

## Design Notes

- Commands: không mutate dữ liệu.
- Queries: mở rộng `listSampleGridPage` và Supabase adapter theo filter
  contract đã khóa ở `02A`.
- API: không thêm endpoint public mới nếu page server payload đủ dùng.
- Tables: đọc `samples`, `sample_types`, `customers`, `companies`,
  `result_groups`, `sample_result_groups`.
- Domain rules: tenant scope theo organization hiện có.
- UI surfaces: chưa render final filter UI trong slice này.

## Frontend, Reuse, And Caching Constraints

- Không thêm TanStack Query.
- Ưu tiên server components/server actions và `revalidatePath` hiện có.
- Nếu cần helper option dùng lại, chạy `code-deduplication` trước khi thêm.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Option normalization và filter mapping tests. |
| Integration | `lib/sample-grid/operations.test.ts`, server adapter tests. |
| E2E | Không yêu cầu. |
| Platform | `bun run typecheck`, `bun run react-doctor:diff`. |
| Release | Chưa yêu cầu. |

## Harness Delta

Không có.

## Evidence

Chưa có. Story đang ở trạng thái planned.
