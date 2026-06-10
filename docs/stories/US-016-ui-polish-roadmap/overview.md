# US-016 - Roadmap polish UI cho các trang chính

## Trạng thái

planned

## Lane

normal

## Product Contract

US-016 gom các story polish UI cho các route đã có, không tạo workflow mới.
Mục tiêu là làm giao diện nhất quán, dễ quét, responsive tốt hơn và đủ trạng
thái loading/empty/error/focus mà không đổi dữ liệu, quyền, API, SQL hoặc
server-state contract hiện tại.

## Current Behavior

App đã có shell dashboard, đăng nhập, dashboard overview, analytics, samples và
user management. Các trang dùng Next.js App Router, Tailwind CSS, shadcn/shared
UI, `DashboardDataTable`, Server Components/server actions và các proof Harness
riêng từ các story trước.

Các trang vẫn cần một pass polish thống nhất:

- `/login`: cần giảm cảm giác scaffold, làm rõ trạng thái đăng nhập và lỗi.
- `/dashboard`: cần hierarchy dữ liệu tốt hơn cho dashboard nội bộ.
- `/dashboard/analytics`: cần polish filter, chart/table và trạng thái dữ liệu.
- `/dashboard/samples`: cần tăng khả năng scan bảng/card, filter và row actions.
- `/dashboard/users`: cần polish admin table/form states mà không đổi RBAC.

## Target Behavior

US-016 chia rollout thành các story nhỏ, review và merge độc lập:

- [US-016A](../US-016A-sign-in-polish/overview.md): polish trang đăng nhập.
- [US-016B](../US-016B-dashboard-overview-polish/overview.md): polish dashboard
  overview.
- [US-016C](../US-016C-analytics-polish/overview.md): polish analytics và pivot.
- [US-016D](../US-016D-samples-polish/overview.md): polish samples grid.
- [US-016E](../US-016E-users-polish/overview.md): polish user management.

Thứ tự khuyến nghị:

1. US-016A để khóa trải nghiệm entry và auth error state.
2. US-016B để thiết lập ngôn ngữ visual cho dashboard nội bộ.
3. US-016C vì đã có analytics UI MVP và proof browser gần đây.
4. US-016D vì bảng mẫu có nhiều trạng thái và rủi ro responsive cao hơn.
5. US-016E sau cùng vì trang users chạm quyền admin và dialog/form nhiều hơn.

## Affected Users

- Admin: cần thao tác nhanh trên dashboard, analytics, samples và users.
- Editor: cần đọc và xử lý samples/analytics không bị nhiễu thị giác.
- Viewer: cần view-only rõ ràng, không thấy affordance chỉnh sửa sai quyền.
- Reviewer: cần PR nhỏ, validation rõ và không gom nhiều route vào một diff.

## Relevant Product Docs

- `docs/product/ui-contract.md`
- `docs/product/overview.md`
- `docs/product/roles-permissions.md`
- `docs/product/api-contract.md`
- `docs/FEATURE_INTAKE.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- Không đổi Auth.js/NextAuth flow, username/password contract hoặc RBAC.
- Không đổi API response, server actions, SQL, migration hoặc RLS.
- Không thêm TanStack Query hoặc client cache mới.
- Không thay dashboard shell sang sidebar; giữ header desktop và bottom nav
  mobile/tablet theo UI contract.
- Không redesign kiểu landing page, hero marketing hoặc motion nặng.
- Không sửa nhiều shared primitives nếu story route-level đủ; shared edits phải
  có code-deduplication và blast-radius riêng.
