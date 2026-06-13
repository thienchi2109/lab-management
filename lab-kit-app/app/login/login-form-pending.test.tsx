// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import LoginPage from "./page";

describe("LoginPage pending state", () => {
  test("shows pending state without dropping submitted credentials", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    fireEvent.change(screen.getByLabelText("Tên đăng nhập"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: { value: "secret" },
    });

    const form = screen
      .getByRole("button", { name: "Đăng nhập" })
      .closest("form");
    if (!form) throw new Error("Login form is missing.");

    fireEvent.submit(form);

    const submittedData = new FormData(form);
    expect(
      screen
        .getByRole("button", { name: "Đang đăng nhập" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(
      screen.getByLabelText("Tên đăng nhập").hasAttribute("readonly")
    ).toBe(true);
    expect(screen.getByLabelText("Mật khẩu").hasAttribute("readonly")).toBe(
      true
    );
    expect(submittedData.get("username")).toBe("admin");
    expect(submittedData.get("password")).toBe("secret");
  });
});
