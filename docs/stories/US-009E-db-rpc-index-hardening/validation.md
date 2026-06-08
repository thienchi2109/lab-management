# Validation

## Proof Strategy

US-009E chỉ hoàn tất khi DB/RPC/index change có target proof rõ ràng và không
làm yếu tenant/role boundaries.

Proof bắt buộc:

- namespace đúng `mcp__supabase_lab_management`;
- project-ref đúng `tuuqgpzgollcerqqszjr`;
- migration history được đọc trước write;
- target tables/functions/indexes được nêu rõ;
- migration forward-only;
- tenant isolation và role read behavior pass;
- performance path cho data grid pass;
- không sửa migration đã apply.

## Test Plan

- SQL/app integration: tenant scope, grants/RLS, role read behavior.
- Performance/smoke: query grid không scan ngoài phạm vi cần thiết.
- Platform: app tests phụ thuộc, typecheck/build nếu generated types hoặc app
  contract thay đổi.

## Fixtures

- Hai tenant/organization.
- Dữ liệu mẫu đủ lớn để thấy pagination/filter/sort path.
- User Admin, Editor, Viewer.

## Commands

Trước mọi Supabase write, ghi proof target trong trace. Sau khi có proof và apply:

```bash
scripts/bin/harness-cli story update --id US-009E --integration 1 --platform 1
scripts/bin/harness-cli story verify US-009E
```

## Acceptance Evidence

- Story split from US-009 before runtime implementation.
- Conditional implementation proof pending.
