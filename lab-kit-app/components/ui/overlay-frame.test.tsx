import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

import {
  DialogActions,
  DialogFrame,
  SideSheetFrame,
} from "@/components/ui/overlay-frame";

describe("Overlay frame primitive", () => {
  test("renders side sheet frames from the global UI primitive", () => {
    const html = renderToStaticMarkup(
      <SideSheetFrame
        title="Cập nhật T6_00012"
        closeLabel="Đóng"
        onClose={vi.fn()}
      >
        <p>Nội dung</p>
      </SideSheetFrame>
    );

    expect(html).toContain('role="dialog"');
    expect(html).toContain("right-0");
    expect(html).toContain("h-dvh");
    expect(html).toContain("max-w-xl");
    expect(html).not.toContain("<dialog");
  });

  test("renders sticky side sheet footer from the global UI primitive", () => {
    const html = renderToStaticMarkup(
      <SideSheetFrame
        title="Mẫu T6_00012"
        closeLabel="Đóng"
        footer={<button type="button">Đóng</button>}
        onClose={vi.fn()}
      >
        <p>Nội dung</p>
      </SideSheetFrame>
    );

    expect(html).toContain("sticky");
    expect(html).toContain("bottom-0");
    expect(html).toContain("Đóng");
  });

  test("keeps modal and action compatibility from the global primitive", () => {
    const html = renderToStaticMarkup(
      <form>
        <DialogFrame title="Thêm mẫu" closeLabel="Đóng" onClose={vi.fn()}>
          <p>Nội dung</p>
        </DialogFrame>
        <DialogActions
          pending
          cancelLabel="Bỏ qua"
          savingLabel="Đang xử lý..."
          submitLabel="Tạo"
          onClose={vi.fn()}
        />
      </form>
    );

    expect(html).toContain("left-1/2");
    expect(html).toContain("-translate-x-1/2");
    expect(html).toContain("Bỏ qua");
    expect(html).toContain("Đang xử lý...");
  });

  test("dashboard dialog frame only re-exports the global primitive", () => {
    const source = readFileSync(
      join(process.cwd(), "components/dashboard/dialog-frame.tsx"),
      "utf8"
    );

    expect(source).toContain("@/components/ui/overlay-frame");
    expect(source).not.toContain("useEffect");
    expect(source).not.toContain("document.body.style.overflow");
  });
});
