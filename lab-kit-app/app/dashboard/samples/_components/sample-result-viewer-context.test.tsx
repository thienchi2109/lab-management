// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { SampleGridPage } from "@/lib/sample-grid/operations";

import { SampleGridPageContent } from "./sample-grid-page-content";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

const listUrl =
  "/dashboard/samples?search=T6&page=2&pageSize=25&resultGroupIds=group-1";

beforeEach(() => {
  window.history.pushState(null, "", listUrl);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Sample result context-preserving viewer", () => {
  test("opens and closes result viewer without replacing the sample list URL state", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => {
        const url = String(input);

        if (url.endsWith("/results")) {
          return jsonResponse({ ...resultEntry, canWrite: false });
        }

        if (url.endsWith("/images")) {
          return jsonResponse({ canWrite: false, images: [] });
        }

        throw new Error(`Unexpected request: ${url}`);
      });

    render(<SampleGridPageContent page={page} />);

    expect(window.location.pathname + window.location.search).toBe(listUrl);

    await user.click(screen.getByRole("link", { name: "Xem kết quả & ảnh" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeTruthy();
    });
    expect(screen.getAllByText("Kết quả mẫu T6_00012").length).toBeGreaterThan(
      0
    );
    expect(screen.getByRole("link", { name: "Thông tin mẫu" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Kết quả" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ảnh" })).toBeTruthy();
    expect(window.location.pathname + window.location.search).toBe(listUrl);

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(window.location.pathname + window.location.search).toBe(listUrl);
    expect(fetchMock).toHaveBeenCalledWith("/api/samples/sample-1/results");
    expect(fetchMock).toHaveBeenCalledWith("/api/samples/sample-1/images");
  });
});

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

const page: SampleGridPage = {
  capabilities: {
    canExport: false,
    canEnterResults: false,
    canManageImages: false,
    canUpdateMetadata: false,
  },
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: true,
    page: 2,
    pageSize: 25,
    totalCount: 26,
    totalPages: 2,
  },
  query: {
    filters: { resultGroupIds: ["group-1"] },
    limit: 25,
    offset: 25,
    page: 2,
    pageSize: 25,
    resultColumnKeys: [],
    search: "T6",
    sort: { direction: "desc", key: "receivedAt" },
  },
  filterOptions: {
    companies: [],
    customers: [],
    resultGroups: [],
    sampleTypes: [],
  },
  resultColumnOptions: [],
  resultGroupOptions: [{ id: "group-1", label: "PCR" }],
  rows: [
    {
      billingStatus: "unpaid",
      companyId: null,
      companyName: null,
      customerId: null,
      customerName: "Nguyễn Văn A",
      id: "sample-1",
      kitBatchId: null,
      kitSummary: "PCR Realtime - LOT-01",
      receivedAt: "2026-06-18T08:30:00.000Z",
      resultSummary: null,
      sampleCode: "T6_00012",
      sampleTypeId: "sample-type-1",
      sampleTypeName: "Mẫu PCR",
      status: "received",
      updatedAt: "2026-06-18T09:00:00.000Z",
    },
  ],
  selectedResultColumnKeys: [],
};

const resultEntry = {
  sample: {
    id: "sample-1",
    organizationId: "org-1",
    sampleCode: "T6_00012",
    sampleTypeId: "sample-type-1",
    sampleTypeName: "Mẫu PCR",
    receivedAt: "2026-06-18T08:30:00.000Z",
    customerName: "Nguyễn Văn A",
    companyName: null,
    status: "received",
  },
  template: { id: "template-1", name: "PCR cơ bản" },
  groups: [],
  results: [],
  conclusions: [],
};
