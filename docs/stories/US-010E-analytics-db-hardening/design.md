# Design

## Domain Model

US-010E không đổi domain. Nó chỉ đánh giá query shapes phát sinh từ US-010A-D.

## Application Flow

1. Liệt kê analytics queries thật sau implementation.
2. Kiểm tra live DB target, migration history và target tables/functions.
3. Chạy advisor/EXPLAIN đại diện.
4. Quyết định conditional no-op hoặc forward-only migration/RPC/index.
5. Ghi bằng chứng vào validation và durable story.

## Interface Contract

Không thêm public API. Nếu cần RPC, contract RPC phải được ghi rõ và không nhận
raw SQL từ client.

## Data Model

Mọi DB write phải dùng namespace `mcp__supabase_lab_management`, project-ref
`tuuqgpzgollcerqqszjr`, forward-only migration và post-write verification.

## UI / Platform Impact

Không sửa UI.

## Observability

Trace phải ghi row counts, advisor/EXPLAIN summary, target proof và lý do
no-op/migration.

## Alternatives Considered

1. Thêm indexes trước.
   - Bị loại vì US-009E đã chứng minh không nên harden speculative.

2. Bỏ hẳn hardening slice.
   - Bị loại vì analytics query shape khác data grid và có thể cần proof riêng.
