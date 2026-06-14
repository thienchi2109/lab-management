import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const appDir = process.cwd();

describe("app branding contract", () => {
  test("publishes the selected LabKit favicon and logo assets", () => {
    const publicDir = join(appDir, "public");

    expect(existsSync(join(publicDir, "favicon.ico"))).toBe(true);
    expect(existsSync(join(publicDir, "favicon-16x16.png"))).toBe(true);
    expect(existsSync(join(publicDir, "favicon-32x32.png"))).toBe(true);
    expect(existsSync(join(publicDir, "apple-touch-icon.png"))).toBe(true);
    expect(existsSync(join(publicDir, "android-chrome-192x192.png"))).toBe(
      true
    );
    expect(existsSync(join(publicDir, "android-chrome-512x512.png"))).toBe(
      true
    );
    expect(existsSync(join(publicDir, "logo-lab-kit-removebg.png"))).toBe(true);
  });

  test("sets canonical LabKit app metadata and icon links", () => {
    const layout = readFileSync(join(appDir, "app/layout.tsx"), "utf8");
    const page = readFileSync(join(appDir, "app/page.tsx"), "utf8");
    const manifest = JSON.parse(
      readFileSync(join(appDir, "public/site.webmanifest"), "utf8")
    ) as {
      name?: string;
      short_name?: string;
      theme_color?: string;
      background_color?: string;
      icons?: Array<{ src: string; sizes: string; type: string }>;
    };

    expect(layout).toContain("APP_NAME");
    expect(layout).toContain("icons:");
    expect(layout).toContain("/favicon.ico");
    expect(layout).toContain("/apple-touch-icon.png");
    expect(page).toContain("APP_NAME");
    expect(page).not.toContain("Lab Kit Management");
    expect(manifest.name).toBe("LabKit Sample Management");
    expect(manifest.short_name).toBe("LabKit");
    expect(manifest.theme_color).toBe("#2f6b4f");
    expect(manifest.background_color).toBe("#f4faf6");
    expect(manifest.icons).toEqual([
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ]);
  });

  test("uses the canonical logo and app name on the login page", () => {
    const loginPage = readFileSync(join(appDir, "app/login/page.tsx"), "utf8");

    expect(loginPage).toContain("AppBrandMark");
    expect(loginPage).toContain("APP_NAME");
    expect(loginPage).toContain("/logo-lab-kit-removebg.png");
    expect(loginPage).not.toContain("LabFlow Precision");
    expect(loginPage).not.toContain("FlaskConical");
    expect(loginPage).not.toContain("© 2026 Lab Management");
  });
});
