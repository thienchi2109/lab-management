# Design

## Interface Contract

Analytics page nên tách rõ:

- vùng filter;
- vùng applied summary;
- vùng chart insight;
- vùng pivot table/detail;
- trạng thái no-data/error/loading.

Filter controls không được chiếm quá nhiều chiều cao trên desktop, nhưng trên
mobile phải đủ rộng để thao tác chính xác.

## Data Flow

Giữ route và API contract hiện có. Client interactivity chỉ phục vụ filter UI và
rendering, không thêm cache layer mới.

## Testing Focus

Kiểm tra filter summary, no-data branch, mobile table/card behavior và error
boundary.
