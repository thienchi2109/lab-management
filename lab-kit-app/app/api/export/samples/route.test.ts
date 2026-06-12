import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { createSupabaseExportAuditPort } from "@/lib/export/audit";
import { resetExportRateLimitForTests } from "@/lib/export/rate-limit";
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

vi.mock("@/lib/export/audit", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/export/audit")>(
      "@/lib/export/audit"
    );

  return {
    ...actual,
    createSupabaseExportAuditPort: vi.fn(),
  };
});

vi.mock("@/lib/sample-grid/server", () => ({
  createSupabaseSampleGridPort: vi.fn(),
}));

const insertAuditEvent = vi.fn();

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
    resetExportRateLimitForTests();
    delete process.env.EXPORT_RATE_LIMIT_MAX_PER_MINUTE;
    vi.mocked(createSupabaseExportAuditPort).mockReturnValue({
      insertAuditEvent,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.EXPORT_RATE_LIMIT_MAX_PER_MINUTE;
    resetExportRateLimitForTests();
  });

  test("rejects unauthenticated users before reading samples", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(request({ fields: ["sampleCode"] }));

    expect(response.status).toBe(403);
    expect(port.listSamples).not.toHaveBeenCalled();
    expect(insertAuditEvent).not.toHaveBeenCalled();
  });

  test("rejects invalid export payloads through the US-011A parser", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        fields: ["sampleCode", "raw_payload"],
        rawSql: "select * from samples",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "export_query_invalid",
    });
    expect(port.listSamples).not.toHaveBeenCalled();
    expect(insertAuditEvent).not.toHaveBeenCalled();
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
        fields: ["sampleCode", "customerName", "status"],
        filters: { status: "received" },
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
      "attachment; filename=\"mau-xet-nghiem-2026-06-08.csv\"; filename*=UTF-8''mau-xet-nghiem-2026-06-08.csv"
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
    expect(insertAuditEvent).toHaveBeenCalledWith({
      action: "export.samples.succeeded",
      actorId: "profile-1",
      entityId: null,
      entityTable: "samples",
      eventPayload: {
        dataset: "samples",
        fieldCount: 3,
        filterSummary: {
          filterKeys: ["status"],
          hasSearch: true,
          sort: { direction: "asc", key: "sampleCode" },
        },
        format: "csv",
        result: "succeeded",
        rowCount: 1,
        rowLimit: 25,
      },
      organizationId: "org-1",
    });
  });

  test("audits and rejects matching rows above the requested rowLimit", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([createSampleRow()], { totalCount: 2 });
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        fields: ["sampleCode"],
        rowLimit: 1,
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "export_row_limit_exceeded",
      message:
        "Số bản ghi khớp bộ lọc vượt giới hạn export. Vui lòng thu hẹp bộ lọc và thử lại.",
    });
    expect(insertAuditEvent).toHaveBeenCalledWith({
      action: "export.samples.failed",
      actorId: "profile-1",
      entityId: null,
      entityTable: "samples",
      eventPayload: {
        dataset: "samples",
        errorCode: "export_row_limit_exceeded",
        fieldCount: 1,
        filterSummary: {
          filterKeys: [],
          hasSearch: false,
          sort: { direction: "desc", key: "receivedAt" },
        },
        format: "csv",
        matchedRowCount: 2,
        result: "failed",
        rowLimit: 1,
      },
      organizationId: "org-1",
    });
  });

  test("keeps the original export error when failure audit write fails", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    insertAuditEvent.mockRejectedValueOnce(new Error("Audit offline"));
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(
      createPort([createSampleRow()], { totalCount: 2 })
    );
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const response = await POST(
      request({ fields: ["sampleCode"], rowLimit: 1 })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "export_row_limit_exceeded",
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Không thể ghi audit failure export.",
      expect.objectContaining({
        auditError: expect.any(Error),
        exportError: expect.any(Error),
      })
    );
    consoleError.mockRestore();
  });

  test("rate limits repeated export attempts before reading samples", async () => {
    process.env.EXPORT_RATE_LIMIT_MAX_PER_MINUTE = "1";
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([createSampleRow()]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const body = {
      fields: ["sampleCode"],
    };
    expect((await POST(request(body))).status).toBe(200);
    vi.mocked(port.listSamples).mockClear();

    const response = await POST(request(body));

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({
      error: "export_rate_limited",
      message: "Bạn đang export quá nhanh. Vui lòng chờ một phút rồi thử lại.",
    });
    expect(port.listSamples).not.toHaveBeenCalled();
    expect(insertAuditEvent).toHaveBeenLastCalledWith(
      expect.objectContaining({
        action: "export.samples.failed",
        eventPayload: expect.objectContaining({
          errorCode: "export_rate_limited",
          result: "failed",
        }),
      })
    );
  });

  test("rejects viewers when no trusted export grant exists", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        fields: ["sampleCode"],
      })
    );

    expect(response.status).toBe(403);
    expect(port.listSamples).not.toHaveBeenCalled();
    expect(insertAuditEvent).not.toHaveBeenCalled();
  });

  test("rejects client-provided tenant or grant payloads", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        fields: ["sampleCode"],
        grants: [{ isActive: true, organizationId: "org-1" }],
        organizationId: "evil-org",
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "export_query_invalid",
    });
    expect(port.listSamples).not.toHaveBeenCalled();
    expect(insertAuditEvent).not.toHaveBeenCalled();
  });
});

function request(body: Record<string, unknown>) {
  return new NextRequest("http://test.local/api/export/samples", {
    body: JSON.stringify({ dataset: "samples", format: "csv", ...body }),
    method: "POST",
  });
}

function createPort(
  rows: SampleGridRow[],
  options: { totalCount?: number } = {}
): SampleGridPort {
  return {
    listSamples: vi.fn(async () => ({
      rows,
      totalCount: options.totalCount ?? rows.length,
    })),
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
