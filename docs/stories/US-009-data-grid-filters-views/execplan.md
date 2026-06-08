# Exec Plan

## Goal

Triển khai bảng dữ liệu chính cho mẫu, có phân trang phía server,
search/filter/sort, chế độ compact, group detail, và column visibility đúng
Phase 8.

## Scope

Trong scope:

- data grid cho sample dataset hiện có;
- server-side pagination với page size bị giới hạn;
- search/filter/sort có whitelist;
- desktop column mode cho nhóm/chỉ tiêu kết quả;
- mobile compact mode và group detail mode;
- local/session column visibility;
- role-aware row actions dùng quyền hiện có;
- focused tests, browser verification, React Doctor, và Harness proof.

Ngoài scope:

- dashboard/pivot/analytics;
- export Excel/CSV;
- report view;
- sửa thuật toán result engine;
- sửa provider upload ảnh;
- offline cache/PWA.

## Risk Classification

High-risk vì story chạm:

- read contract của nhiều domain: samples, kits, results, images, users/roles;
- table/list surface dùng hằng ngày;
- responsive UI trên mobile và desktop;
- server-side query, phân trang, filter/sort whitelist;
- khả năng phát sinh RPC/index/migration nếu query hiện tại không đủ;
- authorization và tenant isolation cho cả Admin, Editor, Viewer.

## Work Phases

1. Discovery.
   - Dùng context-mode trước, `rtk` cho shell ngắn.
   - Đọc Code Review Graph trước code edits.
   - Đọc `docs/product/*`, `docs/TEST_MATRIX.md`, US-006, US-007, US-008, và
     `original_specs/SPEC-001.md` Phase 8.
   - Dùng GitNexus sau khi graph đã thu hẹp symbol hoặc flow cần sửa.

2. Data contract proof.
   - Map dữ liệu cần hiển thị từ samples, reference tables, results, và images.
   - Chứng minh query hiện tại có thể phân trang/filter/sort mà không tải toàn
     bộ dataset.
   - Nếu cần Supabase write, chứng minh namespace `mcp__supabase_lab_management`,
     project-ref `tuuqgpzgollcerqqszjr`, migration history, target
     tables/functions, rồi mới apply forward-only migration.

3. TDD.
   - Viết failing tests cho query normalization, page/page size giới hạn,
     whitelist sort/filter, tenant scope, role read behavior, và empty/error
     states.
   - Viết UI tests cho filter reset, URL state, mobile compact mode, desktop
     column mode, group detail, và Viewer read-only row actions.

4. Frontend, reuse, và caching checkpoint.
   - Invoke Build Web Apps plugin capability trước UI work.
   - Invoke `code-deduplication` trước reusable helpers/components.
   - Reuse `DashboardDataTable` và dashboard primitives.
   - Giữ Server Components/server actions/`useActionState`/`revalidatePath`.
   - Không thêm TanStack Query nếu không có client-cache requirement cụ thể.

5. Implementation.
   - Thêm parser/normalizer cho search params.
   - Thêm query/read-model có pagination/filter/sort whitelist.
   - Cập nhật data grid UI cho desktop/mobile.
   - Thêm group detail mode và column visibility local/session.
   - Kết nối row actions vào các flow hiện có của metadata/results/images.

6. Verification.
   - Chạy focused tests trước.
   - Chạy typecheck, lint strict, build, React Doctor, docstring gate nếu có
     changed TS/TSX exports.
   - Chạy browser verification cho desktop và mobile.
   - Nếu có migration/RPC, chạy Supabase schema/security/performance checks phù
     hợp.

7. Harness closeout.
   - Cập nhật `validation.md` bằng chứng thực tế.
   - Cập nhật durable story flags bằng `scripts/bin/harness-cli story update`.
   - Chạy `scripts/bin/harness-cli story verify US-009`.
   - Ghi trace outcome, proof, và friction nếu có.

## Stop Conditions

- Không xác định được source of truth cho filter/sort/column contract.
- Query yêu cầu đọc toàn bộ dataset để lọc/sort.
- Cần Supabase write nhưng namespace/project-ref không đúng hoặc không chứng
  minh được target.
- Mobile layout buộc render toàn bộ cột kết quả.
- Implementation cần quyền mới ngoài role matrix hiện có.
- Có thay đổi result-engine semantics hoặc upload semantics ngoài scope.
