# ISSUE-42 - Ổn định cột kết quả Sample Grid

## Status

implemented

## Lane

normal

## Product Contract

Sample Grid phải lấy danh sách cột kết quả desktop từ cấu hình result template
ổn định theo tenant thay vì suy ra từ dữ liệu của page hiện tại.

## Relevant Product Docs

- `docs/product/result-engine.md`
- `docs/product/ui-contract.md`
- `docs/stories/US-009D-result-group-detail-column-mode/overview.md`

## Acceptance Criteria

- `resultColumnOptions` không phụ thuộc vào `rows` hoặc result summaries của
  page hiện tại.
- Cột nhóm dùng key `group:<id>` và cột chỉ tiêu dùng key `metric:<id>`.
- URL state `resultColumns` giữ các key hợp lệ dù page hiện tại không có dữ
  liệu tương ứng.
- Regression test chứng minh page A và page B có result summaries khác nhau
  nhưng options vẫn ổn định.

## Non-Goals

- Không thêm metric/template mới.
- Không đổi semantics result engine.
- Không thêm migration, RPC, grant, policy hoặc cleanup SQL nếu schema hiện tại
  đã đủ cho read path.
