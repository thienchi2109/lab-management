# FB-20260623-02E - Admin lưu bộ lọc mặc định Báo cáo cho Viewer

## Current Behavior

Tab `Báo cáo` hiện là chế độ đọc analytics. Admin, Editor và Viewer đều được
đọc theo role analytics hiện có, nhưng chưa có cấu hình filter bền vững. Viewer
có thể xem báo cáo theo filter UI hiện tại, nhưng không có cơ chế Admin lưu cấu
hình để Viewer mới vào thấy cùng trạng thái.

## Target Behavior

Admin có thể chỉnh bộ lọc theo từng biểu đồ báo cáo và lưu thành cấu hình mặc
định của tổ chức. Viewer khi mở tab `Báo cáo` lần đầu sẽ thấy cấu hình Admin đã
lưu. Nếu Viewer tự chỉnh filter để xem, thay đổi chỉ áp dụng cho phiên/xem cá
nhân và không ghi đè cấu hình mặc định.

## Affected Users

- Admin: cấu hình chế độ xem mặc định cho báo cáo.
- Viewer: xem báo cáo theo cấu hình Admin nhưng vẫn tự lọc tạm thời.
- Editor: cần giữ quyền hiện tại; nếu Editor không được lưu preset thì UI phải
  thể hiện rõ.

## Affected Product Docs

- `docs/product/roles-permissions.md`
- `docs/product/ui-contract.md`
- `docs/product/api-contract.md`
- `docs/product/data-model.md`
- `docs/stories/FB-20260623-02D-report-per-chart-filters.md`

## Non-Goals

- Không thay đổi role hiện có.
- Không cho Viewer lưu cấu hình mặc định.
- Không dựng lại toàn bộ pivot table giống Excel.
- Không lưu dữ liệu báo cáo đã aggregate; chỉ lưu cấu hình filter/presentation.
- Không thêm chart mới ngoài 4 chart trong feedback.
