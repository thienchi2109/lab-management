# Exec Plan

## Goal

Nâng ảnh minh chứng lên gallery 20 ảnh, hỗ trợ upload nhiều ảnh và xem ảnh lớn.

## TDD Flow

1. 06A: RED/GREEN giới hạn 20 ảnh, product docs và Supabase read proof.
2. 06B: RED/GREEN upload nhiều file, slot enforcement, delete audit/provider
   cleanup và Viewer read-only controls.
3. 06C: RED/GREEN thumbnail grid, preview lớn, next/previous và browser proof.
4. Parent chỉ được close khi cả ba slice có evidence, hoặc khi có migration
   slice phát sinh đã hoàn tất.

## Stop Conditions

- Dừng nếu project-ref Supabase không đúng.
- Dừng nếu Cloudinary config thiếu cho live smoke; dùng mocked provider tests và
  ghi skipped provider proof.
- Dừng nếu DB/RPC hiện có logic giới hạn 10 đã applied live nhưng chưa có
  migration path forward-only.

## Expected Commands

```bash
scripts/bin/harness-cli story verify FB-20260615-06A
scripts/bin/harness-cli story verify FB-20260615-06B
scripts/bin/harness-cli story verify FB-20260615-06C
```
