# Exec Plan

## Goal

Giữ US-009 làm parent tracker cho Phase 8 và triển khai qua các slice nhỏ, đủ
nhỏ để review, test, verify và merge độc lập.

## Scope

Trong scope:

- điều phối thứ tự US-009A đến US-009E;
- giữ boundaries để mỗi PR không gom toàn bộ Phase 8;
- yêu cầu mỗi slice có proof riêng;
- cập nhật backlog và durable Harness records cho từng slice.

Ngoài scope:

- implement runtime code trong parent US-009;
- dashboard/pivot/analytics;
- export Excel/CSV;
- report view;
- sửa thuật toán result engine;
- sửa provider upload ảnh;
- offline cache/PWA.

## Risk Classification

High-risk vì story chạm:

- decomposition của một Phase high-risk;
- read contract của nhiều domain nếu triển khai nguyên khối;
- table/list surface dùng hằng ngày;
- responsive UI trên mobile và desktop;
- khả năng phát sinh RPC/index/migration;
- authorization và tenant isolation cho cả Admin, Editor, Viewer.

## Work Phases

1. Discovery.
   - Dùng context-mode trước, `rtk` cho shell ngắn.
   - Đọc `docs/product/*`, `docs/TEST_MATRIX.md`, US-006, US-007, US-008, và
     `original_specs/SPEC-001.md` Phase 8.

2. Slice creation.
   - Tạo packet US-009A đến US-009E.
   - Cập nhật backlog Phase 8 để reviewer thấy thứ tự PR.
   - Thêm durable story/intake records cho từng slice.

3. Execution order.
   - US-009A: data grid query contract.
   - US-009B: sample grid MVP.
   - US-009C: responsive và column visibility.
   - US-009D: result group detail và desktop column mode.
   - US-009E: DB/RPC/index hardening nếu có bằng chứng cần thiết.

4. Per-slice implementation.
   - Mỗi slice tự chạy discovery, Code Review Graph nếu sửa code,
     code-deduplication nếu thêm shared code, Build Web Apps nếu sửa UI, TDD,
     quality gates, và Harness closeout.

5. Parent closeout.
   - Chỉ verify US-009 parent sau khi US-009A đến US-009D đã verify hoặc có
     quyết định durable loại bỏ slice.

## Stop Conditions

- Một slice bắt đầu kéo scope của slice sau vào cùng PR.
- US-009E cần Supabase write nhưng namespace/project-ref không đúng hoặc không
  chứng minh được target.
- Implementation cần quyền mới ngoài role matrix hiện có.
- Có thay đổi result-engine semantics hoặc upload semantics ngoài scope.
