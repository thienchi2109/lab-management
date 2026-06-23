# Validation

## Proof Strategy

Story is complete only when the report chart data contract is proven without
rendering UI. Proof must show:

- query/parser rejects unsafe input;
- read use case is tenant-scoped and bounded by date range;
- each requested chart dataset can be produced from deterministic fixture data;
- missing/unknown domain values produce explicit labels or warnings;
- no internal Supabase error details reach clients.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Parser, mapper, chart segment aggregation, normalized `SẠCH`/`NHIỄM`, missing values. |
| Integration | API/read adapter returns 4 chart datasets for one organization and excludes other tenant data. |
| E2E | Không bắt buộc trong story này. |
| Platform | Supabase read proof; migration/advisor proof only if DB write becomes necessary. |
| Performance | Bounded date query and limit/aggregation proof; no unbounded full-table read. |
| Logs/Audit | Public 500 fallback does not expose internal errors. |

## Fixtures

- Một sample type tên `tôm PL`.
- Ít nhất hai kit type.
- Mẫu `Mẫu khách hàng` và `Mẫu nội bộ`.
- Kết quả chung PCR có `SẠCH`, `NHIỄM` và missing/null.
- Dữ liệu tenant khác để chứng minh tenant scope.

## Commands

Add commands after scripts/tests exist.

```text
TBD
```

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.
