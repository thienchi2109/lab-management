# US-011E - Export Hardening, Audit & Limits

**Lane:** high-risk
**Phase:** 10
**Status:** planned conditional
**Affects:** audit export, rate/size guard, khảo sát live DB/RPC/index và các
hardening cần thiết sau khi US-011A-D chứng minh nhu cầu

## Current Behavior

Chưa có export runtime nên chưa có audit trail, rate guard, size guard thực tế
hoặc bằng chứng DB cần index/RPC mới cho dataset export. Mọi migration/RPC/index
phải đi qua proof Supabase namespace/project-ref trước khi write.

## Target Behavior

- Ghi audit event tối thiểu cho export thành công/thất bại: actor, tenant, loại
  export, format, filter summary an toàn, số dòng và kết quả.
- Có guard chống export quá lớn, retry dồn dập hoặc request bypass contract.
- Khảo sát live query plan sau US-011B/C; chỉ thêm migration/RPC/index nếu có
  bằng chứng rõ ràng.
- Nếu cần DB write, chứng minh namespace `mcp__supabase_lab_management`,
  project-ref `tuuqgpzgollcerqqszjr`, migration history và target object trước
  khi apply.
- Nếu không cần hardening DB, close slice bằng validation no-op có evidence.

## Affected Users

- Admin cần audit để truy vết dữ liệu đã xuất.
- Tất cả vai trò được bảo vệ khỏi export quá rộng hoặc sai phạm vi tenant.

## Affected Product Docs

- `docs/product/api-contract.md`
- `docs/product/roles-permissions.md`
- `docs/product/tech-stack.md`

## Non-Goals

- Lưu file export lâu dài.
- Thêm queue/background worker nếu dataset MVP vẫn bounded.
- Sửa dữ liệu nghiệp vụ hoặc result-engine.
- Mở rộng permission matrix ngoài `Export Excel/CSV`.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Audit payload sanitizer và limit/rate helpers nếu có. |
| Integration | Export ghi audit đúng actor/tenant và reject request vượt giới hạn. |
| E2E | Có thể gom với US-011D nếu flow UI bao phủ lỗi hard cap. |
| Platform | Supabase proof bắt buộc trước mọi DB write; React Doctor diff nếu chạm TS/TSX. |
| Release | Story record cập nhật proof hoặc no-op evidence sau khảo sát. |

