// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleGridPageContent } from "./sample-grid-page-content";

const firstGroupId = "11111111-1111-4111-8111-111111111111";
const secondGroupId = "22222222-2222-4222-8222-222222222222";

describe("SampleGridPageContent result group filter", () => {
  test("renders mobile-safe result group checkboxes and selected filter chips", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={createPage()} />
    );

    expect(html).toContain("Nhóm chỉ tiêu");
    expect(html).toContain('name="resultGroupIds"');
    expect(html).toContain(`value="${firstGroupId}"`);
    expect(html).toContain(`value="${secondGroupId}"`);
    expect(html).toContain("PCR");
    expect(html).toContain("Sinh hóa");
    expect(html).toContain("Đang lọc: PCR");
    expect(html).toContain("Xóa PCR");
    expect(html).toContain("flex flex-wrap");
  });

  test("preserves result group filter URL state across submit and pagination", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={createPage()} />
    );

    expect(html).toContain('name="page" value="1"');
    expect(html).toContain('name="resultColumns"');
    expect(html).toContain('type="hidden"');
    expect(html).toContain(
      "resultGroupIds=11111111-1111-4111-8111-111111111111"
    );
    expect(html).toContain("resultColumns=metric%3Ametric-1");
    expect(html).toContain("page=2");
  });
});

function createPage(): SampleGridPage {
  return {
    capabilities: {
      canExport: true,
      canEnterResults: true,
      canManageImages: true,
      canUpdateMetadata: true,
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
        resultGroupIds: [firstGroupId],
      },
      limit: 25,
      offset: 0,
      page: 1,
      pageSize: 25,
      resultColumnKeys: ["metric:metric-1"],
      search: null,
      sort: { direction: "desc", key: "receivedAt" },
    },
    filterOptions: {
      companies: [],
      customers: [],
      resultGroups: [
        { id: firstGroupId, label: "PCR" },
        { id: secondGroupId, label: "Sinh hóa" },
      ],
      sampleTypes: [],
    },
    resultColumnOptions: [{ key: "metric:metric-1", label: "PCR / WSSV" }],
    resultGroupOptions: [
      { id: firstGroupId, label: "PCR" },
      { id: secondGroupId, label: "Sinh hóa" },
    ],
    selectedResultColumnKeys: ["metric:metric-1"],
    rows: [],
  };
}
