# Tech Stack

## MVP Stack

| Layer | Technology | Rationale |
| --- | --- | --- |
| Runtime | Bun | Fast package manager, TypeScript-native |
| Frontend + Backend | Next.js App Router | Unified codebase, shared TS types |
| API | Route Handlers + Server Actions | No separate backend needed for MVP |
| Database | Supabase Postgres | Managed, RLS built-in |
| Auth | Auth.js / NextAuth | Session + role management |
| File Storage | Cloudinary | Signed direct image upload, CDN delivery, thumbnail support |
| UI Framework | Tailwind CSS + shadcn/ui | Consistent design system |
| Data Grid | TanStack Table v8 | Server-side pagination, column control |
| Forms | React Hook Form + Zod | Validation, dynamic forms |
| Charts | ECharts | Dashboard/pivot visualization |
| Export | SheetJS | Excel/CSV generation |
| Deploy | Vercel | Zero-config Next.js hosting |

## Quality Gates (per phase)

```bash
bun run typecheck      # tsc --noEmit
bun run lint:strict    # eslint --max-warnings=0
bun run format:check   # prettier --check .
bun run build          # next build
```

## Rules

- No explicit `any` in new code — use `unknown` + Zod parse
- `strict: true` in tsconfig
- No `as` type assertions when Zod can validate
- No service role key in client code
- No raw SQL from client
