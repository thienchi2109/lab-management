# FB-20260623-01 - Thu gọn bộ lọc Kho KIT trên mobile

## Trạng thái

in_progress

## Lane

normal

## Product Contract

Trên mobile, `/dashboard/kits` dùng pattern toolbar + bottom sheet giống trang
Samples để gom tìm kiếm, trạng thái và loại KIT vào một nút lọc gọn. Desktop
giữ filter inline hiện tại. Không đổi dữ liệu, server action, quyền, audit,
schema hoặc semantics trạng thái KIT.

## Acceptance Criteria

- Mobile chỉ hiện toolbar tìm/lọc gọn trước danh sách KIT.
- Nhấn toolbar hoặc nút `Bộ lọc` mở bottom sheet chứa tìm kiếm, trạng thái và
  loại KIT.
- Desktop tiếp tục hiển thị search/filter inline trong command band.
- Pattern bottom sheet tái sử dụng shared UI, không copy lại shell của Samples.
- Test regression khóa toolbar mobile và bottom sheet filter của Kho KIT.

## Relevant Files

- `lab-kit-app/app/dashboard/kits/_components/kit-inventory-command-band.tsx`
- `lab-kit-app/app/dashboard/kits/_components/kit-inventory-client.tsx`
- `lab-kit-app/app/dashboard/samples/_components/sample-grid-mobile-filter-sheet.tsx`
- `lab-kit-app/components/ui/overlay-frame.tsx`
- `lab-kit-app/components/dashboard/filter-select.tsx`
