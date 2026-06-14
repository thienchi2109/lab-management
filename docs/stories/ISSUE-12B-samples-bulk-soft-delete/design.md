# Design

## Domain Model

Thêm xoá mềm vào `samples`:

- `deleted_at timestamptz null`
- `deleted_by uuid null references auth.users(id)`
- `delete_reason text null`

Mẫu active là mẫu có `deleted_at is null`. Mẫu đã xoá mềm không hiện trong grid
mặc định và không được sửa metadata hoặc nhập kết quả mới.

## Application Flow

1. Admin chọn mẫu bằng shadcn `Checkbox` trong header/row của
   `DashboardDataTable`.
2. Bulk toolbar hiển thị số mẫu đã chọn và nút xoá mềm.
3. Global `ConfirmDialog` mở trước destructive action, hiển thị số lượng mẫu,
   một vài mã mẫu đại diện và cảnh báo dữ liệu con được giữ lại.
4. Server action nhận `sampleIds[]` và `reason` tùy chọn.
5. Server xác thực Admin, tenant và trạng thái active.
6. Domain operation hoặc RPC xoá mềm hàng loạt và ghi audit.
7. Server revalidate `/dashboard/samples`.

## Interface Contract

- Input: `sampleIds[]`, `reason` tùy chọn.
- Role: Admin only.
- Empty selection: `Chọn ít nhất một mẫu để xoá mềm.`
- Success: `Đã xoá mềm {count} mẫu xét nghiệm.`
- Partial invalid ids: xử lý theo rule được test trước. Khuyến nghị bỏ qua id
  không còn active và trả count thực tế.
- Error: thông báo an toàn, không rò tenant hoặc dữ liệu nhạy cảm.

## Data Model

Migration phải forward-only. Trước mọi Supabase MCP write, agent triển khai
phải chứng minh:

- Namespace: `mcp__supabase_lab_management`.
- Project-ref: `tuuqgpzgollcerqqszjr`.
- Migration history hiện tại.
- Target tables/functions: `samples`, `sample_results`,
  `sample_group_conclusions`, `sample_images`, `audit_events` và RPC mới nếu có.

Khuyến nghị:

- Thêm cột xoá mềm vào `public.samples`.
- Thêm index theo `organization_id`, `deleted_at`, `received_at desc`.
- Giữ unique sample code hiện tại trong scope đầu tiên để tránh tái dùng mã mẫu
  gây nhầm audit.
- Không đổi FK cascade vì xoá mềm không kích hoạt cascade.
- Nếu tạo RPC, dùng `SECURITY DEFINER`, fixed `search_path`, role Admin tenant
  check, update `samples` và insert `audit_events` trong cùng transaction.

## UI / Platform Impact

- Selection dùng shadcn `Checkbox`/table selection pattern.
- Header checkbox có trạng thái indeterminate khi chọn một phần.
- Bulk toolbar chỉ render cho Admin khi có selection.
- Confirm dialog phải là global primitive, ví dụ
  `components/ui/confirm-dialog.tsx`, dựa trên shadcn `AlertDialog`.
- Primitive phải có title, description, cancel, destructive confirm,
  pending/error state và accessible labels.
- Không cài confirm dialog local trong trang Samples.

Trước khi thêm primitive, chạy code-deduplication và kiểm tra không có global
contract tương đương.

## Observability

Audit action: `sample.deleted`.

Payload tối thiểu:

- `sampleCodes`
- `selectionCount`
- `deleteMode: "soft"`
- `reasonProvided`
- `metadataPolicy: "field-names-only"`

Không log full metadata, customer name, note, result values, image URLs hoặc
dữ liệu nhạy cảm khác.

Audit xoá ảnh upload vẫn dùng contract riêng `sample_image.deleted` và không
được gọi bởi soft delete mẫu.

## Alternatives Considered

1. Hard delete `samples`.
   - Bị loại vì cascade mất dữ liệu con.

2. Row-by-row delete only.
   - Bị loại vì yêu cầu mới cần multiple selection và bulk soft delete.

3. Local confirm dialog trong Samples.
   - Bị loại vì destructive confirm cần global primitive dùng lại.
