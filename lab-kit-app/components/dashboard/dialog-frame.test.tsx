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

    expect(html).toContain("<dialog");
    expect(html).not.toContain("open=");
    expect(html).not.toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("aria-labelledby=");
    expect(html).toContain('aria-label="Đóng biểu mẫu"');
  });

  test("keeps keyboard handling out of dialog JSX attributes", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./dialog-frame.tsx", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).not.toContain("onKeyDown={handleKeyDown}");
  });

  test("uses showModal instead of a static open attribute", async () => {
    const source = await import("node:fs/promises").then((fs) =>
      fs.readFile(new URL("./dialog-frame.tsx", import.meta.url), {
        encoding: "utf8",
      })
    );

    expect(source).toContain(".showModal()");
    expect(source).toContain(".close()");
    expect(source).not.toContain("\n        open\n");
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
  });
});
