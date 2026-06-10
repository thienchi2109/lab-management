# Design

## Design Read

Đọc yêu cầu này như một pass polish cho app nội bộ quản lý lab, hướng tới Admin,
Editor và Viewer thao tác dữ liệu lặp lại hằng ngày. Ngôn ngữ thiết kế nên
nghiêm túc, rõ ràng, giàu khả năng scan, không theo phong cách marketing.

## Roadmap Strategy

Mỗi story con xử lý một route hoặc một cụm route hẹp. Story được phép cải thiện
visual hierarchy, spacing, typography, states, responsive behavior và affordance
nhưng phải giữ nguyên data flow hiện có.

Các thay đổi nên ưu tiên theo thứ tự:

1. Typography, density và scan hierarchy.
2. Surface/border/shadow consistency.
3. Loading, empty, error, disabled và permission-denied states.
4. Mobile/tablet responsive constraints.
5. Focus, hover và active states.
6. Browser screenshot proof desktop/mobile.

## Shared UI Boundary

Shared components chỉ được sửa khi ít nhất hai story chứng minh cùng một vấn đề.
Nếu cần sửa shared component, story triển khai phải:

- invoke `code-deduplication`;
- dùng Code Review Graph trước khi đọc/chạm shared code;
- kiểm tra `DashboardDataTable`, form fields, dialogs, nav và primitives;
- cập nhật story proof cho mọi route bị ảnh hưởng.

## Route Mapping

| Story | Route | Main surface |
| --- | --- | --- |
| US-016A | `/login` | Sign-in form, auth feedback, responsive entry |
| US-016B | `/dashboard` | Overview cards, trend, PCR metrics, recent samples |
| US-016C | `/dashboard/analytics` | Filters, pivot chart/table, summary states |
| US-016D | `/dashboard/samples` | Sample grid, filters, row actions, mobile cards |
| US-016E | `/dashboard/users` | Admin user table, filters, create/edit dialogs |

## Taste Skill Use

Use `redesign-existing-projects` and relevant taste-skill guidance as an audit
checklist, not as a full aesthetic rewrite. Apply only the parts that fit a
data-heavy internal dashboard:

- keep density useful, not airy marketing;
- avoid AI-purple gradients and generic card stacks;
- keep one restrained accent system;
- prefer tabular numbers for metrics;
- use skeletons/structured states instead of generic spinners;
- keep button labels short and accessible;
- verify contrast, focus rings and mobile overflow.
