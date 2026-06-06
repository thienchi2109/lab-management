import { describe, expect, test, vi } from "vitest";

import { getLocalDateTimeInputValue } from "./datetime";

describe("sample metadata datetime helpers", () => {
  test("formats default datetime-local values in browser local time", () => {
    const date = new Date("2026-06-06T08:30:00.000Z");
    vi.spyOn(date, "getTimezoneOffset").mockReturnValue(-420);

    expect(getLocalDateTimeInputValue(date)).toBe("2026-06-06T15:30");
  });
});
