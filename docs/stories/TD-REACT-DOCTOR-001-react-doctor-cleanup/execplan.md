# TD-REACT-DOCTOR-001 Exec Plan

## TDD Plan

1. RED: thêm accessibility test cho search label association.
2. RED: thêm concurrency test cho sample image delete route.
3. RED: thêm concurrency test cho confirm sample image upload.
4. RED: thêm source-contract tests cho `Set` lookup và `toSorted`.
5. RED: thêm hoặc mở rộng test concurrency cho result summary server nếu cảnh
   báo đến từ await độc lập thật.
6. GREEN: sửa production code tối thiểu.
7. VERIFY: chạy focused tests, React Doctor full scan, và quality gate.

## Harness Commands

- `scripts/bin/harness-cli intake ... --story TD-REACT-DOCTOR-001`
- `scripts/bin/harness-cli story add --id TD-REACT-DOCTOR-001 ...`
- `scripts/bin/harness-cli story update --id TD-REACT-DOCTOR-001 ...`
- `scripts/bin/harness-cli trace ...`

