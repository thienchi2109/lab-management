# US-013 - MVP Release Checklist

**Lane:** high-risk
**Phase:** 12
**Status:** partial
**Affects:** điều phối checklist release MVP, cấu hình production, deploy Vercel,
smoke test luồng chính, backup/restore cơ bản và tài liệu vận hành

## Product Contract

US-013 đóng gói MVP để sẵn sàng triển khai Vercel bằng một checklist release có
bằng chứng. Story này không thêm nghiệp vụ mới; nó xác nhận các phần MVP đã có
thể chạy cùng nhau trong môi trường production-like và có tài liệu đủ để Admin,
Editor, Viewer vận hành.

Khi đến bước deploy thật, agent phải dừng và ping người dùng vì cần credentials
Vercel. Không ghi credentials vào repo, trace, issue, log hoặc tài liệu.

## Current Behavior

Backlog hiện chỉ đánh dấu US-013 là `planned` dưới Phase 12 Release. Roadmap gốc
đã mô tả checklist release, acceptance criteria và Definition of Done cho MVP,
nhưng chưa có story packet hoặc durable Harness story record để theo dõi proof.

Các story trước đã triển khai phần lớn mặt bằng MVP: auth/RBAC, cấu hình kết
quả, kit inventory, CRUD mẫu, nhập kết quả động, upload ảnh, data grid,
dashboard/analytics và export. US-013 phải kiểm chứng các mảnh đó như một luồng
release thay vì mở rộng scope tính năng.

## Target Behavior

Release operator có một checklist tuần tự để xác nhận:

- Env vars bắt buộc được cấu hình cho production.
- Supabase migrations đúng trạng thái trước khi release.
- Cloudinary env và signed upload configuration hoạt động.
- Seed production đủ dữ liệu nền tối thiểu.
- Role admin đầu tiên tồn tại và đăng nhập được.
- Backup/restore DB cơ bản đã được diễn tập hoặc ghi rõ bằng chứng.
- Deploy Vercel hoàn tất sau khi người dùng cung cấp credentials.
- Smoke test MVP đi qua login, tạo mẫu, nhập kết quả, upload ảnh, dashboard và
  export.
- Tài liệu vận hành cho Admin, Editor và Viewer đã được viết.
- Quality gates cuối xanh.

## Affected Users

- **Operator/maintainer:** chạy checklist release, quản lý env vars, deploy và
  ghi bằng chứng.
- **Admin:** cấu hình nhóm, chỉ tiêu, template và setting sau release.
- **Editor:** tạo mẫu, nhập kết quả và upload ảnh minh chứng.
- **Viewer:** xem dashboard/report và export dữ liệu mà không có quyền sửa.

## Affected Product Docs

- `original_specs/SPEC-001.md`
- `original_specs/SPEC-001-NextJS-MVP-Phased-Roadmap.md`
- `docs/TEST_MATRIX.md`
- README hoặc runbook vận hành được tạo trong story này
- Hướng dẫn vai trò Admin, Editor và Viewer được tạo trong story này

## Created Docs

- `docs/operations/release-runbook.md`
- `docs/operations/admin-guide.md`
- `docs/operations/editor-guide.md`
- `docs/operations/viewer-guide.md`
- `docs/stories/US-013-mvp-release-checklist/validation.md`

## Non-Goals

- Không thêm tính năng nghiệp vụ mới ngoài checklist release.
- Không tự động deploy khi chưa có credentials Vercel từ người dùng.
- Không commit credentials, token, secrets hoặc ảnh chụp chứa secrets.
- Không sửa migration đã áp dụng; mọi correction DB phải là migration mới.
- Không thay đổi permission model, RLS hoặc audit behavior ngoài lỗi blocking
  phát hiện trong release verification.

## Release Tasks

- Kiểm tra env vars.
- Kiểm tra Supabase migrations.
- Kiểm tra Cloudinary env và signed upload configuration.
- Kiểm tra seed production.
- Kiểm tra role admin đầu tiên.
- Kiểm tra backup/restore DB cơ bản.
- Viết README vận hành.
- Viết hướng dẫn Admin cấu hình nhóm/chỉ tiêu.
- Viết hướng dẫn Editor nhập mẫu.
- Viết hướng dẫn Viewer xem dashboard/export.
- Ping người dùng trước deploy thật để nhận hướng dẫn credentials Vercel.

## Acceptance Criteria

- Deploy Vercel thành công.
- Login được.
- Tạo mẫu được.
- Nhập kết quả PCR và chất lượng nước được.
- Upload ảnh được.
- Xem dashboard được.
- Export Excel/CSV được.
- Quality gates xanh.
- Release evidence được ghi trong Harness story record hoặc validation report.

## Validation

- `scripts/bin/harness-cli query matrix`
- `cd lab-kit-app && bun run quality`
- `cd lab-kit-app && bun run test`
- `cd lab-kit-app && bun run react-doctor`
- Supabase migration/status check trên đúng project trước mọi thao tác write.
- Cloudinary signed upload smoke test không ghi secrets vào output.
- Vercel deploy smoke test sau khi người dùng cung cấp credentials.
- Browser smoke test cho login, tạo mẫu, nhập kết quả, upload ảnh, dashboard và
  export.

## Evidence Plan

- Ghi intake và durable story record trước khi thực hiện release.
- Lưu kết quả quality gates và smoke tests vào story evidence.
- Ghi rõ môi trường deploy, commit SHA, migration state và hạn chế còn lại.
- Ghi validation report nếu release verification phát hiện gap hoặc cần bằng
  chứng chi tiết cho handoff.

## Current Release State

Production deploy đã sẵn sàng tại `https://aquatic-lab.vercel.app` với
deployment `dpl_A3P763tgSnTd9VNetZhwMmBJEua4`. US-013 vẫn là partial vì issue
#70 còn chặn tiêu chí nhập kết quả chất lượng nước.
