import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test, vi } from "vitest";

import {
  BottomSheetFrame,
  DialogActions,
  DialogFrame,
  SideSheetFrame,
} from "@/components/ui/overlay-frame";

describe("Overlay frame primitive", () => {
  test("renders bottom sheet frames without native dialog viewport sizing", () => {
    const html = renderToStaticMarkup(
      <BottomSheetFrame
        title="Tìm kiếm và lọc"
        closeLabel="Đóng"
        footer={<button type="button">Áp dụng</button>}
        onClose={vi.fn()}
      >
        <p>Nội dung</p>
      </BottomSheetFrame>
    );

    expect(html).not.toContain("<dialog");
    expect(html).toContain('role="dialog"');
    expect(html).toContain("z-[60]");
    expect(html).toContain("bottom-0");
    expect(html).toContain("--overlay-viewport-height:100dvh");
    expect(html).toContain(
      "h-[calc(var(--overlay-viewport-height)-env(safe-area-inset-bottom))]"
    );
    expect(html).toContain("pb-[calc(0.75rem+env(safe-area-inset-bottom))]");
    expect(html).not.toContain(
      "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
    );
    expect(html).toContain("rounded-t-2xl");
    expect(html).toContain("w-10 rounded-full");
    expect(html).toContain("Áp dụng");
  });

  test("updates bottom sheet height from visualViewport on mobile Safari", () => {
    const source = readFileSync(
      join(process.cwd(), "components/ui/overlay-frame.tsx"),
      "utf8"
    );

    expect(source).toContain("window.visualViewport");
    expect(source).toContain("--overlay-viewport-height");
    expect(source).toContain('visualViewport.addEventListener("resize"');
    expect(source).toContain('visualViewport.addEventListener("scroll"');
  });

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

    expect(html).toContain("<dialog");
    expect(html).not.toContain('role="dialog"');
    expect(html).toContain("right-0");
    expect(html).toContain("h-dvh");
    expect(html).toContain("max-w-xl");
  });

  test("uses compact frame spacing to reduce scrolling in dense side sheets", () => {
    const html = renderToStaticMarkup(
      <SideSheetFrame
        title="Kết quả mẫu T6_00012"
        closeLabel="Đóng"
        footer={<button type="button">Lưu</button>}
        onClose={vi.fn()}
      >
        <p>Nội dung</p>
      </SideSheetFrame>
    );

    expect(html).toContain("border-b px-4 py-3");
    expect(html).toContain("overflow-y-auto overscroll-contain p-4");
    expect(html).toContain("border-t bg-background px-4 py-3");
    expect(html).not.toContain("px-5 py-4");
    expect(html).not.toContain("overscroll-contain p-5");
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

  test("centers compact modals at desktop breakpoints", () => {
    const html = renderToStaticMarkup(
      <DialogFrame
        title="Xác nhận đăng xuất"
        closeLabel="Hủy"
        mobileLayout="compact"
        footer={<button type="button">Đăng xuất</button>}
        onClose={vi.fn()}
      >
        <p>Bạn có chắc muốn đăng xuất khỏi hệ thống?</p>
      </DialogFrame>
    );

    expect(html).toContain("top-1/2");
    expect(html).toContain("sm:top-1/2");
    expect(html).toContain("sm:left-1/2");
    expect(html).toContain("-translate-y-1/2");
    expect(html).not.toContain("sm:inset-auto");
  });

  test("keeps compact confirm content static instead of adding scroll chrome", () => {
    const html = renderToStaticMarkup(
      <DialogFrame
        title="Xác nhận đăng xuất"
        closeLabel="Hủy"
        mobileLayout="compact"
        footer={<button type="button">Đăng xuất</button>}
        onClose={vi.fn()}
      >
        <p>Bạn có chắc muốn đăng xuất khỏi hệ thống?</p>
      </DialogFrame>
    );

    expect(html).toContain("px-4 py-3");
    expect(html).not.toContain("overflow-y-auto");
    expect(html).not.toContain("sticky bottom-0");
  });

  test("renders modal frames as fullscreen on mobile and centered from sm", () => {
    const html = renderToStaticMarkup(
      <DialogFrame title="Thêm mẫu" closeLabel="Đóng" onClose={vi.fn()}>
        <p>Nội dung</p>
      </DialogFrame>
    );

    expect(html).toContain("inset-0");
    expect(html).toContain("h-dvh");
    expect(html).toContain("w-full");
    expect(html).toContain("sm:left-1/2");
    expect(html).toContain("sm:-translate-x-1/2");
    expect(html).toContain("sm:max-w-2xl");
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

  test("locks both document and body scroll while overlays are mounted", () => {
    const source = readFileSync(
      join(process.cwd(), "components/ui/overlay-frame.tsx"),
      "utf8"
    );

    expect(source).toContain('document.body.style.overflow = "hidden"');
    expect(source).toContain(
      'document.documentElement.style.overflow = "hidden"'
    );
  });
});
