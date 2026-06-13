# US-016F - Polish kho KIT

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/dashboard/kits` để bề mặt tồn kho KIT dễ scan hơn, nhất quán hơn với
US-016A-E và responsive tốt hơn. Không đổi inventory schema, server actions,
authorization, audit behavior, Supabase contract hoặc trạng thái nghiệp vụ.

Story này mở rộng roadmap US-016 sau khi các slice US-016A-E đã hoàn tất.

## Current Behavior

Trang kho KIT đã có header, summary strip, search, filter theo trạng thái/loại
KIT, bảng `DashboardDataTable` và các dialog tạo loại KIT, tạo lô, thêm KIT,
cập nhật trạng thái. UI hiện dùng được nhưng vẫn cần pass polish cho density,
hierarchy, filter/action states, dialog ergonomics và mobile scan.

## Acceptance Criteria

- Header/action area làm rõ đây là inventory operations surface, không giống
  dashboard marketing.
- Summary strip giúp Admin/Editor scan tồn kho, đã gán, đã dùng, hết hạn hoặc
  trạng thái quan trọng nếu dữ liệu hiện có hỗ trợ.
- Search/filter nằm trong command surface gọn, dùng shared `FilterSelect` /
  shadcn wrapper hiện có, không tạo native select mới nếu wrapper phù hợp.
- Desktop table dễ scan theo mã KIT, loại KIT, lô, hạn dùng, trạng thái và action
  cập nhật.
- Mobile list/card không tràn ngang, action cập nhật trạng thái dễ chạm và không
  bị bottom nav che.
- Dialog tạo loại KIT, tạo lô, thêm KIT và cập nhật trạng thái có spacing,
  label, helper/error/pending/disabled states rõ.
- Không đổi server actions, audit, validation schema, status semantics hoặc data
  contract.

## Relevant Files

- `lab-kit-app/app/dashboard/kits/page.tsx`
- `lab-kit-app/app/dashboard/kits/_components/kit-inventory-client.tsx`
- `lab-kit-app/app/dashboard/kits/_components/kit-inventory-dialogs.tsx`
- `lab-kit-app/lib/kit-inventory/*`
- `docs/stories/US-005-kit-inventory-module/*`
- `docs/stories/US-016-ui-polish-roadmap/*`
