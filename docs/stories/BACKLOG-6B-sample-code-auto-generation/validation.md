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
| Component | `CreateSampleDialog` không render field `Mã mẫu`; edit/view vẫn hiển thị mã mẫu như read-only metadata nếu cần. |
| Application | `createSampleMetadataAction` không đọc `sampleCode` từ `FormData`; `createSampleMetadata` nhận mã từ port/RPC result; duplicate-code check cũ không còn là source sinh mã. |
| SQL Contract | Migration forward-only định nghĩa generator/RPC dùng timezone Việt Nam, crypto random/retry tối đa 5 lần, check character hash/mod32, không scan max suffix, không counter table, `SECURITY DEFINER`, `search_path=public`, revoke/grant đúng. |
| Database Integration | Live rollback test tạo nhiều mẫu cùng ngày và nhận mã đúng format, không trùng; transaction rollback không để lại fixture; duplicate collision được mô phỏng hoặc chứng minh bằng retry path 5 lần rồi lỗi an toàn. |
| E2E | agent-browser admin tạo mẫu từ `/dashboard/samples`; modal không có `Mã mẫu`; bảng hiển thị mã dạng `HP-YYMMDD-RRRRRRRC`; không có error overlay/console app error. |
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
agent-browser open http://localhost:3000/dashboard/samples
```

Harness:

```text
scripts/bin/harness-cli story verify BACKLOG-6B
```

## Acceptance Evidence

Pending implementation.

Planned durable evidence:

- RED failure output for schema/dialog/action/SQL contract.
- GREEN focused test output.
- Supabase project proof before apply.
- Live rollback verification output.
- agent-browser desktop/mobile proof.
- React Doctor diff and docstring gate output.
