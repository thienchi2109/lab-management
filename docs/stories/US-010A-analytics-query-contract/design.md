# Design

## Domain Model

US-010A chỉ định nghĩa contract đọc và mapping, không thay đổi domain:

- fact chính: `samples`;
- dimensions: ngày nhận, công ty, khách hàng, loại mẫu, loại KIT, nhóm kết quả,
  chỉ tiêu PCR;
- measures: số mẫu, số dương tính, số `SẠCH`, số `NHIỄM`, giá trị trung bình
  khi metric numeric phù hợp;
- actor: session server-side với role `admin`, `editor`, `viewer`.

## Application Flow

1. Parse unknown input bằng Zod.
2. Reject giá trị không whitelist theo error contract đã chọn.
3. Normalize filter summary tiếng Việt.
4. Gọi read port bằng DTO typed.
5. Map aggregate rows sang view model nhỏ, không trả raw DB rows.

## Interface Contract

US-010A chưa tạo HTTP route. Contract là TypeScript module nội bộ cho US-010B/C:

- `AnalyticsQuery`
- `AnalyticsFilterSummary`
- `AnalyticsAggregateRow`
- `AnalyticsReadPort`
- `listAnalyticsDataset(query, actor, port)`

## Data Model

Không thêm schema. Nếu query hiện tại thiếu index/RPC, ghi bằng chứng vào
US-010E thay vì xử lý trong US-010A.

## UI / Platform Impact

Không sửa UI. Không cần Build Web Apps trong slice này trừ khi scope bị mở.

## Observability

Tests phải chứng minh không có raw SQL input path và query rộng có guard
limit/filter.

## Alternatives Considered

1. Tạo API trước rồi mới tách parser.
   - Bị loại vì API sẽ khóa contract quá sớm khi read model chưa có tests.

2. Tái sử dụng trực tiếp sample grid parser.
   - Bị loại vì grid và analytics có dimensions/measures khác nhau.
