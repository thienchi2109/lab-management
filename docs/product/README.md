# Product Contract

Living product documentation for the Lab Management MVP.

These files are the current product truth. They are derived from
`original_specs/SPEC-001-NextJS-MVP-Phased-Roadmap.md` and updated as
implementation progresses.

## Documents

| File | Domain |
| --- | --- |
| [overview.md](overview.md) | Product scope, users, and MVP boundaries |
| [data-model.md](data-model.md) | Core entities, relationships, and constraints |
| [roles-permissions.md](roles-permissions.md) | RBAC roles and permission matrix |
| [result-engine.md](result-engine.md) | Dynamic result entry: groups, metrics, input types, templates |
| [ui-contract.md](ui-contract.md) | Mobile-first layout, form zones, grid modes, dashboard |
| [api-contract.md](api-contract.md) | API endpoints, rules, and security |
| [tech-stack.md](tech-stack.md) | Stack decisions and quality gates |

## Source Hierarchy

```text
original_specs/SPEC-001*.md   → input material (frozen after decomposition)
docs/product/*                → current product truth (living)
docs/stories/*                → story-sized work packets
docs/decisions/*              → durable decisions
```
