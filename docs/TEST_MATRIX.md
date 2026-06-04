# Test Matrix

Behavior-to-proof control panel for the Lab Management MVP.

Use `scripts/bin/harness-cli query matrix` for the live view backed by the
durable layer.

## Validation Ladder

```text
validate:quick
  bun run typecheck
  bun run lint:strict
  bun run format:check
  bun run build

test:unit
  bun test (when unit tests exist)

test:integration
  database migration tests
  API route handler tests
  RLS policy tests

test:e2e
  sample creation flow
  result entry flow
  export flow
  role-based access flow

test:platform
  mobile responsive check (< 1024px)
  desktop grid check (>= 1024px)
```

## Quality Gate Commands

```bash
# Required after every phase
bun run typecheck      # tsc --noEmit
bun run lint:strict    # eslint --max-warnings=0
bun run format:check   # prettier --check .
bun run react-doctor   # React Doctor, fails on errors
bun run build          # next build

# Combined
bun run quality        # all of the above

# Phase-specific
bun test               # when tests exist
bun run react-doctor   # repeat manually for complex UI phases when needed
```

## No-Any Check

```bash
grep -R "\bany\b" app components lib types --include='*.ts' --include='*.tsx'
```

No explicit `any` allowed in new code.
