# US-009A.1 - Sample Grid Display Contract

**Lane:** normal
**Phase:** 8
**Status:** implemented
**Parent:** [US-009](../US-009-data-grid-filters-views/overview.md)
**Depends on:** [US-009A](../US-009A-data-grid-query-contract/overview.md)

## Current Behavior

US-009A đã đưa search, filter, sort và pagination về server-side, nhưng row
contract vẫn chỉ có id dữ liệu thô. US-009B sẽ phải tự suy luận nhãn hiển thị
và quyền hành động nếu triển khai ngay.

## Target Behavior

Sample grid contract trả thêm dữ liệu hiển thị và capability tối thiểu:

- row có `sampleTypeName`, `companyName`, và `kitSummary`;
- page có `capabilities` cho metadata, kết quả và ảnh;
- Viewer nhận capability read-only;
- Admin/Editor nhận capability thao tác các flow hiện có;
- không thêm UI grid, schema, migration, RPC hoặc result detail.

## Acceptance Criteria

- Contract vẫn dùng query contract US-009A cho server-side search/filter/sort/page.
- Display labels được map server-side từ join hiện có hoặc fallback an toàn.
- Capability được tính từ membership active trong actor đã xác thực.
- Focused tests chứng minh Viewer read-only và Admin/Editor write-capable.
- US-009B có thể consume contract mà không mở rộng data layer trong cùng PR.

## Non-Goals

- Render `DashboardDataTable`.
- URL control UI.
- Metadata edit dialog payload đầy đủ.
- Responsive column visibility.
- Result group detail hoặc result matrix.
