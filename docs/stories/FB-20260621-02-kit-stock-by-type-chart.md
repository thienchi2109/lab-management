# FB-20260621-02 - Biểu đồ tồn kho KIT theo loại

## Status

planned

## Lane

normal

## Product Contract

Phần `Số lượng kit tồn kho` của tab `Kho KIT` phải hiển thị biểu đồ cột ngang
cho từng loại KIT. Số lượng tồn của mỗi loại phải dựa trên số KIT nhận vào trừ
số KIT đã sử dụng theo hợp đồng dữ liệu được xác nhận trong story này.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/stories/US-005-kit-inventory-module/overview.md`
- `docs/stories/FB-20260621-01-kit-inventory-layout.md`

## Acceptance Criteria

- Có biểu đồ cột ngang hiển thị mỗi loại KIT và số lượng tồn tương ứng.
- Dữ liệu chart được tổng hợp theo `kitType`, không theo từng mã KIT đơn lẻ.
- Empty state rõ ràng khi chưa có loại KIT hoặc chưa có tồn kho.
- Công thức tồn kho được test bằng fixture có `received_quantity`,
  `remaining_quantity`, KIT `used`, và KIT `in_stock`.
- Nếu công thức hiện tại chưa đủ tin cậy, story phải dừng ở bước design và tạo
  follow-up cho reconciliation thay vì tự sửa rộng.

## Design Notes

- Commands: không thêm command người dùng.
- Queries: mở rộng `getKitInventory` hoặc mapper domain để trả về summary theo
  loại KIT.
- API: không đổi route; có thể mở rộng view model `KitInventory`.
- Tables: `kit_types`, `kit_batches`, `kits`.
- Domain rules: hiện `remaining_quantity` tồn tại theo lô, nhưng status KIT
  cũng có `used`; cần chọn một nguồn sự thật và test chống lệch.
- UI surfaces: phần 1 trong `/dashboard/kits`.
- Dependency: nên làm sau `FB-20260621-01`; có thể cần `FB-20260621-05` nếu phát
  hiện `remaining_quantity` không tự đồng bộ khi KIT chuyển sang `used`.

## Frontend, Reuse, And Caching Constraints

- Dùng shared dashboard section primitives nếu có; chỉ tạo chart component mới
  khi code-deduplication chứng minh chưa có chart ngang phù hợp.
- Chart phải responsive, có nhãn số lượng đọc được trên desktop và mobile.
- Không thêm client-cache library; dữ liệu load từ Server Component hiện tại.
- Trước khi triển khai UI/chart, dùng Build Web Apps plugin capability theo
  Harness.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260621-02 --unit 1 --integration 1 --e2e 1 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Test mapper tính tồn theo loại KIT từ fixture nhiều lô và nhiều status. |
| Integration | Test render chart với dữ liệu inventory đã tổng hợp. |
| E2E | Browser check `/dashboard/kits` xác nhận chart không trống và nhãn không chồng. |
| Platform | Không bắt buộc. |
| Release | Screenshot chart ở desktop và mobile. |

## Harness Delta

Thêm story packet mới cho phần 1 của phản hồi khách ngày 2026-06-21.

## Evidence

Chưa có.
