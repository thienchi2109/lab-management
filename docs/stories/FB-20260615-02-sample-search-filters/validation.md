# Validation

## Proof Strategy

Story hoàn tất khi query contract, UI filter, pagination và export cùng dùng một
bộ filter đã được test.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Query parsing, default date range, invalid params, multi-select group params. |
| Integration | Server list samples áp dụng filter đúng cột/quan hệ; export nhận cùng query. |
| Component | Render title, chú thích, controls, export placement, không có sort direction UI. |
| Browser | Mobile date fields cùng dòng khi đủ chiều ngang, combobox không overflow. |
| Platform | Typecheck, React Doctor diff, docstring gate nếu export mới. |

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.

