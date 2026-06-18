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

- RED đã fail đúng lý do: domain còn chặn 10 ảnh và schema contract còn tìm
  RPC `current_image_count >= 10`.
- GREEN: `cd lab-kit-app && bun run test -- lib/sample-images` pass 5 files,
  21 tests.
- Platform: `cd lab-kit-app && bun run typecheck` pass.
- Platform: `cd lab-kit-app && bun run react-doctor:diff` pass, no issues.
- Platform: `cd lab-kit-app && bun run docstring:check` pass.
- Schema: `node scripts/validate-supabase-schema.mjs` pass.
- Supabase read/write proof: namespace `mcp__supabase_lab_management`,
  project-ref `tuuqgpzgollcerqqszjr`, repo `/root/lab-management`, migration
  history now includes `20260618141838_sample_image_limit_20`, and live
  `public.create_sample_image_with_audit(...)` checks
  `current_image_count >= 20`.
