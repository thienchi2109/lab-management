// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { BottomNav } from "./bottom-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/analytics",
}));

describe("BottomNav", () => {
  beforeEach(cleanup);

  test("uses moderately larger mobile tap targets after removing the floating action", () => {
    render(<BottomNav />);

    const nav = screen.getByRole("navigation");
    expect(nav.className).toContain("h-[4.5rem]");
    expect(nav.className).not.toContain("h-20");
    expect(screen.getByRole("link", { name: /Báo cáo/ }).className).toContain(
      "gap-1.5"
    );
    expect(
      screen.getByRole("link", { name: /Báo cáo/ }).querySelector("svg")
        ?.className.baseVal
    ).toContain("size-6");
  });

  test("renders the customer-approved mobile tabs and keeps admin items under more", async () => {
    const user = userEvent.setup();

    render(<BottomNav />);

    expect(screen.queryByRole("link", { name: /Tổng quan/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Mẫu/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Báo cáo/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Kho KIT/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Mở menu thêm" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Người dùng/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Thêm mẫu" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Mở menu thêm" }));

    expect(screen.getByRole("link", { name: /Chỉ tiêu/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Người dùng/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Cài đặt/ })).toBeTruthy();
  });
});
