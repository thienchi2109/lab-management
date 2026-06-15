# BACKLOG-16 - Confirm dialog khi đăng xuất

## Trạng thái

Planned.

## Lane

Normal.

## Nguồn

- Harness backlog: `#16`
- Intake: `#48`
- Story ID: `BACKLOG-16-signout-confirm-dialog`

## Product Contract

Người dùng bấm nút đăng xuất trong topbar dashboard phải thấy confirm dialog
trước khi form `POST /auth/signout` được submit. Hủy dialog phải giữ người dùng
ở nguyên ngữ cảnh hiện tại. Xác nhận mới thực hiện đăng xuất.

Confirm dialog phải dùng shared dialog pattern, không tạo markup local chỉ cho
topbar. Primitive này phải có contract đủ tổng quát để tái dùng cho các thao tác
xóa hoặc destructive actions trong các story sau.

## Current Behavior

- `lab-kit-app/components/layout/topbar.tsx` render form sign out trực tiếp.
- Nút `Đăng xuất` là submit button, bấm là POST ngay tới `/auth/signout`.
- `lab-kit-app/app/auth/signout/route.ts` và regression test hiện có giữ redirect
  đúng host sau khi đăng xuất.
- Shared overlay hiện nằm ở `lab-kit-app/components/ui/overlay-frame.tsx`, được
  re-export qua `lab-kit-app/components/dashboard/dialog-frame.tsx`.

## Acceptance Criteria

- Bấm nút đăng xuất mở confirm dialog, không submit form ngay.
- Hủy bằng nút hủy, backdrop hoặc Escape đóng dialog và không gọi sign out.
- Xác nhận trong dialog submit form `POST /auth/signout` hiện có.
- Dialog dùng shared confirm primitive dựa trên shared overlay/dialog pattern.
- Không tạo component confirm riêng trong `topbar.tsx`.
- Shared confirm primitive có API đặt `title`, `description`, `confirmLabel`,
  `cancelLabel`, destructive/neutral intent và cơ chế submit hoặc callback.
- Copy tiếng Việt có dấu đầy đủ, ví dụ `Xác nhận đăng xuất`, `Đăng xuất`, `Hủy`.
- Regression test chứng minh chỉ thao tác xác nhận mới submit đăng xuất.
- Không đổi route `/auth/signout`, redirect helper hoặc Supabase signOut logic.

## Non-Goals

- Không triển khai thao tác xóa trong story này.
- Không đổi authorization, session, Supabase auth hoặc redirect contract.
- Không migrate toàn bộ dialog hiện có sang primitive mới nếu không cần cho scope
  đăng xuất.
- Không thêm client cache hoặc data fetching mới.

