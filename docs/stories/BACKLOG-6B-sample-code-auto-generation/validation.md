# Validation

## Proof Strategy

Story này phải có proof theo TDD và live DB verification vì đổi mã định danh
nghiệp vụ.

Không được claim hoàn tất nếu chỉ kiểm thử UI. Phải chứng minh generator atomic
ở database/server và migration đúng project Supabase.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | `parseCreateSampleInput` không yêu cầu `sampleCode`; reject/ignore an toàn nếu client cố gửi mã khi create; helper format date segment tạo `YYMMDD` theo UTC+7; helper format mã tạo `HP-YYMMDD-RRRRRRRC`; check character deterministic bằng hash/mod32 trên phần thân mã. |
| Component | `CreateSampleDialog` không render input `Mã mẫu`; create modal hiển thị placeholder read-only `HP-YYMMDD-••••••••`; edit/view vẫn hiển thị mã mẫu như read-only metadata nếu cần. |
| Application | `createSampleMetadataAction` không đọc `sampleCode` từ `FormData`; `createSampleMetadata` nhận mã từ port/RPC result; duplicate-code check cũ không còn là source sinh mã. |
| SQL Contract | Migration forward-only định nghĩa generator/RPC dùng timezone Việt Nam, crypto random/retry tối đa 5 lần, check character hash/mod32, không scan max suffix, không counter table, `SECURITY DEFINER`, `search_path=public`, revoke/grant đúng. |
| Database Integration | Live rollback test tạo nhiều mẫu cùng ngày và nhận mã đúng format, không trùng; transaction rollback không để lại fixture; duplicate collision được mô phỏng hoặc chứng minh bằng retry path 5 lần rồi lỗi an toàn. |
| E2E | Không bắt buộc cho lượt này theo yêu cầu reviewer; dev server mở để reviewer tự kiểm tra modal placeholder và toast sau submit. |
| Platform | Supabase apply chỉ qua `mcp__supabase_lab_management` project-ref `tuuqgpzgollcerqqszjr`; advisors không có regression nghiêm trọng mới. |
| Logs/Audit | Tạo mẫu vẫn ghi audit `sample.created`; audit payload không lộ dữ liệu nhạy cảm ngoài mã mẫu và field names. |

## Fixtures

Fixtures cần xác định trước implementation:

- Admin user `admin / 123456@` cho E2E.
- Một organization hiện có của admin.
- Một `sample_type` active trong organization.
- Optional: company/customer/kit batch nếu form cần chọn.
- Transaction-only test organization/sample type nếu kiểm chứng live generator
  không thể dùng fixture hiện có an toàn.
- Collision-path fixture hoặc helper test-only trong rollback transaction nếu cần
  ép random trùng để kiểm chứng retry/error path.

## Commands

RED/GREEN focused:

```text
cd lab-kit-app && ./node_modules/.bin/vitest run lib/sample-metadata/schemas.test.ts lib/sample-metadata/operations.test.ts app/dashboard/samples/actions.test.ts app/dashboard/samples/_components/sample-metadata-dialogs.test.tsx
```

SQL contract:

```text
cd lab-kit-app && ./node_modules/.bin/vitest run lib/sample-metadata/schema-contract.test.ts
```

Quality gates:

```text
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
cd lab-kit-app && bun run docstring:check
```

Browser proof:

```text
Không chạy E2E tự động cho lượt này; reviewer tự kiểm tra qua dev server.
```

Harness:

```text
scripts/bin/harness-cli story verify BACKLOG-6B
```

## Acceptance Evidence

Implemented on 2026-06-15.

Durable evidence:

- RED/GREEN TDD covered schema/action/dialog/SQL contract.
- Focused sample metadata suite passed: 13 files / 57 tests.
- Additional dialog/action tests for placeholder and generated-code success
  toast passed: dialog 3 tests, actions 6 tests.
- Supabase live project proof used namespace `mcp__supabase_lab_management`,
  project-ref `tuuqgpzgollcerqqszjr`, latest migration history before apply
  `20260613032412 lock_sample_results_rpc_selected_template_id`.
- Forward-only migrations applied live:
  `20260615015633 sample_metadata_generated_code_rpc` and
  `20260615020016 sample_metadata_generated_code_rpc_rng_schema`.
- Live smoke generated `HP-260615-*`, verified format, uniqueness, audit
  payload `sampleCode`, service-role-only execute, and cleanup returned
  `remaining_smoke_samples=0`.
- Quality gates passed: typecheck, React Doctor diff, docstring check.
- E2E automation intentionally skipped for this final UI tweak per reviewer;
  dev server was opened for manual reviewer validation.
