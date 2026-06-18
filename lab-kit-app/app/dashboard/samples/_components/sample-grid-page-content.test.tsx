// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";

import {
  sampleMetadataEditRequestedEvent,
  sampleMetadataViewRequestedEvent,
} from "@/components/layout/sample-create-action";
import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleGridPageContent } from "./sample-grid-page-content";

const basePage: SampleGridPage = {
  capabilities: {
    canExport: true,
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
    filters: {
      companyId: "company-1",
      companyName: "Công ty Minh Phú",
      customerId: "customer-1",
      customerName: "Nguyễn Văn A",
      receivedFrom: "2026-06-08",
      receivedTo: "2026-06-18",
      resultGroupIds: ["group-1"],
      sampleTypeId: "sample-type-1",
    },
    limit: 25,
    offset: 0,
    page: 1,
    pageSize: 25,
    resultColumnKeys: [],
    search: "T6",
    sort: { direction: "desc", key: "receivedAt" },
  },
  filterOptions: {
    companies: [{ id: "company-1", label: "Công ty Minh Phú" }],
    customers: [{ id: "customer-1", label: "Nguyễn Văn A" }],
    resultGroups: [{ id: "group-1", label: "PCR" }],
    sampleTypes: [{ id: "sample-type-1", label: "Mẫu PCR" }],
  },
  resultColumnOptions: [],
  resultGroupOptions: [{ id: "group-1", label: "PCR" }],
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

afterEach(() => {
  cleanup();
});

describe("SampleGridPageContent", () => {
  test("renders the sample grid MVP through the shared dashboard table", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).toContain("DANH SÁCH MẪU");
    expect(html).toContain(
      "Tra cứu mẫu theo ngày, loại mẫu, khách hàng, tên công ty và nhóm chỉ tiêu"
    );
    expect(html).toContain("Tìm kiếm");
    expect(html).toContain("T6_00012");
    expect(html).toContain("Công ty Minh Phú");
    expect(html).toContain("PCR Realtime - LOT-01");
    expect(html).toContain("<table");
    expect(html).toContain("md:hidden");
    expect(html).toContain("/dashboard/samples/sample-1/results");
    expect(html).toContain("Kết quả &amp; ảnh");
    expect(html).toContain("Trang tiếp");
    expect(html).toContain("Export dữ liệu");
    expect(html).toContain("Export mẫu");
    expect(html).toContain("Export kết quả");
  });

  test("renders the customer-requested filter controls without legacy filters", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).toContain('name="search"');
    expect(html).toContain('value="T6"');
    expect(html).toContain('name="receivedFrom"');
    expect(html).toContain('value="2026-06-08"');
    expect(html).toContain('name="receivedTo"');
    expect(html).toContain('value="2026-06-18"');
    expect(html).toContain('name="sampleTypeId"');
    expect(html).toContain('value="sample-type-1"');
    expect(html).toContain('name="customerId"');
    expect(html).toContain('name="customerName"');
    expect(html).toContain('list="sample-grid-customer-options"');
    expect(html).toContain('name="companyId"');
    expect(html).toContain('name="companyName"');
    expect(html).toContain('list="sample-grid-company-options"');
    expect(html).toContain('name="resultGroupIds"');
    expect(html).toContain('name="page" value="1"');
    expect(html).toContain('href="/dashboard/samples?search=T6');
    expect(html).toContain("receivedFrom=2026-06-08");
    expect(html).toContain("sampleTypeId=sample-type-1");
    expect(html).toContain("customerId=customer-1");
    expect(html).toContain("companyId=company-1");
    expect(html).toContain("resultGroupIds=group-1");
    expect(html).not.toContain('name="status"');
    expect(html).not.toContain('name="billingStatus"');
    expect(html).not.toContain('name="sort"');
    expect(html).not.toContain('name="dir"');
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
        canExport: false,
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

  test("renders read and update sample metadata actions for editors", () => {
    const editorPage: SampleGridPage = {
      ...basePage,
      capabilities: {
        ...basePage.capabilities,
        canUpdateMetadata: true,
      },
    };
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={editorPage} />
    );

    expect(html).toContain("Xem chi tiết");
    expect(html).toContain("Cập nhật");
  });

  test("dispatches sample metadata side sheet events from row actions", async () => {
    const user = userEvent.setup();
    const editorPage: SampleGridPage = {
      ...basePage,
      capabilities: {
        ...basePage.capabilities,
        canUpdateMetadata: true,
      },
    };
    const viewEvents: CustomEvent[] = [];
    const editEvents: CustomEvent[] = [];
    window.addEventListener(sampleMetadataViewRequestedEvent, (event) => {
      viewEvents.push(event as CustomEvent);
    });
    window.addEventListener(sampleMetadataEditRequestedEvent, (event) => {
      editEvents.push(event as CustomEvent);
    });

    render(<SampleGridPageContent page={editorPage} />);

    await user.click(screen.getByRole("button", { name: "Xem chi tiết" }));
    await user.click(screen.getByRole("button", { name: "Cập nhật" }));

    await waitFor(() => {
      expect(viewEvents).toHaveLength(1);
      expect(editEvents).toHaveLength(1);
    });
    expect(viewEvents[0]?.detail).toMatchObject({
      sampleId: "sample-1",
      sample: { id: "sample-1", sampleCode: "T6_00012" },
    });
    expect(editEvents[0]?.detail).toMatchObject({
      sampleId: "sample-1",
      sample: { id: "sample-1", sampleCode: "T6_00012" },
    });
  });

  test("hides the sample metadata update action from viewers", () => {
    const viewerPage: SampleGridPage = {
      ...basePage,
      capabilities: {
        canExport: false,
        canEnterResults: false,
        canManageImages: false,
        canUpdateMetadata: false,
      },
    };
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={viewerPage} />
    );

    expect(html).toContain("Xem chi tiết");
    expect(html).not.toContain("Cập nhật");
  });

  test("uses the polished workspace table variant for dense samples scanning", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).toContain("bg-card");
    expect(html).toContain("hover:bg-primary/5");
    expect(html).toContain("py-2.5");
    expect(html).toContain("Mở kết quả");
  });

  test("renders a reset action in the polished empty table state", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={{ ...basePage, rows: [] }} />
    );

    expect(html).toContain("Không có mẫu phù hợp");
    expect(html).toContain("Xóa bộ lọc");
    expect(html).toContain('href="/dashboard/samples"');
  });

  test("renders compact mobile sample cards without desktop-only controls", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).not.toContain("Tùy chọn cột");
    expect(html).not.toContain("Cột kết quả desktop");
    expect(html).toContain('data-sample-column-key="kit"');
    expect(html).toContain("hidden xl:table-cell");
    expect(html).not.toContain('data-mobile-card-column-key="sample"');
    expect(html).toContain('data-mobile-card-column-key="receivedAt"');
    expect(html).toContain('data-mobile-card-column-key="sampleType"');
    expect(html).toContain('data-mobile-card-column-key="company"');
    expect(html).not.toContain(
      'hidden sm:flex" data-mobile-card-column-key="company"'
    );
    expect(html).toContain('data-mobile-card-column-key="resultDetail"');
    expect(html).toContain("min-h-11");
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
    expect(html).toContain("Kết Quả Chung: NHIỄM");
    expect(html).not.toContain("KQ_CHUNG");
    expect(html).toContain('data-sample-column-key="metric:metric-1"');
    expect(html).toContain('data-sample-column-key="group:group-1"');
    expect(html).toContain("Dương tính");
    expect(html).toContain("hidden lg:table-cell");
    expect(html).toContain("hidden md:flex");
  });
});
