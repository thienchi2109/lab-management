import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const appDir = join(process.cwd(), "app");

describe("global font configuration", () => {
  test("uses the Stitch reference font stack globally", () => {
    const layout = readFileSync(join(appDir, "layout.tsx"), "utf8");
    const globals = readFileSync(join(appDir, "globals.css"), "utf8");

    expect(layout).toContain("Geist");
    expect(layout).toContain("JetBrains_Mono");
    expect(layout).toContain('variable: "--font-geist-sans"');
    expect(layout).toContain('variable: "--font-jetbrains-mono"');
    expect(layout).toContain('subsets: ["latin", "latin-ext"]');
    expect(layout).toContain('subsets: ["latin", "latin-ext", "vietnamese"]');
    expect(globals).toContain('"Geist"');
    expect(globals).toContain('"JetBrains Mono"');
    expect(globals).toContain("--font-heading: var(--font-sans)");
    expect(globals).not.toContain("--font-sans: var(--font-sans)");
    expect(globals).not.toContain("Be Vietnam Pro");
  });
});
