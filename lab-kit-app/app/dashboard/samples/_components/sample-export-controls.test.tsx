// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { SampleGridQuery } from "@/lib/sample-grid/query";

import { SampleExportControls } from "./sample-export-controls";
import { requestSampleGridExport } from "./sample-export-request";

vi.mock("./sample-export-request", () => ({
  requestSampleGridExport: vi.fn(),
  SAMPLE_GRID_EXPORT_ROW_LIMIT: 1000,
}));

const query: SampleGridQuery = {
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
};

describe("SampleExportControls", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("renders a compact download trigger before showing export actions", async () => {
    vi.mocked(requestSampleGridExport).mockResolvedValue({
      state: { status: "success", message: "Đã tải file export." },
    });

    render(<SampleExportControls canExport={true} query={query} />);

    expect(
      screen.getByRole("button", { name: "Mở export dữ liệu" })
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Export mẫu" })).toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Mở export dữ liệu" })
    );

    expect(screen.getByText("CSV")).toBeTruthy();
    expect(screen.getByText("XLSX")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "XLSX" }));
    await userEvent.click(screen.getByRole("button", { name: "Export mẫu" }));

    expect(requestSampleGridExport).toHaveBeenCalledWith({
      dataset: "samples",
      format: "xlsx",
      query,
      rowLimit: 1000,
    });
    await waitFor(() => {
      expect(screen.getByText("Đã tải file export.")).toBeTruthy();
    });
  });

  test("shows pending and error states for normalized results export", async () => {
    let resolveExport: (
      value: Awaited<ReturnType<typeof requestSampleGridExport>>
    ) => void;
    const exportPromise = new Promise<
      Awaited<ReturnType<typeof requestSampleGridExport>>
    >((resolve) => {
      resolveExport = resolve;
    });
    vi.mocked(requestSampleGridExport).mockReturnValue(exportPromise);

    render(<SampleExportControls canExport={true} query={query} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Mở export dữ liệu" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Export kết quả" })
    );

    expect(screen.getByText("Đang tạo file export...")).toBeTruthy();
    resolveExport!({
      state: {
        status: "error",
        message:
          "File vượt giới hạn dòng. Vui lòng thu hẹp bộ lọc rồi thử lại.",
      },
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "File vượt giới hạn dòng. Vui lòng thu hẹp bộ lọc rồi thử lại."
        )
      ).toBeTruthy();
    });
    expect(requestSampleGridExport).toHaveBeenCalledWith({
      dataset: "results-normalized",
      format: "csv",
      query,
      rowLimit: 1000,
    });
  });

  test("recovers from unexpected export request failures", async () => {
    vi.mocked(requestSampleGridExport).mockRejectedValue(
      new Error("unexpected export failure")
    );

    render(<SampleExportControls canExport={true} query={query} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Mở export dữ liệu" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Export mẫu" }));

    await waitFor(() => {
      expect(
        screen.getByText("Không thể export dữ liệu. Vui lòng thử lại.")
      ).toBeTruthy();
    });
    expect(screen.getByRole("button", { name: "Export mẫu" })).toHaveProperty(
      "disabled",
      false
    );
  });

  test("disables export actions when the current UI state has no export permission", () => {
    render(<SampleExportControls canExport={false} query={query} />);

    expect(
      screen.getByRole("button", { name: "Export dữ liệu chưa khả dụng" })
    ).toHaveProperty("disabled", true);
    expect(
      screen.queryByText("Bạn không có quyền export dữ liệu từ tài khoản này.")
    ).toBeNull();
    expect(requestSampleGridExport).not.toHaveBeenCalled();
  });
});
