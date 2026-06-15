# Design

## Context Packet

Backlog `#16` phát hiện trong smoke test: nút đăng xuất thực hiện ngay, không có
confirm dialog. Người dùng yêu cầu story này phải khóa shared dialog pattern,
không tạo code lặp, và confirm dialog phải dùng lại được cho thao tác xóa trong
tương lai.

Code Review Graph không trả node cho truy vấn logout/dialog, nên context được
khoanh bằng `rg`:

- `lab-kit-app/components/layout/topbar.tsx`: form đăng xuất hiện tại.
- `lab-kit-app/app/auth/signout/route.ts`: POST sign out server route.
- `lab-kit-app/app/auth/signout/route.test.ts`: regression redirect host.
- `lab-kit-app/components/ui/overlay-frame.tsx`: shared modal/sheet frame.
- `lab-kit-app/components/dashboard/dialog-frame.tsx`: re-export shared frame.
- `lab-kit-app/components/layout/topbar.test.ts`: test hiện tại cho topbar source.

## Interface Contract

Shared primitive nên sống ở shared UI layer, ví dụ:

- `lab-kit-app/components/ui/confirm-dialog.tsx`
- `lab-kit-app/components/ui/confirm-dialog.test.tsx`

API dự kiến:

- `open: boolean`
- `title: string`
- `description: string`
- `confirmLabel: string`
- `cancelLabel: string`
- `onOpenChange: (open: boolean) => void`
- `onConfirm?: () => void`
- `confirmFormId?: string`
- `intent?: "neutral" | "destructive"`

`confirmFormId` cho phép topbar giữ form POST bảo mật và để confirm button
submit form bằng thuộc tính `form`, không cần gọi route bằng client fetch.

## UI Behavior

- Nút icon `Đăng xuất` trong topbar đổi từ submit trực tiếp sang mở dialog.
- Hidden hoặc offscreen form vẫn giữ `action="/auth/signout"` và `method="post"`.
- Confirm button trong dialog submit đúng form đăng xuất.
- Hủy đóng dialog, không submit.
- Dialog focus trap, Escape và body scroll lock kế thừa `DialogFrame`.
- Intent destructive dùng màu/variant phù hợp cho hành động rời phiên làm việc.

## Reuse Constraints

- Trước implementation, chạy `code-deduplication` và kiểm tra lại shared overlay,
  dialog, toast, button primitives.
- Không copy markup `DialogFrame` vào topbar.
- Nếu `components/ui/overlay-frame.tsx` đã đủ contract, confirm primitive phải
  compose lại nó thay vì tạo overlay riêng.
- Nếu cần behavior submit form, thêm vào confirm primitive bằng prop tổng quát,
  không hard-code sign out.
- Giữ file dưới 350 dòng. Nếu primitive hoặc test lớn, tách helper nhỏ.

## Future Delete Use

Primitive phải phục vụ được các story xóa sau này:

- xóa mềm mẫu;
- xóa người dùng hoặc vô hiệu hóa tài khoản nếu có;
- xóa lô KIT hoặc bản ghi cấu hình nếu product cho phép.

Vì vậy copy, labels, intent và confirm behavior phải truyền qua props. Không đặt
tên component hoặc prop theo logout-only semantics.

