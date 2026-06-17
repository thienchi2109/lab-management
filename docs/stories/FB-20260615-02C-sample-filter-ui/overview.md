# FB-20260615-02C - UI bộ lọc mẫu theo phản hồi khách hàng

## Status

planned

## Lane

high-risk

## Product Contract

Slice này thuộc story cha `FB-20260615-02` và triển khai UI filter sau khi
query/export contract và server options đã sẵn sàng.

## Relevant Product Docs

- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/stories/FB-20260615-02-sample-search-filters/overview.md`

## Acceptance Criteria

- Tiêu đề trang là `DANH SÁCH MẪU`.
- Chú thích nêu đúng phạm vi tra cứu: ngày, loại mẫu, khách hàng, tên công ty,
  nhóm chỉ tiêu.
- Export dữ liệu nằm ở góc trên bên phải và dùng query đã lọc.
- Khoảng ngày có 2 ô cùng dòng, mặc định từ 10 ngày trước đến hôm nay.
- Loại mẫu là dropdown, mặc định `Tất cả`.
- Tên khách hàng là combobox nhập tự do, có dropdown gợi ý khi gõ, mặc định
  `Tất cả`.
- Tên công ty có hành vi giống khách hàng.
- Nhóm chỉ tiêu mặc định `Tất cả`, hỗ trợ chọn nhiều nhóm đang có.
- URL/query state giữ được filter sau submit và pagination.
- UI không còn filter trạng thái mẫu, trạng thái thanh toán và sort direction.

## Design Notes

- Commands: filter form chỉ điều hướng URL, không mutate dữ liệu.
- Queries: form submit ghi query params đã được `02A` whitelist.
- API: export control nhận cùng query filter từ UI.
- Tables: không đọc DB trực tiếp từ component client.
- Domain rules: không đổi thuật toán Kết Quả Chung.
- UI surfaces: `SampleGridPageContent`, filter controls và export controls.

## Frontend, Reuse, And Caching Constraints

- Invoke Build Web Apps plugin capability trước khi implement UI.
- Dùng shared dashboard primitives và `DashboardDataTable`.
- Trước khi thêm combobox/helper dùng lại, chạy `code-deduplication`.
- Không thêm TanStack Query.
- Giữ file dưới 350 dòng; tách component filter nếu
  `SampleGridPageContent` hoặc file liên quan vượt giới hạn.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | URL state helpers và filter value formatting nếu có. |
| Integration | `sample-grid-page-content.test.tsx`, export control query tests. |
| E2E | Browser smoke desktop/mobile cho filter UI và không overflow nếu cần. |
| Platform | Typecheck, React Doctor diff, docstring gate nếu có source export mới. |
| Release | Chưa yêu cầu. |

## Harness Delta

Không có.

## Evidence

Chưa có. Story đang ở trạng thái planned.
