# Validation

## Proof Strategy

Story hoàn tất khi query contract, UI filter, pagination và export cùng dùng một
bộ filter đã được test.

Proof được cộng dồn từ 3 slice. Story cha chỉ chuyển `implemented` khi
`FB-20260615-02A`, `FB-20260615-02B` và `FB-20260615-02C` đều đạt
verify-command riêng.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Query parsing, default date range, invalid params, multi-select group params. |
| Integration | Server list samples áp dụng filter đúng cột/quan hệ; export nhận cùng query. |
| Component | Render title, chú thích, controls, export placement, không có sort direction UI. |
| Browser | Mobile date fields cùng dòng khi đủ chiều ngang, combobox không overflow. |
| Platform | Typecheck, React Doctor diff, docstring gate nếu export mới. |

## Slice Proof

- `FB-20260615-02A`: query parser và export parser parity.
- `FB-20260615-02B`: server option payload và adapter filtering.
- `FB-20260615-02C`: rendered filter UI, URL state, pagination và browser/mobile
  smoke nếu UI thay đổi đáng kể.

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.
