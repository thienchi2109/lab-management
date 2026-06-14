# Design

## Domain Model

Story này không đổi domain model. `samples` vẫn là bản ghi metadata mẫu hiện
tại; dữ liệu kết quả, ảnh và audit không thuộc scope.

## Application Flow

Luồng xem:

1. Người dùng chọn hành động xem trong row Samples.
2. Client mở read-only side sheet bằng `SideSheetFrame`.
3. Side sheet hiển thị metadata đã có trong row: mã mẫu, khách hàng, công ty,
   loại mẫu, ngày nhận, trạng thái, thanh toán, lô KIT và ghi chú.
4. Side sheet có link hoặc action phụ tới trang nhập kết quả nếu role hiện tại
   được phép theo luồng hiện có.

Luồng sửa:

1. Admin hoặc Editor chọn `Cập nhật`.
2. Client mở `EditSampleDialog` hiện có bằng `SideSheetFrame`.
3. Server action update giữ role guard hiện có.
4. Sau khi lưu, server revalidate `/dashboard/samples`.

## Interface Contract

- View side sheet không mutate state.
- Edit action giữ contract form hiện tại của `updateSampleMetadataAction`.
- Viewer không thấy nút cập nhật.
- Error copy phải dùng tiếng Việt có dấu.

## Data Model

Không có migration. Nếu trong khi triển khai phát hiện cần schema cho phần xoá
mềm, dừng lại và chuyển sang `ISSUE-12B-samples-bulk-soft-delete`.

## UI / Platform Impact

Trang Samples tiếp tục dùng `DashboardDataTable`. Row actions trong story này:

- Xem: mở side sheet read-only.
- Cập nhật: chỉ Admin/Editor, mở edit side sheet.
- Nhập kết quả: giữ link hiện có.

Không thêm `Checkbox`, bulk toolbar, destructive confirm hoặc global confirm
primitive trong story này. Các phần đó thuộc `ISSUE-12B`.

## Observability

Story này không thêm audit event mới. Trace Harness cần ghi rõ không có DB write
hoặc migration.

## Alternatives Considered

1. Giữ chung với xoá mềm.
   - Bị loại vì scope xoá mềm high-risk làm story view/edit quá lớn.

2. Tách view-only và edit riêng.
   - Chưa cần vì edit side sheet đã tồn tại; view/edit cùng bề mặt UI nhỏ.
