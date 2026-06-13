// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { BottomNav } from "./bottom-nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/analytics",
}));

describe("BottomNav", () => {
  test("groups secondary mobile navigation items under the more menu", async () => {
    const user = userEvent.setup();

    render(<BottomNav />);

    expect(screen.getByRole("link", { name: /Tổng quan/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Mẫu/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Báo cáo/ })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Người dùng/ })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Mở menu thêm" }));

    expect(screen.getByRole("link", { name: /Kho KIT/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Chỉ tiêu/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Người dùng/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Cài đặt/ })).toBeTruthy();
  });
});
