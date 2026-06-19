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
  filterOptions: {
    companies: [],
    customers: [],
    resultGroups: [],
    sampleTypes: [],
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    page: 1,
    pageSize: 25,
    totalCount: 1,
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
  resultColumnOptions: [],
  resultGroupOptions: [],
  rows: [
    {
      billingStatus: "unpaid",
      companyId: null,
      companyName: null,
      customerId: null,
      customerName: "Khách kiểm thử",
      id: "sample-1",
      kitBatchId: null,
      kitSummary: "Chưa gán KIT",
      receivedAt: "2026-06-06T18:30:00.000Z",
      resultSummary: null,
      sampleCode: "T6_00012",
      sampleTypeId: "type-1",
      sampleTypeName: "Swine Oral Fluid",
      status: "received",
      updatedAt: "2026-06-06T18:30:00.000Z",
    },
  ],
  selectedResultColumnKeys: [],
};

describe("SampleGridPageContent timezone hydration", () => {
  test("renders received dates in a fixed timezone for SSR/client parity", () => {
    const html = renderToStaticMarkup(<SampleGridPageContent page={page} />);

    expect(html).toContain("01:30 7/6/26");
    expect(html).not.toContain("18:30 6/6/26");
  });
});
