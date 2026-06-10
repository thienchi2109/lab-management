# Design

## Interface Contract

Dashboard overview nên là màn hình scan nhanh:

- top section nêu trạng thái tổng quan và thời điểm dữ liệu;
- metric cards phân cấp theo mức quan trọng thay vì mọi card giống nhau;
- trend/PCR/recent samples giữ cùng nhịp spacing;
- trạng thái ít dữ liệu vẫn cho biết app đang hoạt động bình thường.

## Data Flow

Giữ Server Component/read-port flow hiện có. UI chỉ nhận view model đã typed và
render presentation.

## Testing Focus

Kiểm tra card hierarchy, empty/low-data branch, mobile stack và không phá
snapshot/expectation của dashboard data tests hiện tại.
