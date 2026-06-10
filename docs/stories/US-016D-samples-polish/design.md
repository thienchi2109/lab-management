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
