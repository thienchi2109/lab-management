# Exec Plan

## Goal

Khóa và test hợp đồng dữ liệu cho 4 biểu đồ báo cáo kit/mẫu theo phản hồi khách
hàng, không dựng UI chart trong cùng story.

## Scope

In scope:

- Mapping nguồn dữ liệu cho `Loại mẫu`, `Loại kit`, `Phân loại`, `Kết quả
  chung_PCR`.
- Parser/request contract cho chart dataset.
- Read adapter hoặc use case trả segment data cho 4 biểu đồ.
- Unit/integration tests với fixture đủ `tôm PL`, `SẠCH`, `NHIỄM`, kit type và
  sample classification.

Out of scope:

- Biểu đồ tròn UI.
- Filter riêng từng biểu đồ.
- Lưu cấu hình filter Admin/Viewer.
- Upload ảnh báo cáo.

## Risk Classification

Risk flags:

- Data model.
- Public contracts.
- Authorization.
- Server state.
- Existing behavior.
- Weak proof.
- Multi-domain.

Hard gates:

- Nếu cần Supabase write, phải chứng minh đúng namespace/project-ref/migration
  history/target trước khi apply.
- Nếu nghĩa `totalKitQuantity` hoặc `sampleClassification` chưa chốt được, dừng
  và hỏi người dùng.

## Work Phases

1. Discovery.
   - Code Review Graph cho analytics/report path.
   - GitNexus sau khi graph đã khoanh target.
   - Supabase live read qua `mcp__supabase_lab_management`.
2. RED contract tests.
   - Parser rejects unknown chart/filter fields.
   - Domain mapper handles empty, unknown and normalized conclusions.
3. Implement read contract.
   - Keep API response stable and safe.
   - Avoid raw unbounded reads.
4. Supabase checkpoint.
   - If schema is sufficient, no migration.
   - If schema is insufficient, stop before DB write and present migration
     need.
5. Verification.
   - Focused analytics tests.
   - Typecheck.
   - React Doctor diff if any TSX is touched.
6. Harness update.

## Stop Conditions

Pause for human confirmation if:

- `tổng số lượng kit` cannot be proven from current tables.
- `Phân loại` requires a new persisted field or migration.
- The `tôm PL` sample type does not exist and product wants live seed data
  rather than test fixture only.
- Implementation would weaken bounded analytics query requirements.
- Namespace/project-ref differs from `mcp__supabase_lab_management` /
  `tuuqgpzgollcerqqszjr`.
