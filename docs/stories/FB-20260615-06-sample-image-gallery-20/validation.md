# Validation

## Proof Strategy

Parent story hoàn tất khi 06A, 06B và 06C cùng pass. Nếu 06A phát hiện cần
migration forward-only, parent chỉ được close sau khi migration slice bổ sung
đã có proof.

## Test Plan

| Layer | Cases |
| --- | --- |
| 06A | Limit 20, product docs, Supabase read proof, schema validation. |
| 06B | Multi-file upload queue, slot enforcement, delete audit/provider cleanup. |
| 06C | Thumbnail grid, preview next/previous, Viewer read-only, browser no-overflow. |
| Parent | Aggregate proof từ các slice và Harness story verify cho từng slice. |

## Acceptance Evidence

Chưa có. Parent story đang ở trạng thái planned và đã được tách thành 06A,
06B, 06C.
