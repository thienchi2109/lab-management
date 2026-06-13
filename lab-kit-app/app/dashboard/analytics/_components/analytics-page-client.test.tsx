// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { AnalyticsPageClient } from "./analytics-page-client";

const initialDataset = {
  filterSummary: ["Từ 01/06/2026 đến 08/06/2026"],
  rows: [
    {
      dimensionValues: { receivedDate: "2026-06-01" },
      measureValues: { sampleCount: 3, positiveCount: 1 },
    },
  ],
  totals: { sampleCount: 3, positiveCount: 1 },
  warnings: [],
};

type AnalyticsFetchResponse = {
  json: () => Promise<unknown>;
  ok: boolean;
};

describe("AnalyticsPageClient", () => {
  beforeAll(() => {
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.setPointerCapture) {
      Element.prototype.setPointerCapture = () => undefined;
    }
    if (!Element.prototype.releasePointerCapture) {
      Element.prototype.releasePointerCapture = () => undefined;
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => undefined;
    }
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("renders filter summary, pivot chart, and responsive table from initial data", () => {
    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Báo cáo thống kê & Pivot" })
    ).toBeTruthy();
    expect(screen.getByText("Từ 01/06/2026 đến 08/06/2026")).toBeTruthy();
    expect(screen.getAllByText("2026-06-01").length).toBeGreaterThan(0);
    expect(screen.getAllByText("3 mẫu").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Biểu đồ pivot analytics")).toBeTruthy();
    expect(screen.getAllByText("Bảng pivot analytics").length).toBeGreaterThan(
      0
    );
  });

  test("renders the polished command-bar filter, applied summary, totals, and read-only status", () => {
    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    expect(
      screen.getByRole("form", { name: "Bộ lọc analytics dạng command bar" })
    ).toBeTruthy();
    const accessStatus = screen.getByRole("status", {
      name: "Quyền truy cập analytics",
    });
    expect(accessStatus.textContent?.includes("Chỉ đọc")).toBe(true);
    expect(screen.getByText("Đang áp dụng")).toBeTruthy();
    const totals = within(
      screen.getByRole("region", { name: "Tổng quan analytics" })
    );
    expect(totals.getByText("Tổng mẫu")).toBeTruthy();
    expect(totals.getByText("3 mẫu")).toBeTruthy();
    expect(totals.getByText("Dương tính")).toBeTruthy();
    expect(totals.getByText("1 mẫu")).toBeTruthy();
    expect(totals.getByText("Tỷ lệ")).toBeTruthy();
    expect(totals.getByText("33.3%")).toBeTruthy();
  });

  test("does not render a minimum-width chart bar for zero sample rows", () => {
    const zeroSampleDataset = {
      filterSummary: ["Từ 01/06/2026 đến 08/06/2026"],
      rows: [
        {
          dimensionValues: { receivedDate: "2026-06-01" },
          measureValues: { sampleCount: 0, positiveCount: 0 },
        },
      ],
      totals: { sampleCount: 0, positiveCount: 0 },
      warnings: [],
    };

    const { container } = render(
      <AnalyticsPageClient
        initialDataset={zeroSampleDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    const chart = screen.getByLabelText("Biểu đồ pivot analytics");
    const chartBars = chart.querySelectorAll<HTMLDivElement>(".bg-primary");

    expect(screen.getAllByText("0 mẫu").length).toBeGreaterThan(0);
    expect(chartBars).toHaveLength(1);
    expect(chartBars[0]?.style.width).toBe("0%");
    expect(container.querySelector('[style*="width: 4%"]')).toBeNull();
  });

  test("uses polished analytics copy instead of MVP labels for chart and table", () => {
    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "Phân bố pivot" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Chi tiết pivot" })
    ).toBeTruthy();
    expect(screen.queryByText("Pivot/chart MVP")).toBeNull();
  });

  test("submits bounded filters to the pivot API and renders the returned dataset", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        filterSummary: ["Từ 02/06/2026 đến 09/06/2026", "Trạng thái: Hoàn tất"],
        rows: [
          {
            dimensionValues: { pcrMetric: "DIV1" },
            measureValues: { sampleCount: 5, positiveCount: 2 },
          },
        ],
        totals: { sampleCount: 5, positiveCount: 2 },
        warnings: [],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    fireEvent.change(screen.getByLabelText("Từ ngày"), {
      target: { value: "2026-06-02" },
    });
    fireEvent.change(screen.getByLabelText("Đến ngày"), {
      target: { value: "2026-06-09" },
    });
    await user.click(screen.getByRole("combobox", { name: "Trạng thái" }));
    await user.click(await screen.findByRole("option", { name: "Hoàn tất" }));
    await user.click(screen.getByRole("combobox", { name: "Chiều pivot" }));
    await user.click(
      await screen.findByRole("option", { name: "Chỉ tiêu PCR" })
    );
    await user.click(screen.getByRole("button", { name: "Áp dụng" }));

    await waitFor(() =>
      expect(screen.getAllByText("DIV1").length).toBeGreaterThan(0)
    );
    expect(screen.getAllByText("5 mẫu").length).toBeGreaterThan(0);
    expect(screen.getByText("Trạng thái: Hoàn tất")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/analytics/pivot",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          dimensions: ["pcrMetric"],
          measures: ["sampleCount", "positiveCount"],
          filters: {
            receivedFrom: "2026-06-02",
            receivedTo: "2026-06-09",
            status: "completed",
          },
        }),
      })
    );
  });

  test("keeps the newest dataset when an older request resolves later", async () => {
    const requests: Array<
      ReturnType<typeof createDeferred<AnalyticsFetchResponse>>
    > = [];
    const fetchMock = vi.fn(() => {
      const request = createDeferred<AnalyticsFetchResponse>();
      requests.push(request);

      return request.promise;
    });
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );
    const form = container.querySelector("form");

    expect(form).toBeTruthy();

    fireEvent.submit(form as HTMLFormElement);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Đến ngày"), {
      target: { value: "2026-06-09" },
    });
    fireEvent.submit(form as HTMLFormElement);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(async () => {
      requests[1]?.resolve(
        createDatasetResponse("Từ 01/06/2026 đến 09/06/2026", "2026-06-09", 9)
      );
    });

    await waitFor(() =>
      expect(screen.getAllByText("9 mẫu").length).toBeGreaterThan(0)
    );

    await act(async () => {
      requests[0]?.resolve(
        createDatasetResponse("Từ 01/06/2026 đến 08/06/2026", "2026-06-08", 4)
      );
    });

    await waitFor(() =>
      expect(screen.getAllByText("9 mẫu").length).toBeGreaterThan(0)
    );
    expect(screen.queryByText("4 mẫu")).toBeNull();
    expect(screen.getByText("Từ 01/06/2026 đến 09/06/2026")).toBeTruthy();
  });

  test("renders an API error without dropping the last good dataset", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: "Không thể tải dữ liệu pivot analytics.",
        }),
      })
    );

    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));

    await waitFor(() =>
      expect(
        screen.getByText("Không thể tải dữ liệu pivot analytics.")
      ).toBeTruthy()
    );
    expect(screen.getAllByText("2026-06-01").length).toBeGreaterThan(0);
  });

  test("rejects malformed successful API responses without dropping the last good dataset", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          rows: [],
          totals: {},
          warnings: [],
        }),
      })
    );

    render(
      <AnalyticsPageClient
        initialDataset={initialDataset}
        initialFilters={{
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));

    await waitFor(() =>
      expect(
        screen.getByText("Không thể tải dữ liệu pivot analytics.")
      ).toBeTruthy()
    );
    expect(screen.getAllByText("2026-06-01").length).toBeGreaterThan(0);
  });
});

function createDatasetResponse(
  filterSummary: string,
  receivedDate: string,
  sampleCount: number
): AnalyticsFetchResponse {
  return {
    ok: true,
    json: async () => ({
      filterSummary: [filterSummary],
      rows: [
        {
          dimensionValues: { receivedDate },
          measureValues: { positiveCount: 1, sampleCount },
        },
      ],
      totals: { positiveCount: 1, sampleCount },
      warnings: [],
    }),
  };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}
