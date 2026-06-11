import { describe, expect, test, vi } from "vitest";

import type { SampleGridQuery } from "@/lib/sample-grid/query";

import {
  requestSampleGridExport,
  SAMPLE_GRID_EXPORT_ROW_LIMIT,
} from "./sample-export-request";

const gridQuery: SampleGridQuery = {
  filters: { billingStatus: "unpaid", status: "received" },
  limit: 25,
  offset: 50,
  page: 3,
  pageSize: 25,
  resultColumnKeys: ["metric:metric-1"],
  search: "T6_00012",
  sort: { direction: "asc", key: "sampleCode" },
};

type ExportFetch = typeof fetch;

describe("requestSampleGridExport", () => {
  test("posts sample export payload with current filters and explicit row limit", async () => {
    const fetcher = vi.fn<ExportFetch>(async () => {
      return response({ body: "csv", filename: "mau-xet-nghiem.csv" });
    });
    const clickDownload = vi.fn();

    const result = await requestSampleGridExport(
      { dataset: "samples", format: "csv", query: gridQuery },
      { clickDownload, fetcher }
    );

    expect(fetcher).toHaveBeenCalledWith("/api/export/samples", {
      body: JSON.stringify({
        dataset: "samples",
        fields: [
          "sampleCode",
          "customerName",
          "sampleType",
          "kitBatch",
          "status",
          "billingStatus",
          "receivedAt",
          "updatedAt",
        ],
        filters: { billingStatus: "unpaid", status: "received" },
        format: "csv",
        rowLimit: SAMPLE_GRID_EXPORT_ROW_LIMIT,
        search: "T6_00012",
        sort: { direction: "asc", key: "sampleCode" },
      }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const [, init] = fetcher.mock.calls[0];
    expect(init).toBeDefined();
    expect(JSON.parse(String(init?.body))).not.toHaveProperty("pageSize");
    expect(clickDownload).toHaveBeenCalledWith(
      expect.any(Blob),
      "mau-xet-nghiem.csv"
    );
    expect(result.state).toEqual({
      status: "success",
      message: "Đã tải file export.",
    });
  });

  test("posts normalized results export to the results endpoint", async () => {
    const fetcher = vi.fn<ExportFetch>(async () => {
      return response({ body: "csv", filename: "ket-qua-chuan-hoa.csv" });
    });

    await requestSampleGridExport(
      { dataset: "results-normalized", format: "xlsx", query: gridQuery },
      { clickDownload: vi.fn(), fetcher }
    );

    expect(fetcher).toHaveBeenCalledWith(
      "/api/export/results-normalized",
      expect.objectContaining({
        body: expect.stringContaining('"dataset":"results-normalized"'),
      })
    );
    const [, init] = fetcher.mock.calls[0];
    expect(init).toBeDefined();
    expect(JSON.parse(String(init?.body))).toMatchObject({
      fields: [
        "sampleCode",
        "customerName",
        "sampleType",
        "status",
        "receivedAt",
        "groupCode",
        "groupName",
        "metricCode",
        "metricName",
        "metricUnit",
        "value",
        "kqChung",
      ],
      format: "xlsx",
      rowLimit: SAMPLE_GRID_EXPORT_ROW_LIMIT,
    });
  });

  test("omits empty search instead of sending grid null search to export parser", async () => {
    const fetcher = vi.fn<ExportFetch>(async () => {
      return response({ body: "csv", filename: "mau-xet-nghiem.csv" });
    });

    await requestSampleGridExport(
      {
        dataset: "samples",
        format: "csv",
        query: { ...gridQuery, search: null },
      },
      { clickDownload: vi.fn(), fetcher }
    );

    const [, init] = fetcher.mock.calls[0];
    expect(init).toBeDefined();
    expect(JSON.parse(String(init?.body))).not.toHaveProperty("search");
  });

  test("normalizes permission and row-limit errors for the UI", async () => {
    await expect(
      requestSampleGridExport(
        { dataset: "samples", format: "csv", query: gridQuery },
        {
          clickDownload: vi.fn(),
          fetcher: vi.fn(async () =>
            response({
              body: JSON.stringify({
                error: "export_forbidden",
                message: "Bạn không có quyền export dữ liệu mẫu.",
              }),
              ok: false,
              status: 403,
            })
          ),
        }
      )
    ).resolves.toMatchObject({
      state: {
        status: "error",
        message: "Bạn không có quyền export dữ liệu mẫu.",
      },
    });

    await expect(
      requestSampleGridExport(
        { dataset: "samples", format: "csv", query: gridQuery, rowLimit: 5001 },
        {
          clickDownload: vi.fn(),
          fetcher: vi.fn(async () =>
            response({
              body: JSON.stringify({
                error: "export_row_limit_exceeded",
                message: "Vượt giới hạn số dòng export.",
              }),
              ok: false,
              status: 400,
            })
          ),
        }
      )
    ).resolves.toMatchObject({
      state: {
        status: "error",
        message:
          "File vượt giới hạn dòng. Vui lòng thu hẹp bộ lọc rồi thử lại.",
      },
    });
  });
});

function response({
  body,
  filename,
  ok = true,
  status = 200,
}: {
  body: BodyInit;
  filename?: string;
  ok?: boolean;
  status?: number;
}) {
  const headers = new Headers();

  if (filename) {
    headers.set("content-disposition", `attachment; filename="${filename}"`);
  }

  return new Response(body, { headers, status, statusText: ok ? "OK" : "ERR" });
}
