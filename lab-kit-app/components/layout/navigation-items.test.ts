import { describe, expect, test } from "vitest";

import { desktopNavItems, mobileNavItems } from "./navigation-items";

describe("result-configuration navigation", () => {
  test("uses the US-004 route for desktop and mobile navigation", () => {
    expect(desktopNavItems.find((item) => item.title === "Chỉ tiêu")?.url).toBe(
      "/dashboard/result-configuration"
    );
    expect(mobileNavItems.find((item) => item.title === "Chỉ tiêu")?.url).toBe(
      "/dashboard/result-configuration"
    );
  });
});
