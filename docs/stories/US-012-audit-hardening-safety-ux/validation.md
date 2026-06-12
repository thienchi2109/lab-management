# Validation

## Proof Strategy

US-012 chỉ được xem là xong khi chứng minh được từng write path chính có auth,
role check server-side, validation, audit hoặc no-op evidence có lý do, và error
response không lộ secret/PII. Với mọi DB write, validation phải đính kèm proof
đúng Supabase MCP namespace/project-ref trước khi apply.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Permission helpers, audit payload sanitizer, standard error mapper. |
| Integration | Viewer write bypass bị chặn; Editor không sửa result config; Admin config write có audit. |
| E2E | Permission-denied và destructive confirm cho các flow người dùng chính nếu UI bị chạm. |
| Platform | Supabase MCP project proof, RLS inspection, no secret exposure check, React Doctor. |
| Performance | Không thêm query/audit path gây N+1 rõ ràng trên write path chính. |
| Logs/Audit | Audit event có actor, tenant, action, target, outcome và metadata an toàn. |

## Fixtures

- User `admin` thuộc tenant demo.
- User `editor` thuộc cùng tenant.
- User `viewer` thuộc cùng tenant.
- Mẫu, result config, inventory item và export dataset nhỏ có thể dùng lại trong
  integration tests.

## Commands

Planned verification:

```text
scripts/bin/harness-cli story verify US-012
cd lab-kit-app && bun run quality
```

Additional commands depend on implementation scope and must be recorded after
the story is executed.

## Acceptance Evidence

Implementation ngày 2026-06-12:

- Test đỏ xác nhận `PUT /api/samples/:sampleId/results` từng trả nguyên lỗi
  nội bộ `service_role secret leaked from storage` ra client; fix đổi lỗi 500
  không phải `ResponseError` sang fallback công khai.
- Bổ sung regression cho `/api/analytics/pivot` để khóa fallback an toàn cho lỗi
  storage nội bộ.
- Bổ sung regression cho result-configuration server action: session `editor`
  bị chặn trước khi parse form hoặc tạo Supabase port.
- Supabase MCP read-only proof dùng namespace `mcp__supabase_lab_management`,
  project-ref từ URL `tuuqgpzgollcerqqszjr`, database `postgres`, schema
  `public`.
- Migration history hiện có các RPC audit chính:
  `result_configuration_audit_transaction_rpcs`,
  `result_template_audit_transaction_rpcs`,
  `sample_results_audit_transaction_rpc`,
  `sample_image_audit_transaction_rpcs`.
- RLS đang bật trên `audit_events`, `samples`, `sample_results`,
  `sample_group_conclusions`, `result_groups`, `result_metrics`,
  `result_templates`, `result_template_metrics`, `tenant_memberships`.
- Security advisor chỉ còn warning cấu hình Auth:
  `auth_leaked_password_protection`; không phát sinh từ code change này.
- Không chạy agent-browser E2E vì implementation không đổi UI, responsive hoặc
  browser flow; chưa cần tài khoản đăng nhập thật trong lượt này.

Commands đã chạy:

```text
cd lab-kit-app && bun run test app/api/samples/[sampleId]/results/route.test.ts
cd lab-kit-app && bun run test app/dashboard/result-configuration/actions.test.ts
cd lab-kit-app && bun run test app/api/samples/[sampleId]/results/route.test.ts app/api/analytics/pivot/route.test.ts
cd lab-kit-app && bun run test
cd lab-kit-app && bun run quality
cd lab-kit-app && bun run docstring:check
rtk code-review-graph update --repo /root/lab-management
```

Kết quả:

- Focused sample-results route: 7 tests passed.
- Focused result-configuration actions: 3 tests passed.
- Focused API hardening batch: 13 tests passed.
- Full Vitest: 87 files / 325 tests passed.
- `bun run quality` passed: typecheck, ESLint strict, Prettier, React Doctor
  không có blocking error, Next.js build pass.
- Docstring gate passed.
