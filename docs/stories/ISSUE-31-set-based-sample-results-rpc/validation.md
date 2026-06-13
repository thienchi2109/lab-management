# Validation

## Proof Strategy

Issue này phải có proof theo TDD:

1. Contract test đỏ trước khi có migration mới.
2. Migration forward-only làm test xanh.
3. Regression tests xác nhận caller TypeScript vẫn dùng RPC contract cũ.
4. Live verification sau apply xác nhận đúng target Supabase và function/grants
   không lệch bảo mật.

Không có UI/frontend work nên không cần browser proof, Build Web Apps plugin,
`DashboardDataTable`, hay TanStack Query exception.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit/Contract | Migration SQL định nghĩa `public.save_sample_results_with_audit` set-based bằng `jsonb_to_recordset` hoặc CTE tương đương; không còn vòng `FOR LOOP` xử lý `p_results`/`p_conclusions`; giữ `SECURITY DEFINER`, `search_path`, revoke/grant. |
| Application Regression | `saveResultsTransaction` vẫn gọi RPC `save_sample_results_with_audit` với `p_results`, `p_conclusions`, `p_audit_event`; `saveSampleResults` vẫn reject metric/group ngoài template ở app layer. |
| Database Integration | Live RPC reject metric ngoài active template, reject group ngoài active template, upsert nhiều result/conclusion trong một lần gọi, ghi đúng `sample_results`, `sample_group_conclusions`, và một `audit_events`. |
| Platform | Supabase migration apply qua namespace `mcp__supabase_lab_management` trên project-ref `tuuqgpzgollcerqqszjr`; advisors không báo regression bảo mật/performance nghiêm trọng mới. |
| Performance | Function definition không còn row-by-row upsert loop; nếu có fixture đủ lớn, so sánh `EXPLAIN` hoặc timing trước/sau trên batch nhiều metric. |
| Logs/Audit | Audit event vẫn có `action`, `entity_table`, `entity_id`, `event_payload`; không log secret/PII. |

## Fixtures

Fixtures cần có hoặc tạo trong transaction kiểm chứng:

- Một organization.
- Một actor/profile dùng làm `p_actor_id`.
- Một sample thuộc organization.
- Một active result template theo `sample_type_id`.
- Ít nhất hai active result metrics thuộc template.
- Ít nhất một metric ngoài template để test reject.
- Ít nhất hai result groups hợp lệ qua metrics trong template.
- Ít nhất một group ngoài template để test reject.

## Commands

RED:

```text
cd lab-kit-app && bun run test lib/sample-results/schema-contract.test.ts
```

Focused regression:

```text
cd lab-kit-app && bun run test lib/sample-results/schema-contract.test.ts lib/sample-results/operations.test.ts lib/sample-results/server.test.ts app/api/samples/[sampleId]/results/route.test.ts
```

Schema/script gate:

```text
node scripts/validate-supabase-schema.mjs
```

Quality gates:

```text
cd lab-kit-app && bun run react-doctor
cd lab-kit-app && bun run quality
```

Harness/graph gates:

```text
rtk code-review-graph update --repo /root/lab-management
scripts/bin/harness-cli story verify ISSUE-31-set-based-sample-results-rpc
```

## Acceptance Evidence

Discovery evidence captured before implementation:

- Issue #31 is open and asks for set-based validation/upsert of `p_results` and
  `p_conclusions`.
- Code Review Graph last updated `2026-06-12T15:41:59`, with 262 files and
  1458 nodes.
- Code Review Graph blast radius from `saveResultsTransaction` includes
  `lab-kit-app/lib/sample-results/server.ts`,
  `lab-kit-app/lib/sample-results/operations.ts`,
  `lab-kit-app/lib/sample-results/server.test.ts`,
  `lab-kit-app/lib/sample-results/operations.test.ts`, and
  `lab-kit-app/app/api/samples/[sampleId]/results/route.ts`.
- GitNexus context for `saveResultsTransaction` shows direct test coverage in
  `lab-kit-app/lib/sample-results/server.test.ts`.
- Supabase MCP namespace confirmed: `mcp__supabase_lab_management`.
- Supabase project-ref confirmed from URL:
  `https://tuuqgpzgollcerqqszjr.supabase.co`.
- Live migration history includes
  `20260607012745 sample_results_audit_transaction_rpc`; latest migration at
  discovery time is `20260610082743 analytics_samples_received_at_index`.
- Live function identity:
  `save_sample_results_with_audit(uuid,uuid,uuid,jsonb,jsonb,jsonb)`.
- Live function is `SECURITY DEFINER` with `search_path=public`.
- Live privileges show `EXECUTE` for `postgres` owner and `service_role`.
- Live target unique indexes exist for `(sample_id, result_metric_id)` and
  `(sample_id, result_group_id)`.

Implementation evidence captured on 2026-06-12:

- Branch: `issue-31-set-based-sample-results-rpc`.
- RED TDD:
  `cd lab-kit-app && bun run test lib/sample-results/schema-contract.test.ts`
  failed before migration because latest RPC definition did not contain
  `jsonb_to_recordset` and still showed row-by-row `FOR LOOP`.
- GREEN TDD:
  `cd lab-kit-app && bun run test lib/sample-results/schema-contract.test.ts`
  passed after adding
  `supabase/migrations/20260612155744_set_based_sample_results_rpc.sql`.
- Focused regression:
  `cd lab-kit-app && bun run test lib/sample-results/schema-contract.test.ts lib/sample-results/operations.test.ts lib/sample-results/server.test.ts app/api/samples/[sampleId]/results/route.test.ts`
  passed 4 files / 20 tests.
- Schema script:
  `node scripts/validate-supabase-schema.mjs` passed.
- Supabase write proof before apply:
  - namespace: `mcp__supabase_lab_management`;
  - project-ref: `tuuqgpzgollcerqqszjr`;
  - repo mapping: `/root/lab-management` to
    `https://tuuqgpzgollcerqqszjr.supabase.co`;
  - latest migration before apply:
    `20260610082743 analytics_samples_received_at_index`;
  - target function:
    `public.save_sample_results_with_audit(uuid,uuid,uuid,jsonb,jsonb,jsonb)`;
  - target tables: `samples`, `result_templates`, `result_template_metrics`,
    `result_metrics`, `sample_results`, `sample_group_conclusions`,
    `audit_events`.
- Supabase apply:
  `mcp__supabase_lab_management.apply_migration` with name
  `set_based_sample_results_rpc` returned `success: true`.
- Live migration history after apply includes
  `20260612155744 set_based_sample_results_rpc`.
- Live function verification:
  `uses_jsonb_to_recordset=true`, `no_result_loop=true`,
  `no_conclusion_loop=true`, `security_definer=true`, `config=[search_path=public]`.
- Live privileges after apply: `EXECUTE` for `postgres` owner and
  `service_role`.
- Live rollback integration verification passed:
  - created temporary org/sample/template/2 metrics/2 groups in a transaction;
  - RPC upserted 2 `sample_results` rows;
  - RPC upserted 2 `sample_group_conclusions` rows;
  - RPC inserted 1 `audit_events` row;
  - invalid metric raised
    `result metric does not belong to active sample template`;
  - invalid group raised
    `result group does not belong to active sample template`;
  - transaction rolled back.
- Fixture cleanup proof: `leftover_organizations=0` for slug
  `issue-31-rpc-%`.
- Supabase advisors after apply:
  - security advisor still reports pre-existing Auth leaked-password warning;
  - performance advisor reports unused-index INFO findings, no new blocking
    migration regression.
- Full tests:
  `cd lab-kit-app && bun run test` passed 89 files / 329 tests.
- React Doctor:
  `cd lab-kit-app && bun run react-doctor` exited 0. Verbose output shows one
  warning at `lib/sample-grid/operations.ts:120`, outside Issue #31 blast
  radius.
- Quality:
  `cd lab-kit-app && bun run quality` passed typecheck, ESLint strict,
  Prettier check, React Doctor, and Next build.
