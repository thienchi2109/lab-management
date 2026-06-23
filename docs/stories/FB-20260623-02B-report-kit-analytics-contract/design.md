# Design

## Domain Model

Các metric báo cáo phải được đặt tên theo domain thay vì tên UI tạm:

- `totalKitQuantity`: tổng lượng kit trong phạm vi filter.
- `sampleType`: loại mẫu từ `sample_types`.
- `kitType`: loại KIT từ `kit_types`.
- `sampleClassification`: phân loại `customer` hoặc `internal`, hiển thị là
  `Mẫu khách hàng` hoặc `Mẫu nội bộ`.
- `generalPcrConclusion`: kết quả chung PCR đã chuẩn hóa về `SẠCH`, `NHIỄM`
  hoặc trạng thái rỗng nếu không đủ dữ liệu.

Nếu `totalKitQuantity` không thể suy ra đúng từ `samples.kit_batch_id`,
`kit_batches.received_quantity`, `kit_batches.remaining_quantity` hoặc `kits`,
story phải dừng để chốt nguồn dữ liệu với người dùng.

## Application Flow

1. Đọc lại analytics graph/context và live DB bằng
   `mcp__supabase_lab_management`.
2. Viết RED tests cho parser/read contract mới trước khi đổi adapter.
3. Mở rộng read contract hoặc thêm use case riêng cho chart dataset.
4. Chứng minh output trả đúng các series cần cho 4 biểu đồ từ fixture deterministic.
5. Chỉ nếu cần DB write, chứng minh namespace `mcp__supabase_lab_management`,
   project-ref `tuuqgpzgollcerqqszjr`, migration history và target
   table/function trước khi apply migration forward-only.

## Interface Contract

Nên ưu tiên một contract đọc rõ mục đích, ví dụ:

- `GET` hoặc `POST /api/analytics/report-charts`.
- Input: khoảng ngày bắt buộc, filter tùy chọn theo chart.
- Output: danh sách chart dataset đã chuẩn hóa gồm `chartId`, `title`,
  `segments`, `total`, `filterSummary`, `warnings`.

Nếu tái dùng `/api/analytics/pivot`, phải chứng minh không làm mơ hồ contract
pivot hiện tại và không phá US-010C/US-010D.

## Data Model

Target tables dự kiến:

- `samples`
- `sample_types`
- `kit_batches`
- `kit_types`
- `kits`
- `sample_group_conclusions`
- `sample_result_groups` nếu cần xác định nhóm PCR

Potential gap:

- Cần nguồn chuẩn cho `sampleClassification`.
- Cần nguồn chuẩn cho `totalKitQuantity`.
- Cần dữ liệu hoặc fixture có `tôm PL`, `SẠCH`, `NHIỄM`.

Không sửa migration đã apply; mọi correction schema phải là migration mới.

## UI / Platform Impact

Không có UI trong story này. UI chart thuộc `FB-20260623-02C`.

Nếu implementation chạm shared helper/service, phải invoke `code-deduplication`
trước khi tạo helper mới.

## Observability

- Error public phải dùng thông báo an toàn, không lộ Supabase/service-role
  details.
- Nếu thêm endpoint mới, route test phải khóa 401/403/400/500 fallback.
- Nếu thêm query mới, validation evidence phải ghi rõ fixture và live DB read
  proof đã dùng.

## Alternatives Considered

1. Dựng UI trước rồi chỉnh contract sau.
   - Bị loại vì feedback phụ thuộc nhiều cột nghiệp vụ còn thiếu nghĩa rõ.
2. Gộp data contract với 4 pie chart.
   - Bị loại vì diff sẽ vừa đổi đọc dữ liệu, API và UI chart.
3. Suy ra `Mẫu nội bộ` từ `customer_name`.
   - Bị loại nếu không có quy tắc sản phẩm rõ; tên khách hàng là dữ liệu nhập tự
     do, không phải enum domain.
