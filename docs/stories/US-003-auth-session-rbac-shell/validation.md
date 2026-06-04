# Validation

## Proof Strategy

US-003 has offline and live proof. Offline proof covers schema contract, auth
parsing, role helpers, route build safety, and quality gates. Live proof applies
the username migration, checks RLS/advisors, and confirms the Harness matrix.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Username normalization, login schema, app role parsing, role checks. |
| Integration | Supabase migration applies, username uniqueness/format constraints exist. |
| E2E | Deferred until a real auth user/password is provisioned. |
| Platform | `bun run quality`, React Doctor, Next build, Supabase security/performance advisors. |
| Logs/Audit | No secret, password, JWT, or internal email logging in auth code. |

## Fixtures

- Demo organization from US-002 seed: `Demo Lab`.
- Demo roles: `admin`, `editor`, `viewer`.
- Demo usernames for tests: `admin`, `editor`, `viewer`.

## Commands

```text
node scripts/validate-supabase-schema.mjs
cd lab-kit-app && bun test
cd lab-kit-app && bun run quality
scripts/bin/harness-cli query matrix
Supabase MCP: apply migration, inspect columns/indexes, run security advisors
Supabase MCP: run performance advisors
```

## Acceptance Evidence

- Offline schema contract passed after adding
  `supabase/migrations/202606040003_username_auth_alias.sql`.
- Live Supabase migration `us_003_username_auth_alias` applied on 2026-06-04;
  live migrations now include `us_002_initial_schema`,
  `us_002_advisor_fixes`, and `us_003_username_auth_alias`.
- Live inspection confirmed `public.profiles.username`, the
  `profiles_username_format_check` constraint, and
  `profiles_username_lower_key` unique normalized index.
- `cd lab-kit-app && bun run test` passed with 4 files and 13 tests.
- `cd lab-kit-app && bun run quality` passed: typecheck, ESLint strict,
  Prettier, React Doctor, and Next build.
- `cd lab-kit-app && bun run react-doctor:verbose` returned no issues.
- Agent Browser verified `/login` renders username/password controls, and
  invalid local credentials fail closed to `/login?error=invalid`.
- Supabase security advisor returned no lints after US-003 migration.
- Supabase performance advisor returned only `unused_index` INFO findings
  expected on the fresh seeded database with no application traffic.
- E2E authenticated dashboard access remains blocked until a real Supabase Auth
  user/password is provisioned.
