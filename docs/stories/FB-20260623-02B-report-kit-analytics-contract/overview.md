# FB-20260623-02B - Hợp đồng dữ liệu biểu đồ kit trong Báo cáo

## Current Behavior

Tab `Báo cáo` hiện có pivot analytics bounded theo ngày nhận mẫu và chỉ tiêu
PCR. Query contract đã whitelist một số dimension như `sampleType` và `kitType`,
nhưng adapter đọc dữ liệu hiện mới xử lý rõ `receivedDate` và `pcrMetric`.

Live DB hiện có `samples`, `sample_types`, `kit_batches`, `kit_types`,
`sample_group_conclusions` và `sample_images`. Chưa có cột chuẩn cho `Phân loại`
theo nghĩa `Mẫu khách hàng` / `mẫu nội bộ`, và chưa có cột rõ ràng tên `tổng số
lượng kit` trên từng mẫu.

## Target Behavior

Khóa hợp đồng dữ liệu cho các biểu đồ khách yêu cầu trước khi dựng UI:

- Tổng lượng kit theo `Loại mẫu`.
- Tổng lượng kit theo `Loại kit`.
- Tổng lượng mẫu sử dụng theo `Phân loại` (`Mẫu khách hàng` hoặc `mẫu nội bộ`).
- Tổng lượng sạch của `tôm PL` theo `Kết quả chung_PCR` (`SẠCH` hoặc `NHIỄM`).

Story này chỉ định nghĩa và chứng minh read contract. UI pie chart, filter
riêng từng biểu đồ, lưu cấu hình filter và ảnh báo cáo thuộc các story sau.

## Affected Users

- Admin: cần số liệu đúng để cấu hình báo cáo cho Viewer.
- Viewer: cần xem biểu đồ không bị suy diễn sai nguồn dữ liệu.
- Reviewer: cần thấy rõ nguồn sự thật trước khi UI được dựng.

## Affected Product Docs

- `docs/product/overview.md`
- `docs/product/data-model.md`
- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/stories/US-010-dashboard-pivot-analytics/overview.md`

## Non-Goals

- Không dựng biểu đồ tròn.
- Không lưu filter mặc định của Admin.
- Không thêm gallery ảnh báo cáo.
- Không đổi thuật toán tính `Kết quả chung_PCR`.
- Không tự đoán nghĩa `tổng số lượng kit` hoặc `Phân loại` nếu dữ liệu hiện có
  chưa đủ.
