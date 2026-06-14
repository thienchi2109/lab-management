# ISSUE-20 - Dùng toast cho thông báo action

## Trạng Thái

Planned.

## Lane

Normal.

- Input type: change_request.
- Risk flags: Frontend/UI, Shared code, Existing behavior, Weak proof.
- Reason: story dùng toast primitive toàn cục đã có và thay đổi cách người dùng
  nhận phản hồi sau thao tác, nhưng không đổi auth, RBAC, schema, migration,
  API contract hoặc server-state strategy.

## Product Contract

Các thao tác trong app phải có phản hồi rõ sau khi hoàn tất, thất bại hoặc cần
cảnh báo. Repo đã có `AppToastProvider` và `useToast` từ
`components/ui/toast.tsx`; story này rollout primitive đó vào các workflow có
thông báo cấp trang hoặc cấp thao tác.

## Relevant Product Docs

- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/stories/ISSUE-19-global-ui-primitives-branding/overview.md`

## Current Behavior

- Toast toàn cục đã mount một lần ở root layout.
- `useToast()` hiện chỉ được dùng trong test của primitive, chưa được nối vào
  feature component production.
- Các dialog/form đang dùng `useActionState` và `ActionMessage` để hiển thị
  `{ status, message }` inline.
- Lỗi field-level đang hiển thị cạnh field trong các form metadata, kit,
  result configuration và user management.

## Target Behavior

- Thành công của command như tạo/sửa mẫu, tạo/sửa KIT, tạo/sửa cấu hình kết
  quả, tạo/sửa người dùng và lưu kết quả mẫu hiển thị bằng toast.
- Lỗi cấp workflow hoặc lỗi không gắn với một field cụ thể hiển thị bằng toast
  khi người dùng cần biết thao tác thất bại.
- Cảnh báo hoặc thông tin ngắn hạn có tính toàn cục, ví dụ thao tác bị chặn do
  quyền hoặc dữ liệu chưa sẵn sàng, có thể dùng toast nếu không cần người dùng
  sửa trực tiếp một field.
- Lỗi field-level và hướng dẫn sửa form vẫn giữ inline bằng field error hoặc
  `ActionMessage` khi thông báo cần nằm sát form.
- Không tạo toast provider mới, không thêm dependency mới và không tự dựng
  notification cục bộ riêng từng module.

## Acceptance Criteria

- Một helper hoặc pattern rõ ràng nối `useActionState` result sang `useToast`
  mà không duplicate logic ở mọi dialog quá mức.
- Các action chính ở Samples, Kits, Result Configuration và Users có toast cho
  success message hiện có.
- Ít nhất một lỗi workflow không field-level được bắn toast và vẫn giữ inline
  validation cho lỗi field-level.
- Toast không bắn lại khi component re-render với cùng một action result.
- Toast text dùng tiếng Việt có dấu, ngắn gọn, không thay đổi nội dung lỗi bảo
  mật đã được sanitize ở server action.
- UI vẫn có pending state và form không mất field errors sau khi submit fail.

## Non-Goals

- Không thay đổi `components/ui/toast.tsx` trừ khi phát hiện thiếu khả năng tối
  thiểu để rollout an toàn.
- Không thêm confirm dialog toàn cục; destructive confirm thuộc story riêng như
  `ISSUE-12B-samples-bulk-soft-delete`.
- Không thay đổi shape server action nếu message/status hiện tại đủ dùng.
- Không đổi RLS, auth, audit, DB schema hoặc Cloudinary behavior.

## Harness Delta

- Story durable row: `ISSUE-20-toast-action-feedback`.
- Expected verify command được ghi trong Harness DB sau khi tạo packet.

## Evidence

Planning only. Chưa sửa app code và chưa chạy validation implementation.
