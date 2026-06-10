// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { useFormStatus } from "react-dom";
import { describe, expect, test, vi } from "vitest";

import { LoginSubmitButton } from "./login-submit-button";

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();

  return {
    ...actual,
    useFormStatus: vi.fn(),
  };
});

describe("LoginSubmitButton", () => {
  test("renders the default submit affordance", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      action: null,
      data: null,
      method: null,
      pending: false,
    });

    render(<LoginSubmitButton />);

    const button = screen.getByRole("button", { name: "Đăng nhập" });
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  test("disables submit and announces progress while pending", () => {
    vi.mocked(useFormStatus).mockReturnValue({
      action: "/auth/login",
      data: new FormData(),
      method: "post",
      pending: true,
    });

    render(<LoginSubmitButton />);

    const button = screen.getByRole("button", { name: "Đang đăng nhập" });
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("aria-live")).toBe("polite");
  });
});
