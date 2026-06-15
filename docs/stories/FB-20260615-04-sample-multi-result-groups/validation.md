# Validation

## Proof Strategy

Story hoàn tất khi live DB, domain tests và browser proof cùng chứng minh một
mẫu có nhiều nhóm, result entry tách nhóm và không mất dữ liệu kết quả cũ.

## Test Plan

| Layer | Cases |
| --- | --- |
| Supabase read proof | Namespace/project-ref/migration history/tables/functions liên quan. |
| Migration | Forward-only migration nếu schema thiếu relation hoặc constraint. |
| Unit | Payload validation, group selection mapper, duplicate/invalid group handling. |
| Integration | Create sample với nhiều nhóm, result entry load đúng nhóm, filter theo nhóm. |
| Browser | Tạo mẫu nhiều nhóm, mở kết quả thấy nhóm riêng. |
| Platform | Typecheck, React Doctor diff, schema validation, docstring gate. |

## Acceptance Evidence

Chưa có. Story đang ở trạng thái planned.

