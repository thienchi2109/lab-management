import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { DashboardDataTable } from "./data-table";

describe("DashboardDataTable", () => {
  test("renders desktop table rows and mobile card rows from one shared component", () => {
    const html = renderToStaticMarkup(
      <DashboardDataTable
        caption="Danh sách KIT"
        emptyTitle="Không có KIT phù hợp"
        emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        rows={[
          {
            id: "kit-1",
            cells: [
              { header: "Mã KIT", content: "KIT-001", primary: true },
              { header: "Trạng thái", content: "Còn tồn" },
            ],
            actions: <button type="button">Cập nhật</button>,
          },
        ]}
      />
    );

    expect(html).toContain("<table");
    expect(html).toContain("KIT-001");
    expect(html).toContain("md:hidden");
    expect(html).toContain("Cập nhật");
  });

  test("renders a shared empty state when no rows match", () => {
    const html = renderToStaticMarkup(
      <DashboardDataTable
        caption="Danh sách KIT"
        emptyTitle="Không có KIT phù hợp"
        emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        rows={[]}
      />
    );

    expect(html).toContain("Không có KIT phù hợp");
    expect(html).toContain("Thử đổi bộ lọc hoặc từ khóa tìm kiếm.");
  });

  test("omits the actions column when rows do not expose actions", () => {
    const html = renderToStaticMarkup(
      <DashboardDataTable
        caption="Bảng pivot analytics"
        emptyTitle="Không có dữ liệu analytics"
        emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        rows={[
          {
            id: "row-1",
            cells: [
              { header: "Ngày nhận mẫu", content: "2026-06-01" },
              { header: "Tổng mẫu", content: "3 mẫu" },
            ],
          },
        ]}
      />
    );

    expect(html).not.toContain("Tác vụ");
  });

  test("applies responsive column metadata to desktop and mobile cells", () => {
    const html = renderToStaticMarkup(
      <DashboardDataTable
        caption="Danh sách KIT"
        emptyTitle="Không có KIT phù hợp"
        emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        rows={[
          {
            id: "kit-1",
            cells: [
              { header: "Mã KIT", content: "KIT-001", primary: true },
              {
                columnKey: "lot",
                desktopClassName: "hidden lg:table-cell",
                header: "Lô",
                mobileClassName: "hidden sm:flex",
                content: "LOT-001",
              },
            ],
          },
        ]}
      />
    );

    expect(html).toContain('data-sample-column-key="lot"');
    expect(html).toContain("hidden lg:table-cell");
    expect(html).toContain("hidden sm:flex");
  });

  test("renders hidden columns declaratively from table props", () => {
    const html = renderToStaticMarkup(
      <DashboardDataTable
        caption="Danh sách KIT"
        emptyTitle="Không có KIT phù hợp"
        emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        hiddenColumnKeys={["lot"]}
        rows={[
          {
            id: "kit-1",
            cells: [
              {
                columnKey: "code",
                header: "Mã KIT",
                content: "KIT-001",
                primary: true,
              },
              {
                columnKey: "lot",
                header: "Lô",
                content: "LOT-001",
              },
            ],
          },
        ]}
      />
    );

    expect(html).toContain("KIT-001");
    expect(html).not.toContain("LOT-001");
    expect(html).not.toContain('data-sample-column-key="lot"');
  });

  test("omits mobile-only hidden columns while keeping desktop data", () => {
    const html = renderToStaticMarkup(
      <DashboardDataTable
        caption="Danh sách mẫu"
        emptyTitle="Không có mẫu phù hợp"
        emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        mobileHiddenColumnKeys={["sample"]}
        rows={[
          {
            id: "sample-1",
            cells: [
              {
                columnKey: "sample",
                header: "Mã mẫu",
                content: "T6_00012",
                primary: true,
              },
              { columnKey: "customer", header: "Khách", content: "An Phú" },
            ],
          },
        ]}
      />
    );

    expect(html).toContain("Mã mẫu");
    expect(html).toContain("T6_00012");
    expect(html).toContain('data-sample-column-key="customer"');
    expect(html).toContain('data-mobile-card-column-key="customer"');
    expect(html).not.toContain('data-mobile-card-column-key="sample"');
  });

  test("supports polished dense tables with row tone, mobile primary action, and empty action", () => {
    const emptyHtml = renderToStaticMarkup(
      <DashboardDataTable
        caption="Danh sách mẫu"
        density="compact"
        emptyAction={<a href="/dashboard/samples">Xóa bộ lọc</a>}
        emptyDescription="Thử đổi từ khóa hoặc quay lại trang đầu."
        emptyTitle="Không có mẫu phù hợp"
        rows={[]}
        tone="workspace"
      />
    );

    expect(emptyHtml).toContain("border-border/50");
    expect(emptyHtml).toContain("Xóa bộ lọc");

    const rowHtml = renderToStaticMarkup(
      <DashboardDataTable
        caption="Danh sách mẫu"
        density="compact"
        emptyDescription="Thử đổi từ khóa hoặc quay lại trang đầu."
        emptyTitle="Không có mẫu phù hợp"
        rows={[
          {
            id: "sample-1",
            rowTone: "highlight",
            mobilePrimaryAction: (
              <a href="/dashboard/samples/sample-1/results">Mở kết quả</a>
            ),
            cells: [
              {
                columnKey: "sample",
                header: "Mã mẫu",
                content: "T6_90007",
                primary: true,
              },
              { header: "Trạng thái", content: "Đã nhận" },
            ],
            actions: (
              <a href="/dashboard/samples/sample-1/results">Kết quả & ảnh</a>
            ),
          },
        ]}
        tone="workspace"
      />
    );

    expect(rowHtml).toContain("bg-card");
    expect(rowHtml).toContain("hover:bg-primary/5");
    expect(rowHtml).toContain("border-l-primary");
    expect(rowHtml).toContain("py-2.5");
    expect(rowHtml).toContain("md:hidden");
    expect(rowHtml).toContain("Mở kết quả");
  });

  test("uses a custom mobile card when a row provides one", () => {
    const rows = [
      {
        id: "sample-1",
        mobileCard: <section data-mobile-card="clinical">Card mẫu</section>,
        cells: [{ columnKey: "customer", header: "Khách", content: "An Phú" }],
      },
    ];
    const html = renderToStaticMarkup(
      <DashboardDataTable
        caption="Danh sách mẫu"
        emptyDescription="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
        emptyTitle="Không có mẫu phù hợp"
        rows={rows}
      />
    );

    expect(html).toContain('data-mobile-card="clinical"');
    expect(html).not.toContain('data-mobile-card-column-key="customer"');
  });
});
