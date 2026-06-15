# Validation

## Proof Strategy

Khóa route và UI bằng test trước, sau đó chạy focused tests và các quality gate
bắt buộc cho auth/UI change.

## Test Plan

| Layer       | Cases                                                               |
| ----------- | ------------------------------------------------------------------- |
| Unit        | Env parser đọc credential viewer server-only.                       |
| Integration | `POST /auth/viewer-login` redirect dashboard và giữ session cookie. |
| UI          | Login page render form POST `/auth/viewer-login` và nút viewer.     |
| Platform    | Typecheck, React Doctor diff, docstring gate.                       |
| Logs/Audit  | Không đưa credential viewer vào file tracked hoặc log.              |

## Fixtures

- Username viewer: cấu hình qua `VIEWER_LOGIN_USERNAME`.
- Password viewer: cấu hình qua `VIEWER_LOGIN_PASSWORD`.

## Commands

```text
cd lab-kit-app && bun test lib/env.test.ts app/auth/login/route.test.ts app/auth/viewer-login/route.test.ts app/login/page.test.tsx app/login/login-form-pending.test.tsx
cd lab-kit-app && bun run typecheck
cd lab-kit-app && bun run react-doctor:diff
cd lab-kit-app && bun run docstring:check
```

## Acceptance Evidence

- RED: `npm exec --yes -- vitest run lib/env.test.ts app/auth/viewer-login/route.test.ts app/login/page.test.tsx`
  failed vì thiếu `parseViewerLoginEnv`, route `/auth/viewer-login`, và form
  viewer.
- Focused tests passed: `npm exec --yes -- vitest run lib/env.test.ts
app/auth/viewer-login/route.test.ts app/login/page.test.tsx
app/login/login-form-pending.test.tsx app/login/login-submit-button.test.tsx`
  với 5 files / 13 tests.
- `bun run typecheck` passed.
- `bun run lint:strict` passed.
- `bun run docstring:check` passed.
- `bun run react-doctor:diff` passed, không có issue.
- `bun run build` passed; route `/auth/viewer-login` xuất hiện trong build
  output.
- Vercel Production project `aquatic-lab` đã có
  `VIEWER_LOGIN_USERNAME` và `VIEWER_LOGIN_PASSWORD`; verify bằng
  `vercel env ls production` chỉ in tên biến, không in giá trị.
