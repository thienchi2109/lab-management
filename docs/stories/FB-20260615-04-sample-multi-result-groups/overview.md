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
- Một mẫu chọn trực tiếp được nhiều `result_groups`.
- Một nhóm có nhiều chỉ tiêu.
- Một chỉ tiêu có thể thuộc nhiều nhóm chỉ tiêu khác nhau.
- Khi nhập/xem kết quả, kết quả vẫn tách theo từng nhóm đã chọn.
- Mỗi nhóm có `Kết Quả Chung` riêng.
- Existing samples được backfill nhóm chỉ tiêu từ template/kết quả hiện có khi
  suy ra được. Nếu không suy ra được, hệ thống fallback sang toàn bộ nhóm
  active để không mất khả năng xem hoặc nhập kết quả.

## Proposed Data Contract

- Thêm bảng nối `sample_result_groups` để lưu `sample_id` ↔ `result_group_id`
  theo từng organization.
- `samples.sample_type_id` vẫn giữ vai trò loại mẫu, không còn là nguồn duy
  nhất quyết định nhóm chỉ tiêu khi nhập kết quả.
- Form tạo/sửa mẫu gửi danh sách `resultGroupIds` đã chọn. Server validate các
  nhóm thuộc cùng organization, đang active và không rỗng.
- Result entry chỉ lấy metric thuộc các nhóm đã gắn với mẫu. Nếu mẫu cũ chưa có
  mapping, server dùng fallback toàn bộ nhóm active cho đến khi migration hoặc
  backfill hoàn tất.
- Filter danh sách mẫu nhận một hoặc nhiều `resultGroupIds` và chỉ trả mẫu có
  ít nhất một nhóm khớp.

## Design Decisions

- Form tạo/sửa mẫu chọn trực tiếp nhiều `result_groups`; không chọn thông qua
  `result_templates`.
- Mẫu lưu quan hệ nhiều-nhiều với nhóm chỉ tiêu bằng bảng nối riêng để không
  thay đổi ý nghĩa của `sample_type_id`.
- Mẫu cũ được backfill từ template hoặc kết quả hiện có nếu có thể suy ra nhóm.
  Nếu không suy ra được, hệ thống fallback sang toàn bộ nhóm active của tổ chức
  để không mất khả năng xem hoặc nhập kết quả.
- Result entry chỉ tải và hiển thị các chỉ tiêu thuộc nhóm đã chọn của mẫu.
- Filter danh sách mẫu lọc được theo một hoặc nhiều nhóm chỉ tiêu đã gắn với
  mẫu.

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

## Slice Plan

Story cha được chia thành 4 slice nhỏ để giảm blast radius và đi qua TDD theo
từng tầng. Mỗi slice có story packet riêng và verify-command riêng:

- `FB-20260615-04A` - Mẫu nhiều nhóm chỉ tiêu, model slice. Schema Zod và
  operations metadata yêu cầu `resultGroupIds`, audit field-name list mở rộng.
- `FB-20260615-04B` - Sample grid lọc theo nhiều nhóm chỉ tiêu. Query parser,
  port `listSamples` và bảng nối `sample_result_groups` cho filter.
- `FB-20260615-04C` - Result entry tải theo `sample_result_groups`. Bỏ lệ
  thuộc duy nhất vào template theo `sample_type_id`, có fallback cho mẫu cũ.
- `FB-20260615-04D` - Migration và RPC. Forward-only migration cho bảng nối
  `sample_result_groups`, RLS, RPC `create_sample_metadata_with_code` và
  `save_sample_results_with_audit` đọc nhóm từ bảng nối, backfill cho mẫu cũ.

Story cha vẫn là nguồn product contract. Story con cập nhật proof và status
của riêng mình. Khi cả 4 slice đạt verify-command, story cha được chuyển sang
`implemented` kèm evidence tổng hợp.
