# **Lab Management**

Web app nội bộ quản lý mẫu phòng lab cho 5-7 user. Sản phẩm tập trung vào

quản lý KIT xét nghiệm, tiếp nhận mẫu, nhập kết quả theo nhóm chỉ tiêu động,

upload ảnh minh chứng, dashboard/pivot và xuất Excel/CSV.

Repo này đã được decomposed từ spec gốc thành product docs, story packets và

Harness workflow. Khi làm việc tiếp, dùng docs/product/\* làm product truth

hiện tại; original\_specs/SPEC-001\*.md chỉ là input lịch sử.

## **Nguồn Sự Thật**

original\_specs/SPEC-001\*.md   input spec gốc, giữ ổn định sau khi decomposed  
docs/product/\* product contract hiện tại  
docs/stories/\* story-sized work packets  
docs/decisions/\* quyết định kiến trúc và trade-off lâu dài  
docs/TEST\_MATRIX.md           behavior-to-proof validation matrix

Tài liệu chính:

* [docs/product/overview.md](http://docs.google.com/docs/product/overview.md) \- scope, user và MVP  
  boundaries.  
* [docs/product/tech-stack.md](http://docs.google.com/docs/product/tech-stack.md) \- stack và quality  
  gates.  
* [docs/product/data-model.md](http://docs.google.com/docs/product/data-model.md) \- entity,  
  relationship và constraint.  
* [docs/product/roles-permissions.md](http://docs.google.com/docs/product/roles-permissions.md) \-  
  Admin, Editor, Viewer và RLS expectation.  
* [docs/product/result-engine.md](http://docs.google.com/docs/product/result-engine.md) \- result  
  groups, metrics, input types và KQ\_CHUNG.  
* [docs/product/ui-contract.md](http://docs.google.com/docs/product/ui-contract.md) \- mobile-first UI,  
  form zones, grid modes và dashboard.  
* [docs/product/api-contract.md](http://docs.google.com/docs/product/api-contract.md) \- API surface,  
  upload, analytics và export.

## **MVP Scope**

MVP gồm:

* Quản lý danh mục khách hàng, công ty, loại mẫu, loại KIT và lô KIT.  
* Tạo và cập nhật mẫu xét nghiệm với mã mẫu sinh server-side.  
* Nhập kết quả theo 8 nhóm chỉ tiêu động.  
* Tính KQ\_CHUNG theo rule của từng nhóm kết quả.  
* Upload ảnh minh chứng qua Cloudinary signed upload.  
* Dashboard/pivot cho theo dõi mẫu, KIT và kết quả.  
* Xuất Excel/CSV cho mẫu và kết quả normalized.  
* Phân quyền Admin, Editor, Viewer.

Không nằm trong MVP: mobile app, desktop app, workflow ký số, multi-lab tenancy

và billing.

## **Stack**

| Layer | Technology |
| :---- | :---- |
| Runtime | Bun |
| Framework | Next.js App Router |
| Language | TypeScript strict |
| Database | Supabase Postgres with RLS |
| Auth | Auth.js / NextAuth |
| Storage | Cloudinary |
| UI | Tailwind CSS \+ shadcn/ui |
| Tables | TanStack Table v8 |
| Forms | React Hook Form \+ Zod |
| Charts | ECharts |
| Export | SheetJS |
| Deploy | Vercel |

App source nằm trong lab-kit-app/.

## **Repository Layout**

.  
├── AGENTS.md  
├── README.md  
├── original\_specs/  
│   ├── SPEC-001.md  
│   └── SPEC-001-NextJS-MVP-Phased-Roadmap.md  
├── docs/  
│   ├── product/  
│   ├── stories/  
│   ├── decisions/  
│   ├── FEATURE\_INTAKE.md  
│   ├── HARNESS.md  
│   ├── ARCHITECTURE.md  
│   ├── CONTEXT\_RULES.md  
│   └── TEST\_MATRIX.md  
├── scripts/  
│   ├── bin/harness-cli  
│   └── schema/  
└── lab-kit-app/  
    ├── app/  
    ├── components/  
    ├── hooks/  
    ├── lib/  
    └── package.json

## **Chạy Ứng Dụng**

cd lab-kit-app  
bun install  
bun run dev

Mở app tại:

http://localhost:3000

Health endpoint:

GET /api/health

## **Validation**

Chạy trong lab-kit-app/:

bun run typecheck  
bun run lint:strict  
bun run format:check  
bun run react-doctor  
bun run docstring:check  
bun run build

Hoặc chạy quality gate tổng hợp:

bun run quality

Enable tracked commit/push hooks once per clone:

scripts/setup-git-hooks.sh

Hooks chạy từ lab-kit-app/. pre-commit kiểm tra các file được stage bằng React

Doctor. pre-push kiểm tra React Doctor diff và chạy bun run docstring:check, yêu cầu các block JSDoc cho các export TS/TSX được đặt tên có thay đổi.

Khi có tests:

bun test

Với phase UI phức tạp, đọc docs/TEST\_MATRIX.md và chạy thêm command phù hợp

nếu story yêu cầu.

## **Harness Workflow**

Repo này dùng Harness để giữ agent work bám vào spec và validation. Trước khi

code:

1. Đọc AGENTS.md.  
2. Đọc docs/HARNESS.md, docs/FEATURE\_INTAKE.md, docs/ARCHITECTURE.md và  
   docs/CONTEXT\_RULES.md.  
3. Chạy matrix:

scripts/bin/harness-cli query matrix

4. Phân loại request thành tiny, normal hoặc high-risk.  
5. Với normal/high-risk, tạo hoặc cập nhật story packet trong  
   docs/stories/ trước khi implement.  
6. Sau khi làm xong, cập nhật validation proof và trace theo docs/TRACE\_SPEC.md.

Lệnh Harness hay dùng:

scripts/bin/harness-cli init  
scripts/bin/harness-cli query matrix  
scripts/bin/harness-cli query backlog  
scripts/bin/harness-cli query stats  
scripts/bin/harness-cli story verify \<story-id\>  
scripts/bin/harness-cli trace \--summary "\<what changed\>" \--outcome "\<result\>"

## **Development Rules**

* Product truth sống trong docs/product/\*, không tiếp tục mở rộng spec gốc.  
* Unknown input phải parse bằng Zod trước khi vào inner code.  
* Không dùng explicit any trong code mới.  
* Không đưa service role key vào client code.  
* Không raw SQL từ client.  
* Commands mutate state và own audit side effects; queries chỉ đọc và format.  
* Auth, authorization, data model, audit/security, external provider và public  
  contract changes đều cần story/proof tương ứng.

## **Current State**

Foundation app scaffold đã có trong lab-kit-app/ với Next.js, TypeScript,

Tailwind/shadcn UI surface, dashboard shell và health endpoint. Product docs đã

được tách từ SPEC-001; các phase tiếp theo nên đi qua Harness intake, story

packet và validation matrix thay vì sửa trực tiếp theo spec gốc.
