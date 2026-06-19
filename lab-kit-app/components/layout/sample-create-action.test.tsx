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

    render(
      <Topbar canCreateSamples displayName="Điều phối viên" username="editor" />
    );

    await user.click(screen.getByRole("button", { name: /Thêm mẫu/ }));

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("lab:samples:create-requested", listener);
  });

  test("desktop topbar hides Thêm mẫu for viewer sessions", () => {
    const listener = vi.fn();
    window.addEventListener("lab:samples:create-requested", listener);

    render(
      <Topbar
        canCreateSamples={false}
        displayName="Người xem"
        username="viewer"
      />
    );

    expect(screen.queryByRole("button", { name: /Thêm mẫu/ })).toBeNull();
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener("lab:samples:create-requested", listener);
  });

  test("mobile bottom nav no longer exposes a centered sample create action", () => {
    const listener = vi.fn();
    window.addEventListener("lab:samples:create-requested", listener);

    render(<BottomNav />);

    expect(screen.queryByRole("button", { name: "Thêm mẫu" })).toBeNull();
    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener("lab:samples:create-requested", listener);
  });
});
