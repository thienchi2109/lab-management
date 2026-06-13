# Validation

## Proof Strategy

US-016H hoàn tất khi `/dashboard/samples/[sampleId]/results` được polish mà
result-entry và sample-image contracts vẫn giữ nguyên.

## Test Plan

| Layer | Expected proof |
| --- | --- |
| Unit | Save payload, result validation, metric input and image request helpers. |
| Integration | Existing sample result and image panel component/API tests still pass. |
| E2E | Admin/Editor opens result page desktop/mobile, inspects groups/images, save/read-only states remain correct, no overlay, no horizontal overflow. |
| Platform | `bun run quality`, `bun run docstring:check`, React Doctor package script. |

## Commands

```bash
cd lab-kit-app
bun run test app/dashboard/samples/[sampleId]/results/_components/sample-results-client.test.tsx \
  app/dashboard/samples/[sampleId]/results/_components/result-group-accordion.test.tsx \
  app/dashboard/samples/[sampleId]/results/_components/metric-input-renderer.test.tsx \
  app/dashboard/samples/[sampleId]/results/_components/sample-images-panel.test.tsx \
  app/dashboard/samples/[sampleId]/results/_components/form-payload.test.ts \
  app/dashboard/samples/[sampleId]/results/_components/result-field-names.test.ts \
  app/dashboard/samples/[sampleId]/results/_components/sample-image-requests.test.ts \
  lib/sample-results/validation.test.ts \
  lib/sample-results/operations.test.ts \
  lib/sample-results/server.test.ts \
  lib/sample-results/schema-contract.test.ts \
  lib/sample-images/operations.test.ts \
  lib/sample-images/route-auth.test.ts
bun run quality
bun run docstring:check
bun run react-doctor:diff
```

## Browser Proof Targets

- Desktop `1440x1000`: result header, image panel, group accordion, editable
  fields, save action and feedback.
- Mobile `390x844`: image panel, group accordion, input controls, save action,
  read-only state if fixture practical, no horizontal overflow and no bottom-nav
  overlap.

## Acceptance Evidence

- Planned. Runtime proof pending implementation.
