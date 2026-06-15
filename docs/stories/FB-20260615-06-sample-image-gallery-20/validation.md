# Validation

## Proof Strategy

Story hoàn tất khi tests, DB proof và browser proof cùng chứng minh gallery 20
ảnh hoạt động, không vượt slot và vẫn bảo toàn audit/provider safety.

## Test Plan

| Layer | Cases |
| --- | --- |
| Supabase read proof | Namespace/project-ref/migration history/function/constraint giới hạn ảnh. |
| Unit | Limit 20, MIME/size validation, slot remaining, duplicate public ID. |
| Integration | Upload metadata API, delete API, audit payload, provider cleanup. |
| Component | Multi-file select, upload progress, thumbnail grid, preview next/previous, Viewer read-only. |
| Browser | Mobile/desktop gallery, no overflow, controls usable. |
| Platform | Typecheck, React Doctor diff, schema validation, docstring gate. |

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.

