# 0006 — Next.js + Bun + Supabase Stack for MVP

**Status:** accepted  
**Date:** 2026-06-03  
**Deciders:** Product owner  
**Context:** SPEC-001 MVP architecture decision

## Decision

The MVP uses:

- **Bun** as package manager and runtime tooling
- **Next.js App Router** for unified frontend + backend
- **Route Handlers / Server Actions** for API (no Go backend)
- **Supabase Postgres** with RLS for data storage
- **Auth.js / NextAuth** for authentication and sessions
- **Cloudflare R2** for image/file storage via presigned URLs
- **Tailwind CSS + shadcn/ui** for UI components
- **Vercel** for deployment

## Context

The app serves 5–7 internal lab users. Requirements center on:

- Dynamic forms driven by database configuration
- Frequently changing thresholds/settings
- Mobile-first data entry
- Moderate grid/export/pivot needs

These requirements favor a unified TypeScript codebase over a separate Go
backend, reducing deployment complexity and enabling shared types between UI
and API.

## Consequences

- Go is deferred to post-MVP for: large Excel exports, heavy pivot/reports,
  batch processing, or backend separation.
- All business logic runs in Next.js Route Handlers or Server Actions.
- TypeScript strict mode with no explicit `any` enforced.
- Quality gates must pass before each phase advances.

## Alternatives Considered

- **Go + Next.js**: More runtime complexity, harder for single-agent
  development, deferred to post-MVP.
- **Plain React + Express**: Loses Next.js SSR/RSC benefits and Vercel
  integration.
