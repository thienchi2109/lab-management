// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { BottomNav } from "./bottom-nav";
import { Topbar } from "./topbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/samples",
}));

afterEach(cleanup);

describe("sample create global action", () => {
  test("desktop topbar Thêm mẫu dispatches the sample create request", async () => {
    const user = userEvent.setup();
    const listener = vi.fn();
    window.addEventListener("lab:samples:create-requested", listener);

    render(<Topbar displayName="Điều phối viên" username="editor" />);

    await user.click(screen.getByRole("button", { name: /Thêm mẫu/ }));

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("lab:samples:create-requested", listener);
  });

  test("mobile bottom nav exposes a centered sample create action", async () => {
    const user = userEvent.setup();
    const listener = vi.fn();
    window.addEventListener("lab:samples:create-requested", listener);

    render(<BottomNav />);

    const action = screen.getByRole("button", { name: "Thêm mẫu" });
    expect(action.className).toContain("absolute");
    expect(action.className).toContain("left-1/2");

    await user.click(action);

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("lab:samples:create-requested", listener);
  });
});
