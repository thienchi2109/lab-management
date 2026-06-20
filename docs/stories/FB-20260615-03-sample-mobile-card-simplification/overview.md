# FB-20260615-03 - Rút gọn card mẫu mobile

## Trạng thái

implemented

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
- Trên mobile, filter/search không chiếm viewport mặc định; chỉ mở khi người
  dùng cần tìm kiếm hoặc lọc.
- Mobile dùng bottom sheet filter, chừa vùng cho bottom navigation.

## Acceptance Criteria

- Mobile card không hiển thị `Mã mẫu`.
- Desktop/table không bị mất dữ liệu cần thiết nếu vẫn cần mã mẫu ở desktop.
- `Xem chi tiết` vẫn hiển thị mã mẫu.
- Không còn 2 khối tùy chọn cột/result desktop trên trang Mẫu.
- Action `Mở kết quả` vẫn dễ chạm trên mobile.
- Mobile hiển thị toolbar search-first trước danh sách card.
- Bottom sheet mobile có search, ngày nhận, loại mẫu, khách hàng, công ty,
  nhóm chỉ tiêu, `Áp dụng` và `Xóa lọc`.

## Implementation Notes

- Mobile list dùng slot `mobileCard` hẹp trên `DashboardDataTable`; default
  fallback của shared table giữ nguyên cho các caller khác.
- Samples render `SampleGridMobileCard` theo hướng Stitch Clinical Grid:
  khách hàng làm tiêu đề, trạng thái ở góc phải, ngày/loại mẫu dạng metadata,
  công ty muted, Nhóm chỉ tiêu/KQ chung nằm trong result band riêng.
- `Mã mẫu` vẫn nằm ở desktop table và result viewer, nhưng không render trong
  mobile list card.
- Follow-up ngày 2026-06-20 chọn Stitch MCP phương án 2: mobile toolbar gồm
  search button và filter badge; desktop giữ filter inline.
- `SampleGridFilterForm` dùng chung field/query contract cho desktop inline và
  mobile bottom sheet để tránh lệch filter.
- `BottomSheetFrame` mở rộng từ overlay primitive hiện có, dùng lại scroll lock
  và focus handling, đồng thời đặt sheet phía trên bottom navigation.

## Non-Goals

- Không đổi query/filter.
- Không đổi result engine.
- Không đổi mã mẫu hoặc generation logic.
