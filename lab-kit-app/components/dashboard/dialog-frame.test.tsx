import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import { DialogActions, DialogFrame } from "./dialog-frame";

describe("DialogFrame", () => {
  test("renders dialog semantics and configurable close label", () => {
    const html = renderToStaticMarkup(
      <DialogFrame
        title="Thêm chỉ tiêu"
        closeLabel="Đóng biểu mẫu"
        onClose={vi.fn()}
      >
        <p>Nội dung</p>
      </DialogFrame>
    );

    expect(html).not.toContain("<dialog");
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("aria-labelledby=");
    expect(html).toContain('aria-label="Đóng biểu mẫu"');
  });

  test("centers modal frames in the viewport instead of relying on dialog defaults", () => {
    const html = renderToStaticMarkup(
      <DialogFrame
        title="Thêm mẫu xét nghiệm"
        closeLabel="Đóng"
        onClose={vi.fn()}
      >
        <p>Nội dung</p>
      </DialogFrame>
    );

    expect(html).toContain("left-1/2");
    expect(html).toContain("top-1/2");
    expect(html).toContain("-translate-x-1/2");
    expect(html).toContain("-translate-y-1/2");
  });

  test("keeps modal content within the viewport with a scrollable body", () => {
    const html = renderToStaticMarkup(
      <DialogFrame
        title="Thêm mẫu xét nghiệm"
        closeLabel="Đóng"
        onClose={vi.fn()}
      >
        <p>Nội dung dài</p>
      </DialogFrame>
    );

    expect(html).toContain("flex-col");
    expect(html).toContain("overflow-hidden");
    expect(html).toContain("min-h-0");
    expect(html).toContain("flex-1");
    expect(html).toContain("overflow-y-auto");
  });

  test("renders side sheet frames from the right edge", () => {
    const html = renderToStaticMarkup(
      <DialogFrame
        mode="sheet"
        title="Cập nhật T6_00012"
        closeLabel="Đóng"
        onClose={vi.fn()}
      >
        <p>Nội dung</p>
      </DialogFrame>
    );

    expect(html).toContain("right-0");
    expect(html).toContain("h-dvh");
    expect(html).toContain("max-w-xl");
  });

  test("keeps keyboard handling out of dialog JSX attributes", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./dialog-frame.tsx", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).not.toContain("onKeyDown={handleKeyDown}");
  });

  test("avoids native dialog top-layer behavior so dropdown portals stay usable", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./dialog-frame.tsx", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).not.toContain("HTMLDialogElement");
    expect(source).not.toContain(".showModal()");
    expect(source).not.toContain(".close()");
  });

  test("locks background scroll while an overlay is mounted", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./dialog-frame.tsx", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).toContain('document.body.style.overflow = "hidden"');
    expect(source).toContain("scrollbarGutter");
  });
});

describe("DialogActions", () => {
  test("renders configurable cancel and saving labels", () => {
    const html = renderToStaticMarkup(
      <form>
        <DialogActions
          pending
          cancelLabel="Bỏ qua"
          savingLabel="Đang xử lý..."
          submitLabel="Tạo"
          onClose={vi.fn()}
        />
      </form>
    );

    expect(html).toContain("Bỏ qua");
    expect(html).toContain("Đang xử lý...");
    expect(html).toContain("border-t");
    expect(html).not.toContain("sticky");
  });
});
