import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { readWorksheetRows } from "@/lib/export/test-workbook";
import type {
  SampleGridPort,
  SampleGridRow,
} from "@/lib/sample-grid/operations";
import { createSupabaseSampleGridPort } from "@/lib/sample-grid/server";

import { POST } from "./route";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/sample-grid/server", () => ({
  createSupabaseSampleGridPort: vi.fn(),
}));

const editorSession: CurrentSession = {
  memberships: [{ isActive: true, organizationId: "org-1", role: "editor" }],
  profile: {
    displayName: "Editor",
    email: "editor@example.com",
    id: "profile-1",
    username: "editor",
  },
};

const viewerSession: CurrentSession = {
  ...editorSession,
  memberships: [{ isActive: true, organizationId: "org-1", role: "viewer" }],
};

describe("POST /api/export/samples", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("rejects unauthenticated users before reading samples", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(request({ fields: ["sampleCode"] }));

    expect(response.status).toBe(403);
    expect(port.listSamples).not.toHaveBeenCalled();
  });

  test("rejects invalid export payloads through the US-011A parser", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        dataset: "samples",
        fields: ["sampleCode", "raw_payload"],
        format: "csv",
        rawSql: "select * from samples",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "export_query_invalid",
    });
    expect(port.listSamples).not.toHaveBeenCalled();
  });

  test("returns a CSV download scoped to the session tenant", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([
      createSampleRow({
        customerName: 'Công ty "A"',
        sampleCode: "T6_00012",
      }),
    ]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        dataset: "samples",
        fields: ["sampleCode", "customerName", "status"],
        filters: { status: "received" },
        format: "csv",
        rowLimit: 25,
        search: "  T6_00012  ",
        sort: { direction: "asc", key: "sampleCode" },
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "text/csv; charset=utf-8"
    );
    expect(response.headers.get("content-disposition")).toBe(
      'attachment; filename="mau-xet-nghiem-2026-06-08.csv"'
    );
    expect(port.listSamples).toHaveBeenCalledWith({
      organizationId: "org-1",
      query: {
        filters: { status: "received" },
        limit: 25,
        offset: 0,
        page: 1,
        pageSize: 25,
        resultColumnKeys: [],
        search: "T6_00012",
        sort: { direction: "asc", key: "sampleCode" },
      },
    });
    await expect(response.text()).resolves.toBe(
      ["Mã mẫu,Khách hàng,Trạng thái", 'T6_00012,"Công ty ""A""",Đã nhận'].join(
        "\r\n"
      )
    );
  });

  test("rejects viewers when no trusted export grant exists", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        dataset: "samples",
        fields: ["sampleCode"],
        format: "csv",
      })
    );

    expect(response.status).toBe(403);
    expect(port.listSamples).not.toHaveBeenCalled();
  });

  test("rejects client-provided tenant or grant payloads", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        dataset: "samples",
        fields: ["sampleCode"],
        format: "csv",
        grants: [{ isActive: true, organizationId: "org-1" }],
        organizationId: "evil-org",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "export_query_invalid",
    });
    expect(port.listSamples).not.toHaveBeenCalled();
  });

  test("returns an XLSX download when requested", async () => {
    vi.useRealTimers();
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([
      createSampleRow({
        customerName: "Công ty B",
        sampleCode: "T6_00015",
        status: "completed",
      }),
    ]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        dataset: "samples",
        fields: ["sampleCode"],
        format: "xlsx",
      })
    );
    const body = Buffer.from(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(response.headers.get("content-disposition")).toMatch(
      /^attachment; filename="mau-xet-nghiem-\d{4}-\d{2}-\d{2}\.xlsx"$/
    );
    await expect(readWorksheetRows(body, "Mẫu xét nghiệm")).resolves.toEqual([
      ["Mã mẫu"],
      ["T6_00015"],
    ]);
  });
});

function request(body: Record<string, unknown>) {
  return new NextRequest("http://test.local/api/export/samples", {
    body: JSON.stringify({ dataset: "samples", format: "csv", ...body }),
    method: "POST",
  });
}

function createPort(rows: SampleGridRow[]): SampleGridPort {
  return {
    listSamples: vi.fn(async () => ({ rows, totalCount: rows.length })),
  };
}

function createSampleRow(
  overrides: Partial<SampleGridRow> = {}
): SampleGridRow {
  return {
    billingStatus: "unpaid",
    companyId: null,
    companyName: null,
    customerId: null,
    customerName: "Khách hàng A",
    id: "sample-1",
    kitBatchId: null,
    kitSummary: "Chưa gán KIT",
    receivedAt: "2026-06-08T08:00:00.000Z",
    resultSummary: null,
    sampleCode: "T6_00012",
    sampleTypeId: "sample-type-1",
    sampleTypeName: "Mẫu PCR",
    status: "received",
    updatedAt: "2026-06-08T09:00:00.000Z",
    ...overrides,
  };
}
