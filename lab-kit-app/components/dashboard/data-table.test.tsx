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
});
