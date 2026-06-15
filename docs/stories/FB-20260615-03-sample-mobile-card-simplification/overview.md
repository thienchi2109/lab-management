# FB-20260615-03 - Rút gọn card mẫu mobile

## Trạng thái

planned

## Lane

normal

## Intake

- Input type: Change request từ phản hồi khách hàng ngày 2026-06-15.
- Risk flags: Frontend/UI, Shared code, Existing behavior, Weak proof.
- Lý do normal: thay đổi cách hiển thị danh sách mẫu, không đổi data model hoặc
  API nếu giữ trong `DashboardDataTable`/caller hiện có.

## Product Contract

- `docs/product/ui-contract.md` - mobile-first card/accordion và data grid modes.
- `docs/stories/US-016C-samples-polish/overview.md` - polish samples hiện tại.

## Current Behavior

Danh sách mẫu dùng `DashboardDataTable`, mobile vẫn lấy `Mã mẫu` làm primary
field và còn render `Tùy chọn cột`, `Cột kết quả desktop`.

## Target Behavior

- Mobile card ngắn hơn, viền rõ hơn, ít khoảng trống hơn.
- Một khung hình điện thoại có thể thấy khoảng 4 mẫu khi dữ liệu thực tế đủ
  ngắn.
- Không hiển thị `Mã mẫu` ở danh sách bên ngoài trên mobile.
- `Mã mẫu` vẫn tồn tại và vẫn hiển thị trong xem chi tiết từng mẫu.
- Card ưu tiên: ngày, loại mẫu, tên khách, tên công ty, trạng thái, nhóm chỉ
  tiêu, kết quả chung.
- Bỏ `Tùy chọn cột` và `Cột kết quả desktop` khỏi trang Mẫu.

## Acceptance Criteria

- Mobile card không hiển thị `Mã mẫu`.
- Desktop/table không bị mất dữ liệu cần thiết nếu vẫn cần mã mẫu ở desktop.
- `Xem chi tiết` vẫn hiển thị mã mẫu.
- Không còn 2 khối tùy chọn cột/result desktop trên trang Mẫu.
- Action `Mở kết quả` vẫn dễ chạm trên mobile.

## Non-Goals

- Không đổi query/filter.
- Không đổi result engine.
- Không đổi mã mẫu hoặc generation logic.

