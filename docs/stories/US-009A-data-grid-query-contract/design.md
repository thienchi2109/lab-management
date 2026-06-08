# Design

## Domain Model

US-009A tạo read contract xoay quanh `samples` và metadata cần cho bảng mẫu cơ
bản. Kết quả động và ảnh chỉ xuất hiện dưới dạng summary tối thiểu nếu contract
hiện có đã hỗ trợ rẻ; nếu cần query phức tạp thì defer sang US-009B hoặc
US-009D.

Contract phải giữ tenant isolation, role authorization, và whitelist
filter/sort để client không mở truy vấn tùy ý.

## Application Flow

1. Server nhận `searchParams` từ route dashboard.
2. Parser chuẩn hóa page, page size, search text, filter keys, sort key, và sort
   direction.
3. Invalid input bị fallback an toàn hoặc reject có kiểm soát.
4. Query server trả về một page dữ liệu, tổng số dòng, và filter metadata tối
   thiểu.
5. US-009B dùng contract này để render grid.

## Interface Contract

- Page bắt đầu từ default rõ ràng.
- Page size có giới hạn tối đa.
- Search text được trim và giới hạn độ dài.
- Sort chỉ nhận key whitelist.
- Filter chỉ nhận key/value whitelist.
- Response không chứa result matrix rộng hoặc payload ảnh đầy đủ.

## Data Model

Ưu tiên dùng schema/query hiện có. Không thêm migration trong US-009A trừ khi có
bằng chứng query không thể paginate/filter/sort an toàn. Nếu cần DB write, dừng
và chuyển sang US-009E.

## UI / Platform Impact

Không có UI lớn trong slice này. Nếu cần thêm helper dùng lại cho UI sau, phải
invoke `code-deduplication` trước khi tạo.

## Observability

Log lỗi normalize/query theo dạng không chứa dữ liệu nhạy cảm. Không log toàn
bộ search text dài, payload filter thô, hoặc dữ liệu kết quả mẫu.

## Alternatives Considered

1. Dựng UI trước rồi chỉnh query sau.
   - Bị loại vì dễ tạo bảng hoạt động được nhưng thiếu proof server-side.

2. Khóa query contract trước.
   - Được chọn vì giảm diff PR đầu tiên và tạo nền cho các slice UI.
