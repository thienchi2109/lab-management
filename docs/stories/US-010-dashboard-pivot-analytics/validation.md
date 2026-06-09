# Validation

## Proof Strategy

US-010 parent chỉ hoàn tất khi các slice bắt buộc đã có proof riêng và không
còn phần Phase 9 bắt buộc nào bị treo trong parent tracker.

Proof bắt buộc:

- US-010A verify parser/whitelist/filter summary/read port và no raw SQL.
- US-010B verify dashboard overview dùng dữ liệu thật bounded, không còn
  hard-coded cards/chart/list chính.
- US-010C verify pivot API auth/role/error contract và unbounded-query guard.
- US-010D verify `/dashboard/analytics`, filter summary, read-only Viewer flow,
  responsive states và browser proof.
- US-010E verify live DB/advisor/EXPLAIN survey và đóng conditional no-op hoặc
  migration proof forward-only nếu thật sự cần.

## Test Plan

Parent tracker không có runtime tests riêng. Mỗi slice phải chạy test plan trong
packet của slice đó. Parent closeout kiểm tra:

- tất cả slice bắt buộc có durable story flags phù hợp;
- `scripts/bin/harness-cli story verify <slice>` pass cho từng slice;
- không có slice nào bị gộp ngược vào một PR quá lớn;
- US-010E có kết luận DB rõ ràng.

## Fixtures

Xem fixture từng slice. Parent tracker chỉ cần bằng chứng Harness và link đến
validation evidence của các slice.

## Commands

Khi các slice bắt buộc hoàn tất:

```bash
scripts/bin/harness-cli story verify US-010A
scripts/bin/harness-cli story verify US-010B
scripts/bin/harness-cli story verify US-010C
scripts/bin/harness-cli story verify US-010D
scripts/bin/harness-cli story verify US-010E
scripts/bin/harness-cli story verify US-010
```

## Acceptance Evidence

- Intake source checked: product docs, US-009 packet, current dashboard shell,
  sample grid query/server helpers and historical Phase 9 roadmap.
- Parent story packet created before implementation.
- Decomposed on intake `#27` into US-010A, US-010B, US-010C, US-010D and
  US-010E before runtime implementation.
- Runtime implementation and validation proof are pending.
