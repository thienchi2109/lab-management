# Architecture

Stack selected: Next.js App Router + Bun + Supabase Postgres + Cloudinary.

See `docs/decisions/0006-nextjs-bun-supabase-stack.md` for the decision record.
See `docs/decisions/0007-cloudinary-media-upload-provider.md` for the storage
provider update that supersedes the R2 part of decision 0006.
See `docs/product/tech-stack.md` for the full stack reference.

## Product Surfaces

- **Browser**: Next.js web app, mobile-first responsive, deployed on Vercel.
- No mobile app, desktop app, CLI, or worker in MVP.

## Runtime Stack

| Component | Technology |
| --- | --- |
| Language | TypeScript (strict, no explicit `any`) |
| Framework | Next.js 15 App Router |
| Package manager | Bun |
| Database | Supabase Postgres with RLS |
| Auth | Auth.js / NextAuth |
| File storage | Cloudinary signed image upload |
| UI | Tailwind CSS + shadcn/ui |
| Deploy | Vercel |

## Core Domains

| Domain | Stable names |
| --- | --- |
| Kit inventory | kit_batches, kits, kit_types, categories |
| Sample management | samples, sample_types, customers, companies |
| Result engine | result_groups, result_metrics, result_templates, metric_settings |
| Sample results | sample_results, sample_group_conclusions |
| Media | sample_images |
| Identity | users, roles (admin/editor/viewer) |
| Audit | audit_logs |

## Default Layering

```text
domain
  <- application
      <- infrastructure
          <- interface
              <- app surfaces
```

Applied to the Next.js codebase:

```text
types/               domain types, enums, value objects
lib/                 application + infrastructure
  validation/        Zod schemas (parse boundary)
  db/                Supabase client + queries
  auth/              session, role helpers
  permissions/       RBAC helpers
  audit/             audit log writer
  result-engine/     KQ_CHUNG computation
  media/             Cloudinary signature, asset metadata, and deletion helpers
app/api/             interface: route handlers
app/(dashboard)/     surface: browser UI
components/          UI components
```

## Dependency Rule

Inner layers must not depend on outer layers.

| Layer | May depend on | Must not depend on |
| --- | --- | --- |
| types/ | nothing | framework, database, UI |
| lib/ | types/ | UI components, route handlers |
| app/api/ | lib/, types/ | UI components |
| components/ | types/ | lib/db directly (use hooks/server actions) |
| app/(dashboard)/ | components/, types/ | lib/db directly |

## Parse-First Boundary Rule

Unknown data must be parsed at boundaries before it enters inner code.

Boundaries:

- HTTP request bodies, params, and query strings → Zod schemas
- Session payloads and identity claims → typed session helper
- Environment variables → validated env config
- Database rows → typed query results
- Cloudinary signature and asset metadata requests → validated upload params

Target flow:

```text
unknown input
  -> Zod parser
  -> typed DTO or command
  -> application use case
  -> domain object/value object
```

## Command/Query Boundary

- Commands (POST/PUT/PATCH/DELETE): mutate state, own audit side effects
- Queries (GET): read state, format for consumers
- Shared domain rules live in lib/, not route handlers

## Observability Contract

The server should emit one canonical JSON log line per request with:

- timestamp
- level
- request_id
- user_id when known
- action
- duration_ms
- status_code
- message

Audit logs are product records. Application logs are operational records.
Do not use one as a substitute for the other.
