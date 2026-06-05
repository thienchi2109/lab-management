import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { getPageTitle } from "./page-title";

const topbarSource = readFileSync(
  join(process.cwd(), "components/layout/topbar.tsx"),
  "utf8"
);

describe("getPageTitle", () => {
  test("uses the US-004 result-configuration title", () => {
    expect(getPageTitle("/dashboard/result-configuration")).toBe(
      "Cấu hình chỉ tiêu động"
    );
  });

  test("keeps the title helper outside the Topbar component file", () => {
    expect(topbarSource).not.toContain("export function getPageTitle");
  });
});
