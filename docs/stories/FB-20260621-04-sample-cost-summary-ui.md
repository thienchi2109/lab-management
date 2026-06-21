# FB-20260621-04 - UI tổng hợp chi phí hiện tại trong Kho KIT

## Status

planned

## Lane

normal

## Product Contract

Phần `Chi phí hiện tại` của tab `Kho KIT` phải cho phép lọc theo tình trạng chi
phí của mẫu và hiển thị tổng chi phí cho các nhóm: `Tiền mặt thu được`, `Nhận
chuyển khoản`, `Ghi hóa đơn`, và `Khác`.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/stories/FB-20260621-01-kit-inventory-layout.md`
- `docs/stories/FB-20260621-03-sample-cost-data-contract.md`

## Acceptance Criteria

- Phần 2 hiển thị bốn tổng chi phí theo đúng nhãn khách yêu cầu.
- Có bộ lọc tình trạng chi phí của mẫu; bộ lọc dùng contract từ
  `FB-20260621-03`.
- Tổng tiền định dạng nhất quán, không hiển thị giá trị `NaN`, `null`, hoặc số
  âm ngoài ý nghĩa nghiệp vụ đã được xác nhận.
- Empty state rõ ràng khi chưa có mẫu có chi phí.
- Không thay đổi hành vi danh sách mẫu trừ khi có story riêng.

## Design Notes

- Commands: không thêm command người dùng.
- Queries: consume read model/RPC từ `FB-20260621-03`.
- API: không thêm client fetch nếu Server Component có thể tải dữ liệu.
- Tables: không đổi ở story này.
- Domain rules: chỉ render dữ liệu đã được normalize; không tự map trạng thái
  chi phí trong component nếu server contract đã có.
- UI surfaces: phần 2 trong `/dashboard/kits`.
- Dependency: phải làm sau `FB-20260621-03`; nên làm sau `FB-20260621-01`.

## Frontend, Reuse, And Caching Constraints

- Dùng shared filter/select và dashboard primitives hiện có.
- Trước khi tạo summary card/component mới, chạy code-deduplication.
- Không thêm TanStack Query; ưu tiên Server Component và URL/search params nếu
  bộ lọc cần shareable state.
- Trước khi triển khai UI, dùng Build Web Apps plugin capability theo Harness.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260621-04 --unit 1 --integration 1 --e2e 1 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Test format tiền, nhãn nhóm, và empty state. |
| Integration | Test render với nhiều trạng thái chi phí và filter đang chọn. |
| E2E | Browser check `/dashboard/kits` xác nhận filter và tổng tiền cập nhật đúng. |
| Platform | Không bắt buộc nếu không có migration. |
| Release | Screenshot phần `Chi phí hiện tại`. |

## Harness Delta

Thêm story packet UI cho phần 2 của phản hồi khách ngày 2026-06-21.

## Evidence

Chưa có.
