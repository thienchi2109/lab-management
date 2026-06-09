# US-009C - Responsive Mode & Column Visibility

**Lane:** normal  
**Phase:** 8  
**Status:** implemented  
**Parent:** [US-009](../US-009-data-grid-filters-views/overview.md)  
**Depends on:** [US-009B](../US-009B-sample-grid-mvp/overview.md)

## Current Behavior

Sau US-009B, bảng mẫu MVP có thể dùng trên desktop nhưng chưa có compact/mobile
mode hoàn chỉnh hoặc tùy chọn ẩn/hiện cột lưu local/session.

## Target Behavior

Grid hỗ trợ responsive và preference nhẹ:

- mobile/tablet dùng compact/card hoặc compact row mode;
- không bung toàn bộ cột kết quả ra khỏi viewport;
- column visibility lưu local/session;
- refresh/reload giữ preference ở cùng browser context;
- không mutation server cho preference.

## Affected Users

- Admin, Editor, Viewer dùng grid trên mobile/tablet.
- Reviewer chỉ review UX responsive/preferences, không review query hoặc result
  group logic.

## Affected Product Docs

- `docs/product/ui-contract.md`
- `docs/product/tech-stack.md`
- `docs/TEST_MATRIX.md`

## Non-Goals

- Query contract changes.
- Row action permission changes.
- Group detail hoặc desktop result column mode.
- Lưu preference vào database.
