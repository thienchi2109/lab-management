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
});
