# Exec Plan

## Goal

Tự sinh mã mẫu dạng `yyyymmdd-xxx` theo ngày Việt Nam khi tạo mẫu, ẩn trường
`Mã mẫu` khỏi modal Thêm mẫu và đảm bảo không trùng mã khi nhiều thao tác tạo
mẫu chạy đồng thời.

## Scope

In scope:

- Cập nhật product docs về sample code format mới.
- Tách create schema khỏi yêu cầu nhập `sampleCode`.
- Ẩn field `Mã mẫu` trong create dialog.
- Giữ hoặc làm read-only mã mẫu ở edit side sheet theo phạm vi an toàn nhất.
- Thêm migration forward-only cho generator atomic ở database/RPC.
- Cập nhật server action/port tạo mẫu dùng mã tự sinh.
- Cập nhật tests cho schema, operations, server port/action, dialog và E2E.
- Apply migration live chỉ sau khi chứng minh đúng Supabase project.

Out of scope:

- Không đổi mã mẫu lịch sử.
- Không backfill export/report cũ.
- Không đổi result-entry, image upload hoặc dashboard ngoài việc đọc mã mới.
- Không sửa migration đã apply live.

## Risk Classification

Lane: `high-risk`.

Risk flags:

- Data model.
- Public contract.
- Existing behavior.
- Frontend/UI.
- Weak proof quanh concurrency nếu không kiểm chứng live/transaction.

Hard gates:

- Database write/migration.
- Public contract đổi format `sample_code`.
- Trước mọi Supabase write phải chứng minh:
  - MCP namespace: `mcp__supabase_lab_management`;
  - project-ref: `tuuqgpzgollcerqqszjr`;
  - repo mapping;
  - current migration history;
  - target tables/functions.

## Work Phases

1. Discovery.
   - Đọc product docs hiện có về `sample_code`.
   - Dùng Code Review Graph để khoanh `createSampleMetadataAction`,
     `createSampleMetadata`, `createSupabaseSampleMetadataPort`,
     `CreateSampleDialog`, sample export/grid callers.
   - Dùng GitNexus sau khi graph đã khoanh symbol chính.
   - Query live DB read-only để xác nhận unique constraint/index hiện có trên
     `samples.sample_code`, function/RLS/grants liên quan.
2. TDD RED.
   - Schema test: create input không yêu cầu `sampleCode`.
   - Dialog test: create modal không render field `Mã mẫu`.
   - Action/operations test: create path không lấy `sampleCode` từ form.
   - SQL contract test: migration có function generator dùng timezone Việt Nam
     và cơ chế lock/counter atomic.
3. Design checkpoint.
   - Chọn giữa bảng counter riêng và advisory transaction lock dựa trên live DB
     shape.
   - Nếu cần bảng mới, ghi rõ RLS/grant/fail-closed pattern theo nearby
     migrations.
4. Implementation.
   - Cập nhật docs/product.
   - Cập nhật schema/action/operation/port.
   - Thêm migration forward-only.
   - Cập nhật dialog.
5. Supabase apply checkpoint.
   - State lại namespace/project-ref/migration history/target tables/functions.
   - Chỉ apply qua `mcp__supabase_lab_management.apply_migration`.
6. Post-apply verification.
   - Verify function definition, grants, RLS/counter table nếu có.
   - Rollback transaction test:
     - tạo nhiều mẫu trong cùng ngày nhận mã tăng tuần tự;
     - mô phỏng hoặc kiểm chứng duplicate/concurrency;
     - vượt ngưỡng 999 trả lỗi đúng;
     - audit event ghi đúng.
7. UI/E2E verification.
   - agent-browser login admin.
   - Mở `/dashboard/samples`.
   - Mở modal Thêm mẫu, xác nhận không có field `Mã mẫu`.
   - Submit mẫu, xác nhận bảng hiển thị mã `yyyymmdd-xxx`.
   - Kiểm tra mobile không tràn ngang.
8. Final gates.
   - Focused Vitest suites.
   - `bun run typecheck`.
   - `bun run react-doctor:diff`.
   - `bun run docstring:check`.
   - `rtk code-review-graph update --repo /root/lab-management`.
   - `mcp__gitnexus.detect_changes` before commit.
   - Harness story verify and trace.

## Stop Conditions

Pause for human confirmation if:

- Live namespace/project-ref khác expected.
- Mã sample hiện tại cần backfill hoặc đổi lịch sử.
- Thiết kế cần bỏ giới hạn `000..999`.
- Cần đổi unique constraint toàn bảng theo hướng có rủi ro dữ liệu.
- RPC/generator không thể bảo đảm atomic trong một transaction.
- Validation concurrency phải bị yếu đi.
