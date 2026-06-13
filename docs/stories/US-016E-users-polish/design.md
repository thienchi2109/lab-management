# Design

## Context Packet

US-016E polish route `/dashboard/users`, một admin-only surface được US-014 tạo
ra. Route hiện đọc danh sách user qua server helper, render client component để
search/filter, summary, table và create/edit dialogs. Graph context cho thấy
blast radius trực tiếp nằm trong:

- `app/dashboard/users/page.tsx`
- `app/dashboard/users/_components/users-page-content.tsx`
- `app/dashboard/users/_components/user-management-client.tsx`
- `app/dashboard/users/_components/user-summary-strip.tsx`
- `app/dashboard/users/_components/user-table.tsx`
- `app/dashboard/users/_components/user-form-dialogs.tsx`
- `lib/user-management/users.ts`
- `lib/user-management/last-admin.ts`
- `app/dashboard/users/actions.ts`

Shared dependencies cần kiểm tra trước khi sửa:

- `components/dashboard/filter-select.tsx`
- `components/dashboard/dialog-frame.tsx`
- `components/dashboard/form-fields.tsx`
- `components/dashboard/action-message.tsx`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/badge.tsx`
- `components/ui/card.tsx`

Frontend skill baseline:

- Dùng `frontend-app-builder` ở chế độ route-level polish trong design system
  hiện có; không tự ý tạo landing-page hoặc marketing composition.
- Dùng `redesign-existing-projects` để audit typography, density, color,
  layout, empty/error states, hover/focus/pending states và generic card/table
  patterns.
- Dùng `frontend-testing-debugging` để bắt buộc browser proof cho desktop,
  mobile, console health, no framework overlay, screenshot và interaction proof
  khi implementation chạy.
- Dùng shadcn skill để chọn component, kiểm tra docs/registry và giữ composition
  đúng với `radix-nova` hiện tại.

Shadcn inventory hiện có:

- `Button`
- `Badge`
- `Card`
- `Checkbox`
- `Input`
- `Select`
- `Tooltip`

Không tạo component tương đương các primitive trên bằng raw HTML + Tailwind.
Nếu cần primitive mới cho Users surface, chọn từ shadcn trước:

- table/list: `Table` hoặc shared table contract nếu đã dùng shadcn-friendly
  wrapper;
- dropdown row actions: `DropdownMenu`;
- mobile edit surface: `Sheet` nếu dialog hiện tại không đủ;
- modal form: `Dialog` nếu cần thay primitive;
- destructive confirmation: `AlertDialog`;
- empty/loading/error: `Empty`, `Skeleton`, `Alert`;
- grouped role/status choices: `ToggleGroup`, `RadioGroup` hoặc `Select` theo
  số lựa chọn và accessibility.

Pattern baseline từ US-016A-D:

- US-016B đã thiết lập ngôn ngữ dashboard data-first: số liệu phải dễ scan,
  typography có chủ đích, không dùng emoji/CTA giả trong bề mặt nghiệp vụ.
- US-016C đặt chuẩn cho table-heavy route: giữ contract dữ liệu, ưu tiên
  scanability, mobile fallback rõ và row action dễ chạm.
- US-016D đặt chuẩn cho command-bar filter, applied summary và `AppSelect`/
  `DashboardDataTable` khi phù hợp.
- US-016A nhắc lại auth/error/pending states phải rõ, không để UI scaffold.

## Interface Contract

Users page nên là admin operations surface:

- table/list nhấn mạnh identity, role, active state và action;
- create/edit dialog dùng labels rõ, helper text ngắn và inline errors;
- destructive or permission-sensitive controls cần disabled/guard copy rõ;
- mobile layout vẫn cho admin nhận diện đúng user trước khi thao tác.

## Target UI Shape

- Top section: page title gọn, context admin-only ngắn, create-user action chính
  và summary strip.
- Filters: một command area gọn với search, role filter, status filter và clear
  state. Controls phải dùng được trên mobile mà không đẩy table tràn ngang.
- Table/list: identity cell là nội dung chính, role/status badges dễ scan, row
  action nói rõ đang sửa user nào. Empty state phân biệt không có user và không
  có kết quả theo filter nếu làm được mà không đổi behavior.
- Dialogs: create/edit flows nên dùng contract hiện có của `DialogFrame`,
  `DialogActions`, `Field`, `TextField`, `SelectField` và `ActionMessage` trừ
  khi implementation ghi rõ ngoại lệ đã review.
- Shadcn contract: nếu `DialogFrame` hoặc dashboard form wrappers không đủ cho
  yêu cầu mới, không tạo overlay/form primitive riêng; thêm component shadcn phù
  hợp và compose wrapper từ đó.
- Pending/error states: submit button có pending state, field không nên sửa được
  thì disabled kèm helper copy ngắn, server action message vẫn nhìn thấy sau
  failure.

## Mobile App-Like Workflow

Mobile không dùng desktop table thu nhỏ. Target 390px viewport:

- Top app area: title ngắn, summary số liệu quan trọng và create action dễ chạm.
  Header có thể sticky nếu implementation thấy cần, nhưng không che content.
- Search-first flow: input search là control nổi bật nhất sau summary. Role và
  status filter nên là compact controls hoặc filter sheet, có applied summary và
  clear action.
- User list: mỗi user là một row/card gọn, không nested card. Identity ở dòng
  đầu, username/email ở dòng phụ, role/status bằng `Badge`, trạng thái inactive
  không chỉ dựa vào màu.
- Row action: một action rõ như `Sửa` hoặc menu shadcn `DropdownMenu` nếu có
  nhiều hành động. Không để icon-only action thiếu accessible label.
- Create/edit: nếu form dài hoặc cần cảm giác app-native hơn, ưu tiên shadcn
  `Sheet` hoặc `Drawer` sau khi thêm từ registry; nếu tiếp tục dùng `Dialog`,
  phải chứng minh dialog không clipped, không scroll trap và primary action vẫn
  nằm trong vùng chạm thoải mái.
- Permission-sensitive controls: role/status nằm trong group riêng, có helper
  copy ngắn, disabled state rõ khi guard last-active-admin chặn thao tác.
- Bottom nav coexistence: create/edit controls và sticky actions không được che
  navigation dưới cùng hoặc bị navigation che.

## State Contract

- Search, role filter and status filter remain client-side over the loaded
  `ManagedUser[]`.
- `getManagedUserSummary()` and `filterManagedUsers()` behavior remains stable
  unless tests are updated first.
- Create/update forms continue using server actions and `revalidatePath`.
- Last-active-admin guard remains enforced by server-side logic; UI copy may
  explain the guard but must not become the only protection.

## Responsive Contract

- Desktop width should prioritize table scan density.
- Mobile width must provide a purpose-built user-management flow, not only a
  scaled desktop table.
- Mobile width should preserve identity, role/status and edit affordance without
  horizontal page overflow.
- Mobile cards/rows need stable dimensions and touch targets; hover-only
  affordance is not enough.
- Dialogs/sheets/drawers must fit a 390px-wide viewport without clipped primary
  actions.
- Text may wrap, but labels/buttons must not overlap adjacent controls.

## Security Boundary

Không thay đổi authorization trong polish story. Nếu polish phát hiện UX cần đổi
RBAC, create/update lifecycle hoặc audit side effects, tạo follow-up high-risk
story thay vì sửa trong US-016E.

Guardrails:

- Admin-only route behavior remains fail-closed.
- Editor/Viewer action calls remain denied even if UI is unreachable.
- Role enum remains `admin`, `editor`, `viewer`.
- Active/inactive membership behavior remains unchanged.
- Audit side effects from create/update flows remain unchanged.

## Testing Focus

Kiểm tra admin-only render, role/status form states, last active admin guard và
browser mobile no-overflow.

Suggested focused checks:

- Rendering tests for summary/filter/table/dialog states touched by polish.
- Existing `lib/user-management/users.test.ts` and `last-admin.test.ts` remain
  green.
- Browser proof covers desktop `/dashboard/users`, mobile `/dashboard/users`,
  create dialog open, edit dialog open, filter/search state, and permission
  denied state if test auth fixtures support it.
