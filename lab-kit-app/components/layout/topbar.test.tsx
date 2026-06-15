// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { getPageTitle } from "./page-title";
import { Topbar } from "./topbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/samples",
}));

afterEach(cleanup);

describe("getPageTitle", () => {
  test("uses the US-004 result-configuration title", () => {
    expect(getPageTitle("/dashboard/result-configuration")).toBe(
      "Cấu hình chỉ tiêu động"
    );
  });

  test("keeps the title helper outside the Topbar component file", () => {
    expect(Topbar.name).toBe("Topbar");
  });
});

describe("Topbar responsive layout", () => {
  test("keeps global search hidden until wide desktop to avoid overlapping nav items", () => {
    render(<Topbar displayName="Điều phối viên" username="editor" />);

    expect(
      screen.getByPlaceholderText("Tìm kiếm mẫu, kit...").parentElement
        ?.className
    ).toContain("relative hidden w-60 2xl:block");
  });
});

describe("Topbar sign out confirmation", () => {
  test("opens a confirm dialog instead of submitting sign out immediately", async () => {
    const user = userEvent.setup();
    const submitListener = vi.fn((event: SubmitEvent) =>
      event.preventDefault()
    );
    document.addEventListener("submit", submitListener);

    try {
      render(<Topbar displayName="Điều phối viên" username="editor" />);

      await user.click(screen.getByRole("button", { name: "Đăng xuất" }));

      expect(submitListener).not.toHaveBeenCalled();
      const dialog = screen.getByRole("dialog", { name: "Xác nhận đăng xuất" });
      expect(dialog).toBeTruthy();

      const cancelButtons = within(dialog).getAllByRole("button", {
        name: "Hủy",
      });
      await user.click(cancelButtons[cancelButtons.length - 1]);

      expect(
        screen.queryByRole("dialog", { name: "Xác nhận đăng xuất" })
      ).toBeNull();
      expect(submitListener).not.toHaveBeenCalled();
    } finally {
      document.removeEventListener("submit", submitListener);
    }
  });

  test("submits the existing POST sign out form only after confirmation", async () => {
    const user = userEvent.setup();
    const submitListener = vi.fn((event: SubmitEvent) =>
      event.preventDefault()
    );
    document.addEventListener("submit", submitListener);

    try {
      render(<Topbar displayName="Điều phối viên" username="editor" />);

      const form = document.querySelector<HTMLFormElement>(
        'form[action="/auth/signout"][method="post"]'
      );
      expect(form).toBeTruthy();

      await user.click(screen.getByRole("button", { name: "Đăng xuất" }));
      expect(submitListener).not.toHaveBeenCalled();

      const dialog = screen.getByRole("dialog", { name: "Xác nhận đăng xuất" });
      await user.click(
        within(dialog).getByRole("button", { name: "Đăng xuất" })
      );

      expect(submitListener).toHaveBeenCalledTimes(1);
      expect(submitListener.mock.calls[0]?.[0].target).toBe(form);
    } finally {
      document.removeEventListener("submit", submitListener);
    }
  });
});
