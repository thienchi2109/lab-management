# Validation

## Proof Strategy

Story hoàn tất khi tests chứng minh upload nhiều file hoạt động theo queue,
không vượt slot, không phá delete audit/provider cleanup và Viewer vẫn read-only.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Slot remaining, batch vượt slot, per-file failure state. |
| Integration | Upload metadata API, duplicate public ID, delete audit payload, provider cleanup. |
| Component | Multi-file select, upload progress, Viewer read-only, delete icon còn accessible. |
| Platform | Typecheck, React Doctor diff, docstring gate nếu thêm named exports. |

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.
