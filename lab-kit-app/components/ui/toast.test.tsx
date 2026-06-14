// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { describe, expect, test } from "vitest";

import { AppToastProvider, useToast } from "./toast";

afterEach(cleanup);

function ToastTrigger() {
  const { toast } = useToast();

  return (
    <button
      type="button"
      onClick={() =>
        toast({
          title: "Đã lưu thay đổi",
          description: "Mẫu xét nghiệm đã được cập nhật.",
        })
      }
    >
      Hiển thị thông báo
    </button>
  );
}

describe("global toast primitive", () => {
  test("exposes a global toast API from the mounted provider", () => {
    render(
      <AppToastProvider>
        <ToastTrigger />
      </AppToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Hiển thị thông báo" }));

    expect(screen.getByText("Đã lưu thay đổi")).toBeTruthy();
    expect(screen.getByText("Mẫu xét nghiệm đã được cập nhật.")).toBeTruthy();
  });

  test("defines accessible status toasts with semantic clinical styling", () => {
    const source = readFileSync(
      join(process.cwd(), "components/ui/toast.tsx"),
      {
        encoding: "utf8",
      }
    );

    expect(source).toContain('role="status"');
    expect(source).toContain("bg-card");
    expect(source).toContain("border-border");
    expect(source).toContain("text-card-foreground");
    expect(source).toContain("ToastPrimitive.Provider");
    expect(source).toContain("ToastPrimitive.Viewport");
  });

  test("mounts the toast provider and viewport once from the root layout", () => {
    const layout = readFileSync(join(process.cwd(), "app/layout.tsx"), "utf8");

    expect(layout).toContain("AppToastProvider");
    expect(layout.match(/<AppToastProvider/g)?.length).toBe(1);
  });
});
