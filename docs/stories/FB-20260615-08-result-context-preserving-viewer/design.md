# Design

## Direction

Triển khai viewer kết quả theo hướng overlay mở từ danh sách mẫu để giữ context.
Tránh modal chồng modal; chỉ dùng một drawer/dialog cấp cao cho phiên xem kết
quả. Bên trong overlay dùng tab hoặc segmented controls cho các vùng nội dung.

## Interface Contract

- Trigger chính là hành động `Xem kết quả` trên danh sách mẫu.
- Overlay giữ người dùng ở trang danh sách, không reset server/client state của
  bảng mẫu.
- `Thông tin mẫu` trình bày metadata cần thiết cho quyết định nghiệp vụ.
- `Kết quả` tái dùng result group UI hiện có, giữ quyền nhập/sửa và read-only.
- `Ảnh` được đặt thành tab riêng khi workflow upload/delete cần không gian riêng;
  nếu chỉ là tham chiếu phụ thì đặt cuối tab `Kết quả`.
- Route kết quả hiện tại vẫn hoạt động cho deep link hoặc fallback.

## Component Scope

- Danh sách mẫu và action `Xem kết quả`.
- Shell overlay responsive cho result viewer.
- Nội dung kết quả hiện tại nếu có thể tách/reuse từ trang kết quả.
- Tests cho preserve context, close behavior, read-only/edit behavior và mobile
  overflow.

## Required Discovery

- Xác định `Xem kết quả` hiện nằm ở component nào và đang dùng route nào.
- Kiểm tra state danh sách mẫu hiện được lưu ở URL, server query, client state
  hay table state cục bộ.
- Kiểm tra trang kết quả hiện có thể tách phần nội dung thành component dùng lại
  hay không.
- Kiểm tra có guard unsaved changes hiện hữu không trước khi thêm close behavior.

## Error Handling

- Nếu load dữ liệu kết quả lỗi, overlay hiển thị lỗi trong viewer và không làm
  mất context danh sách.
- Nếu người dùng không có quyền sửa, viewer phải read-only như route hiện tại.
- Nếu có thay đổi chưa lưu, đóng overlay không được âm thầm bỏ dữ liệu.

## Testing Focus

- Context danh sách không reset sau khi mở/đóng viewer.
- Viewer không phá deep link route hiện tại.
- Mobile drawer/dialog không overflow và focus/close hoạt động đúng.
- Save/read-only behavior giữ nguyên so với trang kết quả hiện tại.
