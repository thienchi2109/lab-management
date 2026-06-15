# FB-20260615-04 - Mẫu hỗ trợ nhiều nhóm chỉ tiêu

## Trạng thái

planned

## Lane

high-risk

## Intake

- Input type: New initiative slice từ phản hồi khách hàng ngày 2026-06-15.
- Risk flags: Data model, Public contracts, Server state, Frontend/UI,
  Existing behavior, Weak proof, Multi-domain.
- Lý do high-risk: một mẫu có thể thuộc nhiều nhóm chỉ tiêu, kết quả vẫn tách
  theo từng nhóm. Yêu cầu này có thể chạm schema, result templates, result
  entry, sample create và filter.

## Product Contract

- `docs/product/data-model.md` - result groups, metrics, templates, samples.
- `docs/product/result-engine.md` - group metrics và Kết Quả Chung.
- `docs/product/ui-contract.md` - sample entry và result group card.
- `docs/product/api-contract.md` - result templates API nếu cần thay đổi.

## Current Behavior

Codebase hiện có `result_groups`, `result_metrics`, `result_templates` và
`result_template_metrics`. Product docs mô tả template theo sample/kit type.
Phản hồi mới xác nhận một mẫu có thể kiểm nhiều nhóm chỉ tiêu, và kết quả vẫn
ở các nhóm riêng.

## Target Behavior

- Form `Thêm mẫu` có trường `Nhóm chỉ tiêu`.
- Một mẫu chọn được nhiều nhóm chỉ tiêu.
- Một nhóm có nhiều chỉ tiêu.
- Một chỉ tiêu có thể thuộc nhiều nhóm chỉ tiêu khác nhau.
- Khi nhập/xem kết quả, kết quả vẫn tách theo từng nhóm đã chọn.
- Mỗi nhóm có `Kết Quả Chung` riêng.

## Acceptance Criteria

- Admin/Editor có thể tạo mẫu với nhiều nhóm chỉ tiêu.
- Result entry chỉ hiển thị các nhóm/chỉ tiêu đã chọn cho mẫu.
- Filter danh sách mẫu có thể lọc theo một hoặc nhiều nhóm chỉ tiêu.
- Existing samples có migration/backfill hoặc fallback rõ, không mất khả năng
  xem/nhập kết quả.
- Live DB contract được chứng minh bằng Supabase MCP read-only trước mọi write.

## Non-Goals

- Không thay đổi thuật toán kết luận theo nhóm ngoài việc tách đúng group.
- Không nhập giá trị kết quả trong form tạo mẫu.
- Không làm quản trị toàn bộ catalog chỉ tiêu nếu story này chỉ cần chọn nhóm
  đã có.

