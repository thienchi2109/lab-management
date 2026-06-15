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

describe("dashboard route retirement", () => {
  test("does not expose /dashboard as an internal navigation entry", () => {
    expect(
      [...desktopNavItems, ...mobileNavItems].map((item) => item.url)
    ).not.toContain("/dashboard");
  });
});
