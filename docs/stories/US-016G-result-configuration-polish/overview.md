# US-016G - Polish cấu hình chỉ tiêu

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/dashboard/result-configuration` để Admin quản lý nhóm, chỉ tiêu và mẫu
cấu hình dễ scan hơn, dialog/form states rõ hơn và mobile không tràn ngang.
Không đổi server actions, validation, authorization, audit behavior hoặc schema
contract của result configuration.

Story này mở rộng roadmap US-016 sau US-016A-E.

## Current Behavior

Trang cấu hình chỉ tiêu đã có summary strip, search, filter theo panel nhóm/chỉ
tiêu/mẫu cấu hình và các dialog tạo mới. Đây là admin configuration surface nên
cần polish có kiểm soát, không mở rộng chức năng cấu hình.

## Acceptance Criteria

- Header/action area phân biệt rõ thao tác cấu hình nghiệp vụ với data browsing.
- Summary strip và panel selector giúp Admin hiểu đang xem nhóm, chỉ tiêu hay
  mẫu cấu hình.
- Search/filter command surface gọn, responsive và không gây layout shift.
- Lists/cards cho groups, metrics, templates dễ scan hơn trên desktop và mobile.
- Create dialogs có label, helper/error/pending/disabled states rõ và không tràn
  trên mobile.
- Permission/audit/server-action behavior giữ nguyên.
- Không thêm workflow cấu hình mới, không đổi threshold/result semantics.

## Relevant Files

- `lab-kit-app/app/dashboard/result-configuration/page.tsx`
- `lab-kit-app/app/dashboard/result-configuration/_components/result-configuration-client.tsx`
- `lab-kit-app/app/dashboard/result-configuration/_components/result-configuration-lists.tsx`
- `lab-kit-app/app/dashboard/result-configuration/_components/result-configuration-dialogs.tsx`
- `lab-kit-app/lib/result-configuration/*`
- `docs/stories/US-004-result-configuration-admin-module/*`
- `docs/stories/US-016-ui-polish-roadmap/*`
