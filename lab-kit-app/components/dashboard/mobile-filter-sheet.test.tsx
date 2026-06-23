import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

describe("DashboardMobileFilterSheet", () => {
  test("renders footer through a named component instead of an inline call", () => {
    const source = readFileSync(
      join(process.cwd(), "components/dashboard/mobile-filter-sheet.tsx"),
      "utf8"
    );

    expect(source).toContain("FooterComponent");
    expect(source).toContain("footer={<FooterComponent");
    expect(source).toContain("close={close}");
    expect(source).not.toContain("renderFooter(close)");
  });
});
