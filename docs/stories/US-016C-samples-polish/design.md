# Design

## Interface Contract

Samples page nên ưu tiên thao tác dữ liệu:

- filter/search nằm trong vùng kiểm soát rõ, không làm hẹp bảng quá mức;
- row typography giúp phân biệt mã mẫu, trạng thái, khách hàng và thời điểm;
- actions có icon/text đủ rõ và không tranh chấp với nội dung chính;
- mobile card giữ thông tin tối thiểu cần quyết định bước tiếp theo.

## Data Flow

Giữ server-side pagination/filter/sort và URL state hiện tại. Không đưa thêm
client cache hoặc local derived state phức tạp.

## Testing Focus

Kiểm tra URL state, table/card rendering, Viewer read-only actions, no-overflow
desktop/mobile và các loading/error route.

## Implementation Insights Sau US-016C

- Không tạo table samples riêng khi nhu cầu là polish scanability. Mở rộng
  `DashboardDataTable` bằng biến thể có default an toàn giúp dashboard, samples,
  kits và analytics tiếp tục cùng một contract responsive.
- Table/list polish nên tách làm 2 lớp: shared styling primitive
  (`density`, `tone`, empty action, mobile primary action) và domain-specific
  cells/action labels ở caller. Cách này giữ blast radius nhỏ và dễ test bằng
  render-to-static.
- Với trang dữ liệu dày, desktop có thể dùng compact rows, muted header và hover
  nhẹ; mobile cần rút xuống action chính, không cố render mọi column trong card.
- Khi extract helper khỏi file samples để giữ giới hạn 350 dòng, đặt cạnh owner
  route và giữ API bằng `SampleGridPage`; không đưa vào shared lib nếu helper
  chỉ phục vụ URL state của samples.
- React Doctor `--staged` có thể báo false positive `deslop/unused-dependency`
  khi chỉ scan staged files. Đối chiếu bằng `react-doctor:diff --verbose` và
  full `react-doctor:verbose` trước khi xem đó là blocker của polish.
