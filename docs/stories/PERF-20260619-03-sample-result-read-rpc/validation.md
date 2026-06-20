# Validation

## Proof Strategy

Proof phải chứng minh payload mới tương đương UI hiện tại, giảm query waterfall,
và giữ nguyên quyền theo role. Vì story đụng RPC/RLS, không được claim hoàn tất
nếu chưa có test quyền và kiểm tra live DB trước mọi write.

## Test Plan

| Layer       | Cases                                                                                   |
| ----------- | --------------------------------------------------------------------------------------- |
| Unit        | Parser payload RPC, mapping result groups/metrics/results/conclusions.                  |
| Integration | Server adapter gọi đúng RPC, xử lý lỗi 403/not found, sample ngoài tenant.              |
| E2E         | Admin/editor/viewer mở trang kết quả mẫu; viewer read-only, editor/admin giữ quyền ghi. |
| Platform    | `bun run typecheck`, `bun run react-doctor:diff`, schema validation nếu có.             |
| Performance | So sánh số request Supabase khi mở kết quả mẫu trước/sau.                               |
| Logs/Audit  | Không audit cho read query; không log PII/raw SQL error ra client.                      |

## Fixtures

- Một sample có nhiều result groups.
- Metrics đủ các input type chính.
- Kết quả đã lưu và `sample_group_conclusions`.
- User admin/editor/viewer trong tenant.
- User ngoài tenant hoặc sample ngoài tenant để khóa quyền.

## Commands

```text
cd lab-kit-app && bun run test --run lib/sample-results app/dashboard/samples/[sampleId]/results app/api/samples/[sampleId]/results/route.test.ts
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
```

## Acceptance Evidence

Implemented ngày 2026-06-20.

- RED proof: `read-rpc-port.test.ts` và `schema-contract.test.ts` fail đúng vì
  port còn gọi REST table queries, migration chưa có RPC đọc và malformed RPC
  payload chưa bị chặn ở boundary.
- Focused proof: `cd lab-kit-app && bun run test --run lib/sample-results app/api/samples/[sampleId]/results/route.test.ts app/dashboard/samples/[sampleId]/results/_components`
  pass 14 files / 60 tests.
- Platform proof: `bun run typecheck`, `bun run react-doctor:diff`,
  `bun run format:check`, `bun run docstring:check`, `bun run lint:strict` pass.
- Schema proof: `node scripts/validate-supabase-schema.mjs` pass.
- Live DB proof: migration `20260620032912 sample_result_entry_payload_rpc`
  applied qua `mcp__supabase_lab_management`, expected project-ref
  `tuuqgpzgollcerqqszjr`.
- Post-apply proof: function `get_sample_result_entry_payload` exists as
  `SECURITY DEFINER`, `search_path=public`, returns `jsonb`, grants only
  `postgres` and `service_role`; smoke sample returned payload with one group.
- Performance proof: port regression asserts one RPC call
  `get_sample_result_entry_payload` and no REST `from()` query for read payload.
- E2E/browser proof: agent-browser login admin / 123456@, mở
  `/dashboard/samples`, mở result page mẫu `T6_77881`, tab `Kết quả` render
  `PCR Realtime Ct` = `Dương tính`, CT `22`, `Kết Quả Chung: NHIỄM` và nút
  `Lưu kết quả`; screenshot:
  `/tmp/perf-20260619-03-admin-result-page.png`. Không bấm lưu để tránh ghi
  thêm audit/live data. Viewer/editor browser proof không chạy trong pass này;
  role behavior vẫn được API route tests cover.
