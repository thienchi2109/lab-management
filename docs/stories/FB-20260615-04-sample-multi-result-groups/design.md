# Design

## Direction

Thiết kế phải bắt đầu bằng live DB discovery. Không giả định migrations cũ phản
ánh đúng schema hiện tại. Nếu schema chưa có quan hệ sample-to-result-group,
implementation phải dùng migration forward-only.

## Domain Contract

- Mẫu có quan hệ nhiều-nhiều với nhóm chỉ tiêu.
- Nhóm chỉ tiêu có quan hệ nhiều-nhiều với chỉ tiêu nếu live schema hiện tại
  chưa hỗ trợ một chỉ tiêu thuộc nhiều nhóm.
- Result entry lấy danh sách nhóm từ mẫu, không tự suy ra toàn bộ template nếu
  người dùng chỉ chọn một phần.
- `sample_group_conclusions` tiếp tục lưu Kết Quả Chung theo sample/group.

## UI Contract

- `Thêm mẫu` có multi-select nhóm chỉ tiêu.
- Edit sample cần quyết định có cho đổi nhóm sau khi đã nhập kết quả không. Mặc
  định story này nên khóa hoặc cảnh báo nếu đổi nhóm có thể ẩn dữ liệu kết quả.
- Danh sách mẫu hiển thị nhóm chỉ tiêu dạng tóm tắt ngắn.

## Data Flow

1. User chọn nhiều nhóm trong create sample.
2. Save sample metadata cùng group selection trong transaction/RPC nếu cần.
3. Result entry load sample groups.
4. UI render từng nhóm riêng, mỗi nhóm có metrics và Kết Quả Chung riêng.

## Required Discovery

Trước implementation phải query Supabase MCP namespace
`mcp__supabase_lab_management`, project-ref `tuuqgpzgollcerqqszjr`, và chứng
minh các bảng/quan hệ hiện có: `samples`, `result_groups`, `result_metrics`,
`result_templates`, `result_template_metrics`, `sample_results`,
`sample_group_conclusions`.

