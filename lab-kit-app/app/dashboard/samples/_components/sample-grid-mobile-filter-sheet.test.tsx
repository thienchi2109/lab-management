// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, test } from "vitest";

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
    resultColumnKeys: ["metric:metric-1"],
    search: "T6",
    sort: { direction: "desc", key: "receivedAt" },
  },
  filterOptions: {
    companies: [{ id: "company-1", label: "Công ty Minh Phú" }],
    customers: [{ id: "customer-1", label: "Nguyễn Văn A" }],
    resultGroups: [{ id: "group-1", label: "PCR" }],
    sampleTypes: [{ id: "sample-type-1", label: "Mẫu PCR" }],
  },
  resultColumnOptions: [{ key: "metric:metric-1", label: "PCR / WSSV" }],
  resultGroupOptions: [{ id: "group-1", label: "PCR" }],
  selectedResultColumnKeys: ["metric:metric-1"],
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

describe("SampleGridPageContent mobile filters", () => {
  test("renders a search-first mobile toolbar before the sample cards", () => {
    const html = renderToStaticMarkup(
      <SampleGridPageContent page={basePage} />
    );

    expect(html).toContain('data-mobile-sample-filter-toolbar="true"');
    expect(html).toContain("md:hidden");
    expect(html).toContain("T6");
    expect(html).toContain("Bộ lọc (7)");
    expect(html).toContain("hidden md:block");
    expect(
      html.indexOf('data-mobile-sample-filter-toolbar="true"')
    ).toBeLessThan(html.indexOf('data-mobile-sample-card="clinical-grid"'));
  });

  test("opens a mobile bottom sheet with search and filter controls", async () => {
    const user = userEvent.setup();
    render(<SampleGridPageContent page={basePage} />);

    await user.click(
      screen.getByRole("button", { name: "Tìm kiếm và lọc mẫu" })
    );

    const sheet = screen.getByRole("dialog", { name: "Tìm kiếm và lọc" });
    expect(sheet).toBeTruthy();
    expect(getInputValue(sheet, "Tìm kiếm")).toBe("T6");
    expect(getInputValue(sheet, "Từ ngày nhận")).toBe("2026-06-08");
    expect(getInputValue(sheet, "Đến ngày nhận")).toBe("2026-06-18");
    expect(getInputValue(sheet, "Khách hàng")).toBe("Nguyễn Văn A");
    expect(getInputValue(sheet, "Công ty")).toBe("Công ty Minh Phú");
    expect(
      sheet.querySelector<HTMLInputElement>('input[name="sampleTypeId"]')?.value
    ).toBe("sample-type-1");
    expect(within(sheet).getByLabelText<HTMLInputElement>("PCR").checked).toBe(
      true
    );
    expect(within(sheet).getByRole("button", { name: "Áp dụng" })).toBeTruthy();
    expect(
      within(sheet).getByRole("link", { name: "Xóa lọc" }).getAttribute("href")
    ).toBe("/dashboard/samples");
  });
});

function getInputValue(container: HTMLElement, label: string) {
  const input = within(container)
    .getAllByLabelText<HTMLInputElement>(label)
    .find((element) => element.type !== "hidden");

  return input?.value;
}
