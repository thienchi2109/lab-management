import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import LoginPage from "./page";

describe("LoginPage", () => {
  test("renders the internal login form contract", async () => {
    const html = renderToStaticMarkup(
      await LoginPage({ searchParams: Promise.resolve({}) })
    );

    expect(html).toContain('action="/auth/login"');
    expect(html).toContain('method="post"');
    expect(html).toContain("<label");
    expect(html).toContain('for="username"');
    expect(html).toContain('name="username"');
    expect(html).toContain('for="password"');
    expect(html).toContain('name="password"');
    expect(html).not.toContain('placeholder="admin"');
    expect(html).toContain("login-lab-stitch.png");
    expect(html).toContain("Minh hoạ quy trình xét nghiệm");
  });

  test("marks invalid credential feedback as an accessible form error", async () => {
    const html = renderToStaticMarkup(
      await LoginPage({ searchParams: Promise.resolve({ error: "invalid" }) })
    );

    expect(html).toContain('id="login-error"');
    expect(html).toContain('role="alert"');
    expect(html).toContain("Tên đăng nhập hoặc mật khẩu không đúng.");
    expect(html).toContain('aria-describedby="login-error"');
    expect(html).toContain('aria-invalid="true"');
  });
});
