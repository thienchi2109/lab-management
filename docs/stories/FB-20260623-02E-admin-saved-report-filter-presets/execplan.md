# Exec Plan

## Goal

Cho phép Admin lưu cấu hình bộ lọc mặc định cho từng biểu đồ Báo cáo và đảm bảo
Viewer chỉ được đọc/override tạm thời, không ghi đè preset.

## Scope

In scope:

- Organization-scoped report preset data model.
- Read preset for initial `/dashboard/analytics`.
- Admin-only save flow.
- Viewer denied save flow.
- UI affordance rõ cho Admin vs Viewer.

Out of scope:

- Thêm biểu đồ mới.
- Export báo cáo.
- Upload ảnh báo cáo.
- Pivot table đầy đủ như Excel.

## Risk Classification

Risk flags:

- Authorization.
- Data model.
- Audit/security.
- Public contracts.
- Frontend/UI.
- Server state.
- Existing behavior.
- Weak proof.

Hard gates:

- Supabase write requires namespace/project-ref/migration proof first.
- Product must confirm Editor can or cannot save presets if implementation needs
  to expose Editor behavior.

## Work Phases

1. Discovery.
   - Code Review Graph for auth, analytics and audit seams.
   - GitNexus for selected symbols after graph narrows scope.
   - Live Supabase read proof for tables/policies.
2. Design checkpoint.
   - Confirm preset schema and Editor behavior if ambiguous.
3. RED tests.
   - Viewer cannot save.
   - Admin can save valid preset.
   - Invalid chart/filter payload rejected.
4. DB migration if needed.
   - Forward-only migration.
   - RLS/policy/grant/audit proof.
5. UI implementation.
   - Build Web Apps capability before UI work.
   - Code-deduplication before reusable filter/preset helper.
6. Verification.
   - Focused tests, typecheck, docstring, React Doctor.
   - Browser admin save + viewer read/no-save proof.
7. Harness update.

## Stop Conditions

Pause for human confirmation if:

- Editor save permission is required but not specified.
- Preset payload starts including customer-sensitive free text beyond field IDs.
- Existing audit model cannot cover preset writes safely.
- Supabase namespace/project-ref is missing or different.
- Validation requirements need to be weakened.
