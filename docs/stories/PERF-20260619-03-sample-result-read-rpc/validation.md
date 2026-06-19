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

Chưa có. Story đang ở trạng thái planned.
