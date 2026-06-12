# US-016D - Polish analytics và pivot

## Trạng thái

planned

## Lane

normal

## Product Contract

Polish `/dashboard/analytics` để filter, summary, chart và pivot table rõ hơn
trong cả desktop và mobile. Không đổi Pivot API, whitelist filters, bounded date
contract hoặc analytics query behavior.

## Current Behavior

US-010D đã có analytics page MVP với filter date/status/dimension, filter
summary, chart/table và responsive mobile table/card states. Cần polish UI để
giảm cảm giác MVP, làm rõ trạng thái filter và dữ liệu rỗng.

## Acceptance Criteria

- Filter controls rõ nhóm, dễ scan và có summary sau khi áp dụng.
- Chart/table fallback rõ khi không có dữ liệu.
- Mobile không bung matrix rộng và không cần horizontal scroll bất thường.
- Loading/error states của analytics page nhất quán với dashboard app.
- Viewer đọc được analytics mà không có affordance sửa dữ liệu.
- Không đổi `/api/analytics/pivot` request/response contract.

## Design Notes

- Ưu tiên polish controls và information hierarchy hơn motion.
- Table/list surfaces phải dùng shared pattern hiện có hoặc ghi rõ ngoại lệ.
- Không thêm thư viện chart/animation mới nếu ECharts và CSS hiện tại đủ.

## Non-Goals

- Không thêm dimensions/options mới.
- Không đổi DB/RPC/index hardening của US-010E.
- Không đổi export behavior hoặc API error envelope.
