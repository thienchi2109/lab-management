# Validation

## Proof Strategy

Story hoàn tất khi code/docs/live DB proof cùng chứng minh giới hạn 20 ảnh/mẫu
được hiểu thống nhất và chưa mở rộng sang upload nhiều file.

## Test Plan

| Layer | Cases |
| --- | --- |
| Supabase read proof | Namespace/project-ref/migration history/function/constraint giới hạn ảnh. |
| Unit | Limit 20, slot còn lại, vượt limit, MIME/size hiện có không regression. |
| Integration | API/domain không tin client khi kiểm tra số ảnh hiện có. |
| Platform | Typecheck, React Doctor diff, schema validation, docstring gate nếu có export đổi. |

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.
