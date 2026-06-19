// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleGridPageContent } from "./sample-grid-page-content";

const page: SampleGridPage = {
  capabilities: {
    canExport: false,
    canEnterResults: false,
    canManageImages: false,
    canUpdateMetadata: false,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    page: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 1,
  },
  query: {
    filters: {},
    limit: 25,
    offset: 0,
    page: 1,
    pageSize: 25,
    resultColumnKeys: [],
    search: null,
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
  rows: [],
};

describe("SampleGridPageContent filter accordion", () => {
  test("collapses filters by default when no filters are active", () => {
    const html = renderToStaticMarkup(<SampleGridPageContent page={page} />);

    expect(html).toContain("<details");
    expect(html).not.toContain('open=""');
    expect(html).toContain("Bộ lọc");
    expect(html).not.toContain("Bộ lọc (");
  });

  test("opens filters and shows count when URL filters are active", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent
        page={{
          ...page,
          query: {
            ...page.query,
            filters: {
              companyId: "company-1",
              customerId: "customer-1",
              receivedFrom: "2026-06-08",
              receivedTo: "2026-06-18",
              resultGroupIds: ["group-1"],
              sampleTypeId: "sample-type-1",
            },
            search: "T6",
          },
        }}
      />
    );

    expect(html).toContain("<details");
    expect(html).toContain('open=""');
    expect(html).toContain("Bộ lọc (7)");
    expect(html).toContain("Đang áp dụng 7 bộ lọc");
  });
});
