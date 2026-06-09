# Design

## Domain Model

UI chỉ dùng analytics DTO/response từ US-010A/C. Không tự tạo dimensions hoặc
measure ngoài whitelist.

## Application Flow

1. Server route đọc URL/search params và options cần thiết.
2. Filter form cập nhật URL hoặc gọi action/API theo contract đã chọn.
3. UI hiển thị filter summary, chart/table state, empty/error/loading.
4. Viewer chỉ xem, không thấy hành động mutation.

## Interface Contract

Route: `/dashboard/analytics`

UI states:

- initial default filter;
- filtered result;
- empty dataset;
- validation warning;
- API/server error;
- mobile compact view;
- desktop chart/table view.

## Data Model

Không thêm schema. Nếu UI cần options thiếu index/RPC, ghi vào US-010E.

## UI / Platform Impact

Phải invoke Build Web Apps plugin capability trước implementation. Phải invoke
`code-deduplication` trước reusable chart/filter/table helper. Table/list
surface phải dùng `DashboardDataTable` nếu phù hợp. Không thêm TanStack Query
nếu chưa ghi client-cache requirement.

## Observability

Browser proof phải ghi viewport desktop/mobile, role Viewer và no error overlay.

## Alternatives Considered

1. Làm chart đẹp đầy đủ ngay.
   - Bị loại; MVP ưu tiên filter summary, data contract và states đúng.

2. Làm report table trước chart.
   - Chấp nhận nếu chart package chưa sẵn sàng, nhưng phải ghi rõ trong
     validation và không làm lệch product contract lâu dài.
