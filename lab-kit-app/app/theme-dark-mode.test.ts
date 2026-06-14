import { existsSync, readFileSync } from "node:fs";
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

  test("dashboard shell keeps the clinical canvas semantic", () => {
    const dashboardLayout = readFileSync(
      join(appDir, "app/dashboard/layout.tsx"),
      "utf8"
    );

    expect(dashboardLayout).toContain("bg-background");
    expect(dashboardLayout).not.toContain("bg-zinc-50");
    expect(dashboardLayout).not.toContain("bg-zinc-950");
  });

  test("uses the clinical green palette as the semantic app theme", () => {
    const globalsCss = readFileSync(join(appDir, "app/globals.css"), "utf8");

    expect(globalsCss).toContain("--background: oklch(0.982 0.012 142)");
    expect(globalsCss).toContain("--primary: oklch(0.418 0.087 152)");
    expect(globalsCss).toContain("--ring: oklch(0.418 0.087 152)");
    expect(globalsCss).not.toContain("--primary: oklch(0.205 0 0)");
  });

  test("root layout applies the class-based dark theme from system preference", () => {
    const rootLayout = readFileSync(join(appDir, "app/layout.tsx"), "utf8");
    const colorSchemeScriptPath = join(
      appDir,
      "lib/theme/color-scheme-init.ts"
    );
    const colorSchemeScript = existsSync(colorSchemeScriptPath)
      ? readFileSync(colorSchemeScriptPath, "utf8")
      : "";

    expect(existsSync(colorSchemeScriptPath)).toBe(true);
    expect(existsSync(join(appDir, "public/color-scheme-init.js"))).toBe(false);
    expect(rootLayout).toContain('from "@/lib/theme/color-scheme-init"');
    expect(rootLayout).toContain('id="color-scheme-init"');
    expect(rootLayout).toContain('strategy="beforeInteractive"');
    expect(rootLayout).toContain("COLOR_SCHEME_INIT_SCRIPT");
    expect(rootLayout).not.toContain('src="/color-scheme-init.js"');
    expect(rootLayout).not.toContain("dangerouslySetInnerHTML");
    expect(colorSchemeScript).toContain("prefers-color-scheme: dark");
    expect(colorSchemeScript).toContain('classList.toggle("dark"');
  });
});
