import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleGridPageContent } from "./sample-grid-page-content";

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
    search: "T6",
    sort: { direction: "desc", key: "receivedAt" },
  },
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
});
