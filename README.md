# Lab Management

Web app noi bo quan ly mau phong lab cho 5-7 user. San pham tap trung vao
quan ly KIT xet nghiem, tiep nhan mau, nhap ket qua theo nhom chi tieu dong,
upload anh minh chung, dashboard/pivot va xuat Excel/CSV.

Repo nay da duoc decomposed tu spec goc thanh product docs, story packets va
Harness workflow. Khi lam viec tiep, dung `docs/product/*` lam product truth
hien tai; `original_specs/SPEC-001*.md` chi la input lich su.

## Nguon Su That

```text
original_specs/SPEC-001*.md   input spec goc, giu on dinh sau khi decomposed
docs/product/*                product contract hien tai
docs/stories/*                story-sized work packets
docs/decisions/*              quyet dinh kien truc va trade-off lau dai
docs/TEST_MATRIX.md           behavior-to-proof validation matrix
```

Tai lieu chinh:

- [docs/product/overview.md](docs/product/overview.md) - scope, user va MVP
  boundaries.
- [docs/product/tech-stack.md](docs/product/tech-stack.md) - stack va quality
  gates.
- [docs/product/data-model.md](docs/product/data-model.md) - entity,
  relationship va constraint.
- [docs/product/roles-permissions.md](docs/product/roles-permissions.md) -
  Admin, Editor, Viewer va RLS expectation.
- [docs/product/result-engine.md](docs/product/result-engine.md) - result
  groups, metrics, input types va KQ_CHUNG.
- [docs/product/ui-contract.md](docs/product/ui-contract.md) - mobile-first UI,
  form zones, grid modes va dashboard.
- [docs/product/api-contract.md](docs/product/api-contract.md) - API surface,
  upload, analytics va export.

## MVP Scope

MVP gom:

- Quan ly danh muc khach hang, cong ty, loai mau, loai KIT va lo KIT.
- Tao va cap nhat mau xet nghiem voi ma mau sinh server-side.
- Nhap ket qua theo 8 nhom chi tieu dong.
- Tinh `KQ_CHUNG` theo rule cua tung nhom ket qua.
- Upload anh minh chung qua Cloudflare R2 bang presigned URL.
- Dashboard/pivot cho theo doi mau, KIT va ket qua.
- Xuat Excel/CSV cho mau va ket qua normalized.
- Phan quyen Admin, Editor, Viewer.

Khong nam trong MVP: mobile app, desktop app, workflow ky so, multi-lab tenancy
va billing.

## Stack

| Layer | Technology |
| --- | --- |
| Runtime | Bun |
| Framework | Next.js App Router |
| Language | TypeScript strict |
| Database | Supabase Postgres with RLS |
| Auth | Auth.js / NextAuth |
| Storage | Cloudflare R2 |
| UI | Tailwind CSS + shadcn/ui |
| Tables | TanStack Table v8 |
| Forms | React Hook Form + Zod |
| Charts | ECharts |
| Export | SheetJS |
| Deploy | Vercel |

App source nam trong `lab-kit-app/`.

## Repository Layout

```text
.
├── AGENTS.md
├── README.md
├── original_specs/
│   ├── SPEC-001.md
│   └── SPEC-001-NextJS-MVP-Phased-Roadmap.md
├── docs/
│   ├── product/
│   ├── stories/
│   ├── decisions/
│   ├── FEATURE_INTAKE.md
│   ├── HARNESS.md
│   ├── ARCHITECTURE.md
│   ├── CONTEXT_RULES.md
│   └── TEST_MATRIX.md
├── scripts/
│   ├── bin/harness-cli
│   └── schema/
└── lab-kit-app/
    ├── app/
    ├── components/
    ├── hooks/
    ├── lib/
    └── package.json
```

## Chay Ung Dung

```bash
cd lab-kit-app
bun install
bun run dev
```

Mo app tai:

```text
http://localhost:3000
```

Health endpoint:

```text
GET /api/health
```

## Validation

Chay trong `lab-kit-app/`:

```bash
bun run typecheck
bun run lint:strict
bun run format:check
bun run react-doctor
bun run docstring:check
bun run build
```

Hoac chay quality gate tong hop:

```bash
bun run quality
```

Enable tracked commit/push hooks once per clone:

```bash
scripts/setup-git-hooks.sh
```

Hooks run from `lab-kit-app/`. `pre-commit` checks staged files with React
Doctor. `pre-push` checks the React Doctor diff and runs `bun run
docstring:check`, which requires JSDoc blocks for changed named TS/TSX exports.

Khi co tests:

```bash
bun test
```

Voi phase UI phuc tap, doc `docs/TEST_MATRIX.md` va chay them command phu hop
neu story yeu cau.

## Harness Workflow

Repo nay dung Harness de giu agent work bam vao spec va validation. Truoc khi
code:

1. Doc `AGENTS.md`.
2. Doc `docs/HARNESS.md`, `docs/FEATURE_INTAKE.md`, `docs/ARCHITECTURE.md` va
   `docs/CONTEXT_RULES.md`.
3. Chay matrix:

```bash
scripts/bin/harness-cli query matrix
```

4. Phan loai request thanh `tiny`, `normal` hoac `high-risk`.
5. Voi `normal`/`high-risk`, tao hoac cap nhat story packet trong
   `docs/stories/` truoc khi implement.
6. Sau khi lam xong, cap nhat validation proof va trace theo `docs/TRACE_SPEC.md`.

Lenh Harness hay dung:

```bash
scripts/bin/harness-cli init
scripts/bin/harness-cli query matrix
scripts/bin/harness-cli query backlog
scripts/bin/harness-cli query stats
scripts/bin/harness-cli story verify <story-id>
scripts/bin/harness-cli trace --summary "<what changed>" --outcome "<result>"
```

## Development Rules

- Product truth song trong `docs/product/*`, khong tiep tuc mo rong spec goc.
- Unknown input phai parse bang Zod truoc khi vao inner code.
- Khong dung explicit `any` trong code moi.
- Khong dua service role key vao client code.
- Khong raw SQL tu client.
- Commands mutate state va own audit side effects; queries chi doc va format.
- Auth, authorization, data model, audit/security, external provider va public
  contract changes deu can story/proof tuong ung.

## Current State

Foundation app scaffold da co trong `lab-kit-app/` voi Next.js, TypeScript,
Tailwind/shadcn UI surface, dashboard shell va health endpoint. Product docs da
duoc tach tu SPEC-001; cac phase tiep theo nen di qua Harness intake, story
packet va validation matrix thay vi sua truc tiep theo spec goc.
