import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleGridPageContent } from "./sample-grid-page-content";

const tableSectionSource = readFileSync(
  join(
    process.cwd(),
    "app/dashboard/samples/_components/sample-grid-table-section.tsx"
  ),
  "utf8"
);

const basePage: SampleGridPage = {
  capabilities: {
    canEnterResults: true,
    canManageImages: true,
    canUpdateMetadata: false,
  },
  pageInfo: {
    hasNextPage: true,
    hasPreviousPage: false,
    page: 1,
    pageSize: 25,
    totalCount: 26,
    totalPages: 2,
  },
  query: {
    filters: { billingStatus: "unpaid", status: "received" },
    limit: 25,
    offset: 0,
    page: 1,
    pageSize: 25,
    resultColumnKeys: [],
    search: "T6",
    sort: { direction: "desc", key: "receivedAt" },
  },
  resultColumnOptions: [],
  selectedResultColumnKeys: [],
  rows: [
    {
      billingStatus: "unpaid",
      companyId: "company-1",
      companyName: "Công ty Minh Phú",
      customerId: "customer-1",
      customerName: "Nguyễn Văn A",
      id: "sample-1",
      kitBatchId: "kit-batch-1",
      kitSummary: "PCR Realtime - LOT-01",
      receivedAt: "2026-06-06T08:30:00.000Z",
      sampleCode: "T6_00012",
      sampleTypeId: "sample-type-1",
      sampleTypeName: "Mẫu PCR",
      status: "received",
      resultSummary: null,
      updatedAt: "2026-06-06T09:00:00.000Z",
    },
  ],
};

describe("SampleGridPageContent", () => {
  test("renders the sample grid MVP through the shared dashboard table", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).toContain("Bảng mẫu xét nghiệm");
    expect(html).toContain("Tìm kiếm");
    expect(html).toContain("T6_00012");
    expect(html).toContain("Công ty Minh Phú");
    expect(html).toContain("PCR Realtime - LOT-01");
    expect(html).toContain("<table");
    expect(html).toContain("md:hidden");
    expect(html).toContain("/dashboard/samples/sample-1/results");
    expect(html).toContain("Kết quả &amp; ảnh");
    expect(html).toContain("Trang tiếp");
  });

  test("keeps URL state in controls and resets page on new filtering", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).toContain('name="search"');
    expect(html).toContain('value="T6"');
    expect(html).toContain('name="page" value="1"');
    expect(html).toContain('href="/dashboard/samples?search=T6');
    expect(html).toContain("billingStatus=unpaid");
    expect(html).toContain("status=received");
    expect(html).toContain("page=2");
  });

  test("associates the search label with its input control", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).toContain('for="sample-grid-search"');
    expect(html).toContain('id="sample-grid-search"');
    expect(html).toContain('name="search"');
  });

  test("renders viewer rows with read-only actions", () => {
    const viewerPage: SampleGridPage = {
      ...basePage,
      capabilities: {
        canEnterResults: false,
        canManageImages: false,
        canUpdateMetadata: false,
      },
    };
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={viewerPage} />
    );

    expect(html).toContain("Xem kết quả &amp; ảnh");
    expect(html).not.toContain(">Kết quả &amp; ảnh<");
  });

  test("marks lower-priority columns for responsive hiding and preferences", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).toContain("Tùy chọn cột");
    expect(html).toContain('data-sample-column-key="kit"');
    expect(html).toContain("hidden xl:table-cell");
    expect(html).toContain("hidden sm:flex");
  });

  test("renders result group detail and desktop selected result columns without mobile matrix cells", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent
        page={{
          ...basePage,
          query: {
            ...basePage.query,
            resultColumnKeys: ["metric:metric-1", "group:group-1"],
          },
          resultColumnOptions: [
            { key: "group:group-1", label: "PCR" },
            { key: "metric:metric-1", label: "PCR / WSSV" },
          ],
          selectedResultColumnKeys: ["metric:metric-1", "group:group-1"],
          rows: [
            {
              ...basePage.rows[0],
              resultSummary: {
                groups: [
                  {
                    id: "group-1",
                    code: "PCR",
                    name: "PCR",
                    kqChung: "NHIỄM",
                    enteredMetrics: 1,
                    totalMetrics: 1,
                    metrics: [
                      {
                        id: "metric-1",
                        code: "WSSV",
                        name: "WSSV",
                        value: "Dương tính",
                      },
                    ],
                  },
                ],
              },
            },
          ],
        }}
      />
    );

    expect(html).toContain("Nhóm kết quả");
    expect(html).toContain("PCR: 1/1 chỉ tiêu");
    expect(html).toContain('data-sample-column-key="metric:metric-1"');
    expect(html).toContain('data-sample-column-key="group:group-1"');
    expect(html).toContain("Dương tính");
    expect(html).toContain("hidden lg:table-cell");
    expect(html).toContain("hidden md:flex");
  });

  test("builds result column label lookup once per page render", () => {
    const toTableRowBody = tableSectionSource.slice(
      tableSectionSource.indexOf("function toTableRow"),
      tableSectionSource.indexOf("function ResultColumnModeControls")
    );

    expect(toTableRowBody).not.toContain("resultColumnLabelByKey = new Map");
    expect(tableSectionSource).toContain(
      "const resultColumnLabelByKey = new Map"
    );
  });
});
