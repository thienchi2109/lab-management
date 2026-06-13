# Issue #31 - Set-Based Sample Results RPC

## Current Behavior

RPC `public.save_sample_results_with_audit` đã được apply live bởi migration
`20260607012745_sample_results_audit_transaction_rpc`. Function hiện lưu
`p_results` và `p_conclusions` bằng hai vòng `FOR LOOP`; mỗi phần tử chạy một
lệnh `INSERT ... ON CONFLICT DO UPDATE` riêng trong cùng transaction.

RPC vẫn đúng về correctness hiện tại, nhưng cách xử lý row-by-row làm tăng chi
phí khi một mẫu có nhiều chỉ tiêu hoặc nhiều kết luận nhóm.

## Target Behavior

RPC được thay thế bằng migration forward-only để xử lý validation và upsert theo
hướng set-based:

- parse `p_results` bằng `jsonb_to_recordset` hoặc CTE tương đương;
- reject mọi `metricId` không thuộc active template của mẫu;
- upsert nhiều dòng `sample_results` bằng một câu `INSERT ... SELECT ... ON
  CONFLICT DO UPDATE`;
- parse `p_conclusions` bằng `jsonb_to_recordset` hoặc CTE tương đương;
- reject mọi `groupId` không thuộc active template của mẫu;
- upsert nhiều dòng `sample_group_conclusions` bằng một câu `INSERT ... SELECT
  ... ON CONFLICT DO UPDATE`;
- vẫn ghi đúng một `audit_events` cho lần lưu;
- giữ nguyên `SECURITY DEFINER`, `set search_path = public`, revoke/grant chỉ
  cho `service_role`.

## Affected Users

- Editor/Admin lưu kết quả xét nghiệm động cho mẫu.
- Người vận hành phụ thuộc audit trail và dữ liệu kết quả mẫu.

## Affected Product Docs

- `docs/product/result-engine.md`
- `docs/product/data-model.md`
- `docs/product/api-contract.md`

## Non-Goals

- Không đổi UI nhập kết quả mẫu.
- Không đổi API route `PUT /api/samples/:id/results`.
- Không đổi shape payload TypeScript nếu RPC signature giữ nguyên.
- Không sửa migration đã apply live.
- Không tối ưu các RPC khác ngoài `public.save_sample_results_with_audit`.
