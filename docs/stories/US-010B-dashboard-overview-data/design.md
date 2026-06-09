# Design

## Domain Model

Dashboard overview đọc dữ liệu đã có:

- `samples` cho count, status, received date và recent samples;
- `kit_batches`/`kits` nếu summary KIT được giữ trong cards;
- `sample_group_conclusions` cho PCR `SẠCH`/`NHIỄM` tối thiểu.

## Application Flow

1. Server Component load dashboard overview data qua US-010A read contract.
2. Component nhận view model typed, không tự query DB.
3. Existing dashboard cards/trend/list chuyển từ hard-coded arrays sang props.
4. Empty/error state không phá layout mobile-first.

## Interface Contract

Không thêm public API. Contract là dashboard overview view model nội bộ:

- cards summary;
- trend points;
- recent sample rows;
- applied default filter summary.

## Data Model

Không thêm schema. Query phải bounded bằng date/window/limit rõ ràng.

## UI / Platform Impact

Sửa dashboard UI nên phải invoke Build Web Apps plugin capability trước
implementation. Nếu thêm reusable component/helper, invoke `code-deduplication`
trước. Table/list surface phải dùng shared primitive phù hợp; nếu là table/list
chính, dùng `DashboardDataTable` hoặc ghi ngoại lệ.

## Observability

Không ghi audit log cho read-only dashboard view. Trace phải ghi rõ dashboard
không còn dùng hard-coded data chính.

## Alternatives Considered

1. Đợi API pivot rồi dashboard gọi API từ client.
   - Bị loại vì dashboard overview có thể là Server Component bounded read.

2. Làm luôn analytics page cùng dashboard overview.
   - Bị loại vì UI và API/pivot contract có blast radius riêng.
