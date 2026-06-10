# US-016B - Polish dashboard overview

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/dashboard` để dashboard overview dễ quét hơn cho dữ liệu mẫu, KIT, PCR
và mẫu gần đây. Không đổi analytics read ports, query contract hoặc role access.

## Current Behavior

US-010B đã đưa `/dashboard` sang dữ liệu thật, gồm cards, trend, PCR metrics và
recent samples. Trang cần một pass polish để thống nhất hierarchy, density, số
liệu, spacing và trạng thái ít dữ liệu.

## Acceptance Criteria

- Metric cards và trend có hierarchy rõ, số liệu dùng tabular numbers.
- Recent samples dễ scan trên desktop và mobile, không tràn ngang.
- Loading/empty/error hoặc low-data states không nhìn như khoảng trắng lỗi.
- Header/shell hiện tại được giữ; không thêm sidebar.
- Viewer vẫn chỉ đọc, không thấy CTA chỉnh sửa sai quyền.
- Không đổi dữ liệu trả về từ analytics dashboard read port.

## Design Notes

- Dùng dashboard tone nghiêm túc, không marketing hero.
- Nếu thiết lập visual language chung, ghi rõ token/spacing dùng lại được nhưng
  không refactor shared primitives khi chưa cần.
- Ưu tiên cải thiện route components hiện có trước khi chạm shared components.

## Non-Goals

- Không thêm KPI mới hoặc chart mới.
- Không đổi API, database query, date range contract hoặc refresh strategy.
- Không thêm client cache mới.
