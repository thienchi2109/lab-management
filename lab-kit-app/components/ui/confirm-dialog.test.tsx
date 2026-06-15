// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type FormEvent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  test("uses a compact mobile modal instead of inheriting fullscreen form layout", () => {
    const html = renderToStaticMarkup(
      <ConfirmDialog
        open
        title="Xác nhận đăng xuất"
        description="Bạn có chắc muốn đăng xuất khỏi hệ thống?"
        confirmLabel="Đăng xuất"
        cancelLabel="Hủy"
        onOpenChange={vi.fn()}
      />
    );

    expect(html).toContain("inset-x-4");
    expect(html).toContain("top-1/2");
    expect(html).toContain("max-h-[calc(100dvh-2rem)]");
    expect(html).toContain("rounded-lg");
    expect(html).not.toContain("h-dvh w-full max-w-none");
  });

  test("renders the shared confirm copy and closes through cancel", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Xác nhận đăng xuất"
        description="Bạn có chắc muốn đăng xuất khỏi hệ thống?"
        confirmLabel="Đăng xuất"
        cancelLabel="Hủy"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    expect(
      screen.getByRole("dialog", { name: "Xác nhận đăng xuất" })
    ).toBeTruthy();
    expect(
      screen.getByText("Bạn có chắc muốn đăng xuất khỏi hệ thống?")
    ).toBeTruthy();

    const cancelButtons = screen.getAllByRole("button", { name: "Hủy" });
    await user.click(cancelButtons[cancelButtons.length - 1]);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test("runs the confirm callback when no form is referenced", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open
        title="Xác nhận thao tác"
        description="Bạn có muốn tiếp tục?"
        confirmLabel="Tiếp tục"
        cancelLabel="Hủy"
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "Tiếp tục" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  test("submits the referenced form only from the confirm action", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) =>
      event.preventDefault()
    );

    render(
      <>
        <form id="delete-sample-form" onSubmit={onSubmit} />
        <ConfirmDialog
          open
          title="Xóa mẫu"
          description="Thao tác này không thể hoàn tác."
          confirmLabel="Xóa"
          cancelLabel="Hủy"
          intent="destructive"
          confirmFormId="delete-sample-form"
          onOpenChange={vi.fn()}
        />
      </>
    );

    const cancelButtons = screen.getAllByRole("button", { name: "Hủy" });
    await user.click(cancelButtons[cancelButtons.length - 1]);
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Xóa" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
