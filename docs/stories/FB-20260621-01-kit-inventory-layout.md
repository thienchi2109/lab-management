# FB-20260621-01 - Sắp xếp lại tab Kho KIT theo ba phần

## Status

planned

## Lane

tiny

## Product Contract

Tab `Kho KIT` phải được chia thành ba phần rõ ràng theo phản hồi khách hàng:
`Số lượng kit tồn kho`, `Chi phí hiện tại`, và nhóm thao tác quản trị KIT hiện
có. Story này chỉ tạo khung bố cục và di chuyển nhóm thao tác hiện tại xuống
phần 3; không thêm biểu đồ hoặc logic chi phí.

## Relevant Product Docs

- `docs/product/overview.md`
- `docs/stories/US-005-kit-inventory-module/overview.md`

## Acceptance Criteria

- Trang `/dashboard/kits` hiển thị ba phần theo đúng thứ tự khách yêu cầu.
- Phần 3 giữ các thao tác hiện có: `Tạo loại KIT`, `Tạo lô KIT`, `Thêm KIT`.
- Bảng KIT hiện tại vẫn hoạt động và không mất bộ lọc `Trạng thái`, `Loại KIT`.
- Phần 1 và phần 2 có trạng thái chờ dữ liệu phù hợp nếu các story phụ thuộc
  chưa được triển khai.

## Design Notes

- Commands: không đổi ở story này.
- Queries: dùng dữ liệu `getKitInventory` hiện có.
- API: không đổi.
- Tables: không đổi.
- Domain rules: không đổi công thức tồn kho hoặc chi phí.
- UI surfaces: `lab-kit-app/app/dashboard/kits/_components/kit-inventory-client.tsx`.
- Dependency: có thể triển khai trước các story chart/chi phí.

## Frontend, Reuse, And Caching Constraints

- Bắt buộc dùng shared layout, button, filter, dialog, và `DashboardDataTable`
  hiện có.
- Trước khi tạo component section/card tái sử dụng, chạy workflow
  code-deduplication và kiểm tra các component dashboard hiện có.
- Không thêm TanStack Query; tiếp tục dùng Server Component + server action +
  `revalidatePath`.
- Trước khi triển khai UI, dùng Build Web Apps plugin capability theo Harness.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id FB-20260621-01 --unit 1 --integration 1 --e2e 1 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | Test render xác nhận thứ tự ba phần và sự tồn tại của các nút thao tác KIT. |
| Integration | Test page content với fixture inventory hiện có. |
| E2E | Browser check `/dashboard/kits` bằng tài khoản admin. |
| Platform | Không bắt buộc. |
| Release | Screenshot hoặc snapshot sau khi layout ổn định. |

## Harness Delta

Thêm story packet mới cho phản hồi khách ngày 2026-06-21.

## Evidence

Chưa có.
