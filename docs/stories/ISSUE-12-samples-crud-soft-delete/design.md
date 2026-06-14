# Design

## Domain Model

`samples` là bản ghi nghiệp vụ trung tâm cho metadata mẫu, nhập kết quả, kết
luận nhóm kết quả, ảnh bằng chứng, báo cáo và export. Vì các bảng con đang FK
về `samples`, thao tác xoá mẫu phải được xem là thao tác hủy kích hoạt nghiệp
vụ, không phải xoá vật lý.

Đề xuất thêm trạng thái xoá mềm vào `samples`:

- `deleted_at timestamptz null`
- `deleted_by uuid null references auth.users(id)`
- `delete_reason text null`

Một mẫu được xem là đang hoạt động khi `deleted_at is null`. Mẫu đã xoá mềm
không xuất hiện trong danh sách mặc định, không được sửa metadata, không được
nhập kết quả mới, nhưng dữ liệu liên quan vẫn còn để audit, báo cáo nội bộ hoặc
điều tra sau này nếu có luồng admin riêng.

## Application Flow

Luồng xem chi tiết:

1. Người dùng chọn hành động xem từ `DashboardDataTable` trên trang Samples.
2. Client mở side sheet read-only bằng `SideSheetFrame`.
3. Nội dung dùng dữ liệu đã có trong row metadata. Nếu cần thêm kết quả, ảnh
   hoặc audit summary thì triển khai qua query riêng trong phase sau.

Luồng sửa:

1. Giữ `EditSampleDialog` hiện có trên shared `SideSheetFrame`.
2. Server action update phải từ chối mẫu đã xoá mềm.
3. Grid revalidate sau khi cập nhật như hiện tại.

Luồng xoá mềm:

1. Admin chọn một hoặc nhiều mẫu bằng shadcn `Checkbox` trong
   `DashboardDataTable`.
2. Toolbar bulk action hiển thị số mẫu đã chọn và nút xoá mềm hàng loạt.
3. UI mở global confirm dialog, hiển thị số lượng mẫu, một vài mã mẫu đại diện
   và cảnh báo rằng kết quả, kết luận và ảnh sẽ được giữ lại.
3. Server action xác thực session, role Admin, tenant và trạng thái chưa xoá.
4. Domain operation gọi port xoá mềm hàng loạt hoặc RPC audit transaction.
5. Server revalidate `/dashboard/samples`.
6. Grid mặc định không còn hiển thị các mẫu đã xoá mềm.

Luồng xoá ảnh đã upload:

1. Giữ nguyên command xoá ảnh hiện có của domain `sample-images`.
2. Xoá ảnh đã upload vẫn do người dùng gọi thao tác xoá ảnh riêng trong luồng
   ảnh mẫu, theo quyền ghi hiện có.
3. Soft-delete mẫu không gọi xoá Cloudinary asset, không gọi
   `delete_sample_image_with_audit` và không xoá hàng `sample_images`.

## Interface Contract

Server action mới nên nằm gần `createSampleMetadataAction` và
`updateSampleMetadataAction`, nhưng phần domain/port có thể tách file mới để
không vượt giới hạn 350 dòng.

Contract đề xuất:

- Input form: `sampleIds[]`, `reason` tùy chọn.
- Role: Admin only.
- Success: `Đã xoá mềm {count} mẫu xét nghiệm.`
- Unauthorized: thông báo an toàn, không rò chi tiết tenant.
- Empty selection: trả lỗi an toàn `Chọn ít nhất một mẫu để xoá mềm.`
- Already deleted: bỏ qua id đã xoá mềm và trả count thực tế, hoặc trả lỗi
  an toàn nếu toàn bộ selection không còn hợp lệ. Khuyến nghị ghi rõ hành vi
  trong tests trước khi implement.

Các query đọc mặc định phải thêm điều kiện `deleted_at is null`. Nếu cần màn
hình quản trị mẫu đã xoá, tạo story riêng.

## Data Model

Migration phải forward-only vì migration đã apply live không được sửa. Trước
bất kỳ write qua Supabase MCP, agent triển khai phải chứng minh:

- Namespace: `mcp__supabase_lab_management`.
- Project-ref: `tuuqgpzgollcerqqszjr`.
- Migration history hiện tại.
- Target tables/functions: `samples`, `sample_results`,
  `sample_group_conclusions`, `sample_images`, `audit_events` và RPC mới nếu có.

Khuyến nghị DB layer:

- Thêm cột xoá mềm vào `public.samples`.
- Thêm index hỗ trợ grid mặc định, ví dụ theo `organization_id`, `deleted_at`
  và `received_at desc`.
- Xem xét đổi unique sample code thành unique partial index cho active rows
  nếu sản phẩm cho phép tái dùng mã mẫu sau khi xoá mềm. Mặc định nên giữ
  unique hiện tại để tránh tái dùng mã gây nhầm audit.
- Không đổi FK cascade trong scope này vì xoá mềm không kích hoạt cascade.
- Nếu tạo RPC, dùng `SECURITY DEFINER`, `set search_path`, kiểm tra role admin
  bằng tenant membership, update `samples`, insert `audit_events` trong cùng
  transaction.

## UI / Platform Impact

Trang Samples tiếp tục dùng `DashboardDataTable`. Actions row nên có:

- Xem: mở side sheet read-only.
- Cập nhật: mở edit side sheet hiện có.
- Nhập kết quả: link hiện có.
- Chọn hàng: chỉ render cho Admin bằng shadcn `Checkbox`.
- Xoá mềm hàng loạt: chỉ render khi Admin đã chọn ít nhất một mẫu.

Evidence image panel hoặc luồng xoá ảnh đã upload không đổi trong story này,
ngoài việc các màn hình liên quan phải xử lý mẫu đã xoá mềm theo guard chung.

Confirm xoá mềm phải dùng global primitive UI mới, ví dụ
`components/ui/confirm-dialog.tsx`, dựa trên shadcn `AlertDialog` thay vì
confirm dialog local trong trang Samples. Primitive này phải có title,
description, cancel action, destructive confirm action, pending/error state và
accessible labels. Trước khi thêm primitive, chạy code-deduplication và kiểm
tra không có contract global tương đương.

## Observability

Audit event xoá mềm nên dùng action `sample.deleted`, entity table `samples`,
entity id là sample id, payload tối thiểu:

- `sampleCode`
- `metadataPolicy: "field-names-only"`
- `deleteMode: "soft"`
- `reasonProvided: boolean`
- `selectionCount`
- danh sách bảng con được giữ lại theo contract, không đếm hoặc dump dữ liệu
  nhạy cảm nếu không cần.

Audit event xoá ảnh upload tiếp tục dùng contract riêng `sample_image.deleted`
của domain ảnh mẫu. Story này không thay thế hoặc gộp audit xoá ảnh vào audit
xoá mẫu.

Trace Harness sau triển khai phải ghi rõ migration version, Supabase namespace,
project-ref, verification commands, files changed và bất kỳ gap RLS nào.

## Alternatives Considered

1. Hard delete `samples`.
   - Bị loại vì FK cascade làm mất `sample_results`,
     `sample_group_conclusions` và `sample_images`.

2. Dùng `status = archived` thay xoá mềm.
   - Bị loại cho scope xoá vì `archived` là trạng thái nghiệp vụ, không đủ rõ
     để phân biệt mẫu bị xoá khỏi mẫu đã hoàn tất/lưu trữ.

3. Xoá mềm bằng cột riêng.
   - Khuyến nghị vì bảo toàn dữ liệu, dễ lọc, dễ audit, không đụng cascade và
     có thể mở rộng luồng khôi phục sau này.
