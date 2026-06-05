import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const appDir = join(process.cwd(), "app");

describe("global font configuration", () => {
  test("uses Be Vietnam Pro as the global sans font", () => {
    const layout = readFileSync(join(appDir, "layout.tsx"), "utf8");
    const globals = readFileSync(join(appDir, "globals.css"), "utf8");

    expect(layout).toContain("Be_Vietnam_Pro");
    expect(layout).toContain('variable: "--font-be-vietnam-pro"');
    expect(globals).toContain('"Be Vietnam Pro"');
    expect(globals).toContain("--font-heading: var(--font-sans)");
    expect(globals).not.toContain("--font-sans: var(--font-sans)");
  });
});
