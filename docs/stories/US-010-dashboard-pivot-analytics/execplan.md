# Exec Plan

## Goal

Giữ US-010 làm parent tracker cho Phase 9 và triển khai qua các slice nhỏ, đủ
nhỏ để review, test, verify và merge độc lập.

## Scope

Trong scope:

- điều phối thứ tự US-010A đến US-010E;
- giữ boundaries để mỗi PR không gom toàn bộ Phase 9;
- yêu cầu mỗi slice có proof riêng;
- cập nhật durable Harness records cho từng slice.

Ngoài scope:

- implement runtime code trong parent US-010;
- export Excel/CSV hoặc export pivot file;
- report view cho mẫu đã duyệt;
- permission mới cho Viewer export;
- audit log cho read-only dashboard view;
- thay đổi result-engine semantics;
- offline cache/PWA;
- full BI/report builder.

## Risk Classification

High-risk vì Phase 9 chạm các flags:

- Public contracts: `POST /api/analytics/pivot` và route báo cáo.
- Frontend/UI: dashboard, chart, responsive state, empty/error/loading states.
- Server state: aggregate reads, filter state, revalidation/caching strategy.
- Weak proof: analytics chưa có tests/runtime proof hiện tại.
- Multi-domain: samples, customers/companies, KIT metadata, result groups,
  result metrics và group conclusions.

## Work Phases

1. US-010A: analytics query contract và read port.
2. US-010B: dashboard overview data MVP.
3. US-010C: pivot API MVP.
4. US-010D: analytics page và pivot UI MVP.
5. US-010E: DB/RPC/index hardening survey hoặc conditional no-op.
6. Parent closeout sau khi US-010A đến US-010D verify và US-010E có kết luận.

## Stop Conditions

- Một slice kéo scope của slice sau vào cùng PR.
- US-010E cần Supabase write nhưng chưa chứng minh target project.
- Query contract cần quyền mới ngoài role matrix.
- Dashboard scope kéo export Phase 10 vào cùng diff.
- Chart package mới làm đổi product tech-stack hoặc bundle đáng kể mà chưa ghi
  trade-off.
- UI implementation bắt đầu mà chưa invoke Build Web Apps plugin capability.
- Reusable helper/component mới chưa qua `code-deduplication`.
- Cần TanStack Query nhưng chưa có client-cache requirement.
- Validation requirements cần bị giảm.
