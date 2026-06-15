# Design

## Existing Toast Contract

`components/ui/toast.tsx` cung cấp:

- `AppToastProvider`, đã mount ở `app/layout.tsx`;
- `useToast()`, trả về dispatcher `toast({ title, description })`;
- Radix Toast viewport toàn cục.

Story này dùng lại contract trên. Nếu implementation cần helper mới, helper đó
phải là wrapper nhỏ quanh action state, không thay thế primitive toast.

## Feedback Rules

- Success: dùng toast mặc định cho thao tác đã hoàn tất, ví dụ "Đã tạo mẫu xét
  nghiệm." hoặc "Đã cập nhật trạng thái KIT.".
- Error cấp workflow: dùng toast khi lỗi mô tả thất bại của thao tác tổng thể,
  ví dụ server action trả message an toàn nhưng không có field cụ thể.
- Warning/cảnh báo: dùng toast khi thông báo ngắn hạn và không yêu cầu xác nhận
  trước khi tiếp tục.
- Field errors: giữ inline ở field tương ứng. Không chuyển lỗi nhập liệu sang
  toast nếu người dùng cần sửa giá trị tại chỗ.
- Form-level `ActionMessage`: có thể giữ cho accessibility và trạng thái trong
  dialog, nhưng không được trở thành notification cục bộ duy nhất cho success.

## Candidate Implementation Shape

Ưu tiên tạo một hook nhỏ, ví dụ `useActionToast`, nhận action state và phát
toast khi `status` chuyển sang `success` hoặc `error`.

Yêu cầu của hook:

- chạy trong client component;
- nhận `status`, `message` và tùy chọn title theo module;
- chặn bắn lại cùng một result khi re-render;
- không parse hoặc sửa message đã sanitize từ server;
- không phụ thuộc TanStack Query hoặc state manager mới.

Nếu implementation thấy mỗi action state có shape khác nhau, story nên chuẩn
hóa adapter ở biên UI thay vì đổi server action trước khi có lý do rõ.

## Affected Surfaces

- `app/dashboard/samples/_components/sample-metadata-dialogs.tsx`
- `app/dashboard/kits/_components/kit-inventory-dialogs.tsx`
- `app/dashboard/result-configuration/_components/*dialog*.tsx`
- `app/dashboard/users/_components/user-form-dialogs.tsx`
- `app/dashboard/samples/[sampleId]/results/_components/sample-results-client.tsx`
- Shared helper location under `components/dashboard/` or `components/ui/` only
  if code-deduplication proves no existing helper covers this.

## Reuse Constraints

- Invoke code-deduplication before adding a shared hook/helper.
- Reuse `ActionMessage`, form fields, dialog primitives and existing action
  state shape where they still serve local validation.
- Do not create a second notification system.
- Do not add toast state to each feature root when root layout already owns the
  provider.

## Accessibility

- Toast remains supplementary for short-lived feedback.
- Field errors remain reachable near the field.
- Dialog content still exposes action result text when needed for screen-reader
  context and for users who miss a transient toast.

## Open Questions For Implementation

- Whether success `ActionMessage` should be hidden after toast rollout, or kept
  visible in dialogs until close.
- Whether warning style needs a new toast variant. Default implementation should
  avoid variant expansion unless acceptance tests prove it is necessary.
