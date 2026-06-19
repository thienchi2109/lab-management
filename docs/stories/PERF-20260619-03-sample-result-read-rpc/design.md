# Design

## Domain Model

Sample result read payload gồm metadata mẫu, nhóm chỉ tiêu được chọn, metrics,
giá trị kết quả, kết luận nhóm, trạng thái quyền ghi và ảnh minh chứng nếu UI
đang cần. `Kết Quả Chung` vẫn theo `sample_group_conclusions`.

## Application Flow

Route/page kết quả mẫu xác thực session server-side, xác định organization và
role, rồi gọi một RPC đọc kết quả mẫu. RPC trả payload đã tenant-scoped theo
sample id và organization. Save flow hiện có tiếp tục dùng RPC ghi/audit riêng.

## Interface Contract

RPC đề xuất: `get_sample_result_entry_payload`.

Input tối thiểu:

- `p_sample_id uuid`

Output:

- Một JSON payload hoặc row composite đã parse bằng Zod ở boundary server.
- 403/empty guarded result khi user không thuộc tenant hoặc không có quyền xem.
- Không trả lỗi SQL/raw provider ra client.

## Data Model

Có thể cần migration forward-only để tạo RPC. Không sửa migration đã apply.
RPC chỉ đọc các bảng liên quan:

- `samples`
- `sample_result_groups`
- `result_groups`
- `result_metrics`
- `sample_results`
- `sample_group_conclusions`
- `sample_images` nếu UI cần trong cùng payload

Index review bắt buộc trước implementation: `sample_result_groups.sample_id`,
`sample_results.sample_id`, `sample_group_conclusions.sample_id`, và các khóa
tenant/join liên quan.

## UI / Platform Impact

UI kết quả mẫu giữ cùng màn hình và trạng thái read-only/write hiện tại. Thay
đổi nằm ở loader/server adapter để giảm số request.

## Observability

Không thêm production logs nếu không được duyệt. Proof ưu tiên query count,
focused tests và Supabase/Vercel waterfall quan sát được từ công cụ hiện có.

## Alternatives Considered

1. Tối ưu từng REST query riêng lẻ: ít rủi ro hơn nhưng vẫn giữ waterfall.
2. Tắt RLS: không phù hợp contract bảo mật của repo.
3. Cache client bằng TanStack Query: có thể giảm reload lặp lại nhưng không xử
   lý gốc request waterfall/RLS cho lần mở đầu.
