# US-016E - Polish user management

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/dashboard/users` để admin user management rõ hơn, nhất quán hơn và có
form/dialog states tốt hơn. Không đổi RBAC, admin-only route guard, last active
admin guard, audit behavior hoặc Supabase admin path.

Story này nối tiếp US-014 và nằm trong roadmap US-016. Đây là polish UI cho bề
mặt admin vận hành, không phải mở rộng chức năng quản trị người dùng.

## Relevant Product Docs

- `docs/product/ui-contract.md`
- `docs/product/roles-permissions.md`
- `docs/stories/US-014-user-management-role-administration/overview.md`
- `docs/stories/US-016-ui-polish-roadmap/overview.md`
- `docs/stories/US-016A-sign-in-polish/overview.md`
- `docs/stories/US-016B-dashboard-overview-polish/overview.md`
- `docs/stories/US-016C-samples-polish/overview.md`
- `docs/stories/US-016D-analytics-polish/overview.md`

## Frontend Skill Context

Story packet này được gom lại sau khi đọc các skill:

- `build-web-apps:frontend-app-builder`: dùng làm chuẩn cho thiết kế UI polish,
  concept, fidelity và browser verification.
- `redesign-existing-projects`: dùng làm checklist audit cho UI hiện có, ưu
  tiên sửa có mục tiêu trong stack hiện tại thay vì viết lại.
- `build-web-apps:frontend-testing-debugging`: dùng làm chuẩn browser proof cho
  desktop/mobile, no overlay, console health, screenshot và interaction proof.
- `build-web-apps:shadcn` / `vercel:shadcn`: dùng làm chuẩn component selection,
  CLI, composition, semantic tokens và registry workflow.

Không yêu cầu Image Gen ở bước gom story packet vì đây là UI polish nhỏ trong
design system hiện có. Nếu implementation sau này đổi visual direction lớn hơn
route-level polish, phải tạo concept hoặc visual direction rõ trước khi code.

Shadcn project context đọc ngày 2026-06-13:

- Framework: Next.js App Router, RSC enabled, TypeScript.
- Style/base: `radix-nova`, base `radix`, Tailwind v4.
- Alias: `@/components/ui`, `@/components`, `@/lib/utils`.
- Icon library: `lucide`.
- Installed shadcn UI components: `badge`, `button`, `card`, `checkbox`,
  `input`, `select`, `tooltip`.

## Current Behavior

US-014 đã triển khai user management cho Admin: list users, search/filter,
create/update profile, role, active state và last-active-admin guard. Trang cần
polish table/form/dialog states nhưng phải giữ nguyên boundary bảo mật.

Context đọc ngày 2026-06-13:

- Route chính: `lab-kit-app/app/dashboard/users/page.tsx`.
- Client surface: `app/dashboard/users/_components/user-management-client.tsx`.
- Các component cục bộ: `users-page-content.tsx`, `user-summary-strip.tsx`,
  `user-table.tsx`, `user-form-dialogs.tsx`.
- Logic bất biến cần giữ: `lib/user-management/users.ts`,
  `lib/user-management/last-admin.ts`, `lib/user-management/operations.ts`,
  `lib/user-management/server.ts`.
- Shared UI liên quan: `components/dashboard/filter-select.tsx`,
  `components/dashboard/dialog-frame.tsx`,
  `components/dashboard/form-fields.tsx`,
  `components/dashboard/action-message.tsx`,
  `components/ui/button.tsx`, `components/ui/input.tsx`,
  `components/ui/badge.tsx`, `components/ui/card.tsx`.
- Các file Users hiện đều dưới giới hạn 350 dòng; nếu polish làm file nào vượt
  giới hạn, phải tách component trước khi tiếp tục.

## Acceptance Criteria

- Header/summary của `/dashboard/users` cho Admin hiểu nhanh tổng số, active,
  inactive và admin count mà không tạo cảm giác dashboard marketing.
- Bộ lọc/search nằm trong command surface gọn, giữ trạng thái rõ, không gây
  layout shift trên mobile.
- Admin table dễ scan theo identity, role, active state, created/last updated
  context nếu có, và action chính; empty state nói rõ filter không có kết quả.
- Mobile viewport có workflow riêng theo hướng app hiện đại: Admin nhìn thấy
  identity, role, active state và action chính của từng user mà không phải zoom,
  kéo ngang hoặc đọc bảng desktop bị ép nhỏ.
- Mobile create/edit flow dùng sheet/dialog app-like với vùng thao tác rõ, input
  đủ lớn, primary action dễ chạm và guard copy nằm gần control nhạy quyền.
- Create/edit dialogs có label, helper/error text, disabled/pending states và
  focus flow rõ; nội dung dài không tràn trên mobile.
- Role/status controls thể hiện đây là thao tác admin nhạy quyền, không tạo cảm
  giác user thường có thể tự sửa quyền.
- Last active admin guard vẫn rõ trong UI và tests.
- Editor/Viewer không truy cập được route hoặc actions như hiện tại.
- Audit/security behavior không đổi.
- Desktop và mobile không có horizontal overflow, framework error overlay hoặc
  text chồng lấn.

## Design Notes

- Đây là story UI nhưng gần authorization boundary; không đổi server action
  contract trong cùng story nếu chưa có review high-risk.
- Nếu sửa shared dialog/form components, phải chứng minh ảnh hưởng lên samples
  và result configuration.
- Ưu tiên shared dashboard components. Table/list surface phải dùng
  `DashboardDataTable` nếu story triển khai thấy contract phù hợp; nếu chưa phù
  hợp, ghi rõ ngoại lệ trong implementation evidence.
- Không thêm client-cache mới. Giữ Server Component/server action flow hiện tại.
- Dùng lucide icons trong button/tool controls khi cần icon rõ nghĩa.

## Frontend, Reuse, And Caching Constraints

- Trước khi implementation UI/frontend, invoke Build Web Apps plugin capability
  theo `docs/FEATURE_INTAKE.md`.
- Trước khi tạo shared UI, hook, helper hoặc service mới, invoke
  `code-deduplication` và chứng minh không có contract phù hợp.
- Dùng shared dashboard primitives hiện có trước khi viết local markup mới:
  form fields, dialogs, filter selects, messages, table/list primitives,
  buttons, badges và cards.
- Không thêm TanStack Query hoặc client cache nếu không có yêu cầu cache cụ thể.

## Shadcn Component Policy

- Ưu tiên dùng lại shadcn components đã có trong `components/ui` và wrapper
  shared hiện có trước khi viết markup cục bộ.
- Không tự dựng primitive tương đương cho button, input, select, checkbox,
  badge, card, tooltip, table/list, empty/loading/error, dialog/sheet/popover,
  dropdown hoặc confirmation nếu shadcn đã có component phù hợp.
- Nếu cần component UI mới, phải lấy từ shadcn registry bằng CLI, xem docs trước
  bằng `shadcn docs <component>`, preview bằng `--dry-run`/`--diff` khi có rủi
  ro overwrite, rồi review source được thêm vào repo.
- Component mới phải theo shadcn composition: semantic tokens, variants có sẵn,
  `cn()`, `gap-*` thay cho `space-*`, `Badge` thay custom span, `Alert` cho
  callout/error, `Empty` cho empty state, `Skeleton` cho loading, `AlertDialog`
  cho destructive confirmation.
- Nếu môi trường Bun crash khi chạy shadcn CLI, dùng `npm exec --yes --package
  shadcn@latest -- shadcn ...` như fallback và ghi rõ trong evidence.

## Pattern Baseline Từ US-016A-D

- US-016A: khóa entry/auth states bằng copy rõ, pending state rõ và proof
  desktop/mobile.
- US-016B: ưu tiên dashboard tone nghiêm túc, data-first, tabular numbers,
  low-data/empty states, tránh greeting/CTA giả và card đồng đều không phân cấp.
- US-016C: giữ table contract, tăng scanability, row action rõ và mobile card
  mode không phụ thuộc horizontal scroll bất thường.
- US-016D: dùng compact command-bar filter, applied summary strip, shared
  `DashboardDataTable` khi phù hợp, và browser proof cho shadcn select/mobile
  no-overflow.

US-016E nên kế thừa các pattern trên theo bề mặt Users: admin operation surface
dày dữ liệu, không marketing hero, không affordance giả, không làm yếu
authorization boundary.

## Mobile Workflow Requirement

US-016E chưa được coi là đủ nếu chỉ đạt “không tràn ngang”. Implementation phải
thiết kế mobile như workflow quản trị trong mobile app:

- Danh sách mobile ưu tiên card/list rows có thứ tự đọc: tên hiển thị,
  username/email, role, active state, last-admin guard nếu liên quan, action sửa.
- Search là hành động chính trên mobile; role/status filters phải dễ mở/đóng và
  dễ reset, không chiếm quá nhiều chiều cao đầu trang.
- Primary action tạo user phải dễ chạm nhưng không che nội dung hoặc bottom nav.
- Edit/create nên dùng shadcn `Sheet`/`Drawer`/`Dialog` phù hợp sau khi kiểm tra
  docs; không dùng desktop modal bị thu nhỏ nếu form dài.
- Role/status thay đổi trên mobile phải có vùng chạm rõ và guard copy sát control
  để Admin hiểu rủi ro trước khi lưu.
- Browser proof phải kiểm tra thao tác thật trên `390x844`: tìm user, lọc role
  hoặc status, mở create, mở edit, đổi role/status control đến trước bước submit,
  và đóng flow mà không mắc scroll trap.

## Non-Goals

- Không thêm invite email, password reset, SSO hoặc bulk user management.
- Không đổi role model, membership model hoặc audit schema.
- Không đổi route guard/admin-only behavior.
- Không sửa migration đã apply; mọi thay đổi DB, nếu phát sinh ngoài ý muốn,
  phải chuyển thành follow-up forward-only migration story.
