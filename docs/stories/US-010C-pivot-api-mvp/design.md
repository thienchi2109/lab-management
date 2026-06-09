# Design

## Domain Model

API pivot dùng contract/read port từ US-010A, không tự định nghĩa query
semantics mới.

## Application Flow

1. Route handler nhận `POST`.
2. Require current session và read actor.
3. Parse body bằng Zod analytics schema.
4. Gọi analytics use case.
5. Trả response normalized hoặc standard error.

## Interface Contract

`POST /api/analytics/pivot`

Request:

- `dimensions`
- `measures`
- `filters`
- `page`
- `pageSize`

Response:

- `rows`
- `totals`
- `filterSummary`
- `warnings`

Errors: `401`, `403`, `400`, `422`.

## Data Model

Không thêm schema. Nếu query route chứng minh cần DB support, chuyển bằng chứng
sang US-010E.

## UI / Platform Impact

Không sửa UI trong slice này. Không cần Build Web Apps trừ khi scope mở.

## Observability

Không log raw payload chứa nhiều dữ liệu người dùng. API errors không được log
secret hoặc PII dư thừa. Read-only pivot không ghi audit log.

## Alternatives Considered

1. Dùng GET với query string.
   - Bị loại cho pivot MVP vì dimensions/measures/filters có cấu trúc.

2. Gộp API với analytics page.
   - Bị loại để API contract được test độc lập trước UI.
