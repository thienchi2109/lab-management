# Design

## Domain Model

US-009C không đổi domain data. Column visibility là preference local/session
của browser, không phải application record.

## Application Flow

1. Người dùng mở grid từ US-009B.
2. Layout chọn compact mode phù hợp viewport.
3. Người dùng ẩn/hiện cột.
4. Preference lưu local/session và được khôi phục khi reload.
5. Server query không thay đổi vì preference không mutation server.

## Interface Contract

- Compact/mobile mode không tràn ngang.
- Column toggle chỉ áp dụng trên các cột được cho phép.
- Preference storage có fallback khi storage không khả dụng.
- Tên storage key ổn định và tránh chứa dữ liệu tenant nhạy cảm.

## Data Model

Không thêm schema và không ghi preference vào database.

## UI / Platform Impact

Slice này chạm responsive layout và dashboard interaction state.

Implementation phải:

- invoke Build Web Apps plugin capability trước UI work;
- invoke `code-deduplication` trước helper/persistence adapter nếu có;
- giữ `DashboardDataTable` làm table surface;
- browser verification mobile và desktop.

## Observability

Không log preference payload chi tiết. Không ghi audit log cho column visibility.

## Alternatives Considered

1. Lưu column visibility vào database.
   - Bị loại khỏi MVP slice vì tăng ownership/permission contract.

2. Lưu local/session.
   - Được chọn vì đủ cho Phase 8 và không cần server mutation.
