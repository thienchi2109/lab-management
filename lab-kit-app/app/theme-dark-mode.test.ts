import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const appDir = process.cwd();

describe("dark mode theme contract", () => {
  test("keeps dark tokens in the class-based theme without media duplication", () => {
    const globalsCss = readFileSync(join(appDir, "app/globals.css"), "utf8");

    expect(globalsCss).toContain(".dark {");
    expect(globalsCss).not.toContain("@media (prefers-color-scheme: dark)");
    expect(globalsCss).not.toContain(":root:not(.light)");
  });

  test("login page uses semantic background tokens", () => {
    const loginPage = readFileSync(join(appDir, "app/login/page.tsx"), "utf8");

    expect(loginPage).toContain("bg-background");
    expect(loginPage).not.toContain("bg-zinc-50");
  });

  test("root layout applies the class-based dark theme from system preference", () => {
    const rootLayout = readFileSync(join(appDir, "app/layout.tsx"), "utf8");
    const colorSchemeScript = readFileSync(
      join(appDir, "public/color-scheme-init.js"),
      "utf8"
    );

    expect(rootLayout).toContain('src="/color-scheme-init.js"');
    expect(rootLayout).toContain('strategy="beforeInteractive"');
    expect(rootLayout).not.toContain("dangerouslySetInnerHTML");
    expect(colorSchemeScript).toContain("prefers-color-scheme: dark");
    expect(colorSchemeScript).toContain('classList.toggle("dark"');
  });
});
