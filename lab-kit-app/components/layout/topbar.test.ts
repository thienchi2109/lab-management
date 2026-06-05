import { describe, expect, test } from "vitest";

import { getPageTitle } from "./topbar";

describe("getPageTitle", () => {
  test("uses the US-004 result-configuration title", () => {
    expect(getPageTitle("/dashboard/result-configuration")).toBe(
      "Cấu hình chỉ tiêu động"
    );
  });
});
