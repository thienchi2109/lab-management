# Thiết kế shared overlay cho thêm, xem và sửa thông tin

## Bối cảnh

Backlog hiện có các mục liên quan đến luồng mẫu và overlay:

- Backlog #6: `Luồng Thêm mẫu không phản hồi khi nhấn nút`.
- Backlog #8: dialog thêm người dùng hiển thị sai vị trí.
- Backlog #12: Samples thiếu CRUD xem, sửa, xóa mẫu.
- Backlog #13: làm rõ luồng nhập kết quả mẫu.

Code hiện tại đã có `DialogFrame` và nhiều màn đang tự dùng nó cho Users,
KIT, Result Configuration và Sample Metadata. Tuy nhiên, chuẩn overlay chưa
đủ rõ: có lỗi hiển thị ở góc trên bên trái, chưa có side sheet dùng chung, và
nút `Thêm mẫu` trên topbar chưa nối được vào luồng tạo mẫu.

Stitch MCP đã tạo artifact thiết kế để làm chuẩn tham chiếu:

- Project: `17861662806607618343`.
- Screen: `5bc83f7b89be4ea6862986bbd140538c`.
- Design system asset: `d2a382d3356f499888a13db87bc56157`.

## Mục tiêu

Chuẩn hóa một shared overlay system có thể tái sử dụng cho các tác vụ thêm,
xem và sửa thông tin trong dashboard LIS.

Thiết kế phải:

- Sửa triệt để lỗi overlay xuất hiện ở góc trên bên trái.
- Giữ `Thêm mẫu` là hành động chính ở desktop topbar.
- Đưa `Thêm mẫu` thành action button nổi bật ở giữa bottom navbar trên mobile.
- Dùng center modal cho tạo mới mẫu.
- Dùng right side sheet cho xem và sửa mẫu.
- Tạo nền tảng để các dialog Users, KIT, Result Configuration và Sample
  Metadata migrate dần về cùng primitive.

## Quyết định UX

### Ma trận chọn overlay

| Hành động | Pattern | Ghi chú |
| --- | --- | --- |
| Thêm mẫu | Center modal | Tập trung vào nhập liệu mới, không cần đối chiếu nhiều với bảng. |
| Xem mẫu | Right side sheet | Giữ ngữ cảnh danh sách mẫu phía sau. |
| Sửa mẫu | Right side sheet | Phù hợp form dài và thao tác từ một dòng trong bảng. |
| Xóa mẫu | Alert dialog | Scope riêng, chỉ xác nhận thao tác nguy hiểm. |
| Bộ lọc bảng desktop | Inline hoặc popover | Không dùng dialog desktop cho filter. |
| Bộ lọc bảng mobile | Sheet nếu cần | Chỉ dùng khi không đủ không gian inline. |

### Desktop

Trên desktop, `Thêm mẫu` tiếp tục nằm trong global topbar/header vì app hiện đã
định vị đây là primary action toàn cục. Button này không được là button rỗng.
Nó phải mở shared center modal `Thêm mẫu xét nghiệm`.

Không thêm một nút tạo mẫu thứ ba trong nội dung trang Samples nếu topbar đã có
trigger hoạt động, để tránh trùng hành động và gây lệch nhận thức.

### Mobile

Trên mobile, `Thêm mẫu` chuyển thành primary action slot ở giữa bottom navbar.
Nút này là nút dấu cộng nổi bật hơn menu item thường.

Minh họa vị trí:

```text
[Tổng quan] [Mẫu]    [+]    [Báo cáo] [Thêm]
                    Thêm mẫu
```

Quy tắc mobile:

- Nút `+` nằm giữa thanh bottom nav, không chen vào một cột nav thường.
- Kích thước khoảng `52-56px`, lớn hơn icon nav thường.
- Màu primary `#0F766E`, icon `Plus` màu trắng.
- Có accessible label `Thêm mẫu`.
- Bottom nav chừa khoảng trống trung tâm để nút không đè menu item.
- Nhấn nút mở center modal tạo mẫu, không mở side sheet.
- Modal trên mobile có thể dùng full-width gần đáy với safe-area padding, nhưng
  vẫn là create modal, không biến thành side sheet xem/sửa.

## Shared primitive đề xuất

Tạo hoặc refactor một primitive dùng chung, tạm gọi là `AppOverlay`.

API ở mức thiết kế:

```ts
type AppOverlayMode = "modal" | "sheet" | "alert";

type AppOverlayProps = {
  open: boolean;
  mode: AppOverlayMode;
  title: string;
  description?: string;
  closeLabel: string;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  destructiveAction?: React.ReactNode;
};
```

Không bắt buộc tên component cuối cùng là `AppOverlay`; tên có thể điều chỉnh
theo convention repo khi triển khai. Điều quan trọng là overlay logic, vị trí,
focus trap, escape close, header, body scroll và footer sticky được centralize.

## Thiết kế center modal

Center modal dùng cho `Thêm mẫu xét nghiệm`.

Thông số:

- Desktop width: khoảng `680px`, tối đa `760px`.
- Vị trí: căn giữa viewport theo cả trục ngang và dọc.
- Không bao giờ render ở góc trên bên trái.
- Header cố định gồm title, mô tả ngắn và nút đóng.
- Body scroll độc lập.
- Footer sticky gồm `Hủy` và primary action `Tạo mẫu`.
- Form dùng grid hai cột trên desktop, một cột trên mobile.
- Field tối thiểu: Mã mẫu, Loại mẫu, Khách hàng, Công ty, Lô KIT, Ngày nhận,
  Trạng thái, Thanh toán, Ghi chú.

Style:

- Surface `#FFFFFF`.
- Border `#D4D4D8`.
- Background dim khoảng `40%`.
- Radius panel `8px`.
- Control radius `6px`.
- Primary button `#0F766E`.

## Thiết kế right side sheet

Right side sheet dùng cho xem và sửa mẫu.

Thông số:

- Desktop width: khoảng `560px`, giới hạn hợp lý `520-640px`.
- Height: full viewport.
- Vị trí: bám mép phải.
- Motion: trượt từ phải vào, không nhảy vị trí.
- Header cố định với mã mẫu và metadata.
- Body scroll độc lập.
- Footer sticky gồm `Đóng`, `Lưu thay đổi`; destructive text action `Xóa mẫu`
  được tách khỏi primary actions.
- Mobile: gần full-screen, giữ cùng header/body/footer.

Nội dung xem/sửa mẫu:

- Header title ví dụ: `Mẫu M-2026-0412`.
- Metadata ví dụ: `Đã nhận · Chưa thanh toán · 13/06/2026`.
- Phần tóm tắt read-only dùng label/value rows và divider.
- Phần sửa dùng form fields tương tự create modal.

## Điều hướng và trigger

### Global topbar desktop

`Topbar` hiện có button `Thêm mẫu`. Khi triển khai, button này phải trở thành
trigger thật cho create modal. Có thể cần nâng state overlay lên layout client
boundary hoặc tạo shared action trigger có context phù hợp.

Ràng buộc:

- Không dùng route giả hoặc button không handler.
- Không mở trang mới nếu mục tiêu là modal create.
- Không copy form create vào topbar.

### Bottom navbar mobile

`BottomNav` hiện có 4 cột nav và nút `Thêm` cho menu mở rộng. Thiết kế mới cần
thêm center action slot cho `Thêm mẫu`.

Ràng buộc:

- Không làm mất khả năng mở menu thêm.
- Không để center action đè lên safe-area hoặc nội dung nav.
- Không dùng label tiếng Việt không dấu.

## Accessibility

Shared overlay phải có:

- `aria-modal` hoặc primitive tương đương từ Radix/shadcn.
- Title bắt buộc cho mọi modal, sheet, alert.
- Escape close cho overlay không destructive.
- Focus trap.
- Focus return về trigger sau khi đóng.
- Close button có `aria-label`.
- Body scroll không làm trang nền cuộn ngoài ý muốn.
- Keyboard navigation qua footer actions.

## Implementation boundary

Story triển khai đầu tiên nên tập trung vào:

- Shared overlay primitive.
- Center modal `Thêm mẫu`.
- Desktop topbar trigger hoạt động.
- Mobile bottom nav center action hoạt động.
- Right side sheet shell cho xem/sửa mẫu nếu scope cho phép.

Không nên gộp các phần sau vào cùng story nếu làm tăng rủi ro:

- Xóa mẫu hoàn chỉnh.
- Nhập kết quả mẫu.
- CRUD đầy đủ ngoài xem/sửa shell.
- Refactor toàn bộ dialog của Users, KIT, Result Configuration trong cùng lượt.

Các dialog hiện có nên migrate theo batch nhỏ sau khi primitive mới đã có test
và browser proof.

## Kiểm thử mong muốn

Regression tests cần khóa các điểm sau:

- Nút `Thêm mẫu` desktop topbar mở create modal.
- Modal create được render với title đúng và không dùng class/layout top-left.
- Nút `+` mobile bottom nav có accessible label `Thêm mẫu`.
- Mobile center action mở create modal.
- Side sheet xem/sửa mẫu render ở mode sheet, có title và footer sticky.
- Escape/close gọi đúng `onOpenChange(false)`.
- Dialog cũ migrate qua primitive không mất submit pending/error feedback.

Browser verification cần chụp tối thiểu:

- Desktop Samples với center modal mở.
- Desktop Samples với right side sheet mở.
- Mobile viewport với bottom nav center action.
- Mobile create modal sau khi nhấn center action.

## Câu hỏi còn mở

- Có triển khai right side sheet xem/sửa mẫu cùng story với #6 hay tạo story
  riêng sau khi modal create chạy ổn?
- Có đưa alert dialog xóa mẫu vào primitive ngay từ đầu hay chỉ ghi rule và để
  story CRUD mẫu xử lý?
- `Thêm mẫu` có luôn global trên mọi trang hay chỉ enable khi app có đủ context
  để mở create modal an toàn?
