import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { createSupabaseExportAuditPort } from "@/lib/export/audit";
import { resetExportRateLimitForTests } from "@/lib/export/rate-limit";
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

const adminSession: CurrentSession = {
  ...editorSession,
  memberships: [{ isActive: true, organizationId: "org-1", role: "admin" }],
};

const viewerSession: CurrentSession = {
  ...editorSession,
  memberships: [{ isActive: true, organizationId: "org-1", role: "viewer" }],
};

describe("POST /api/export/results-normalized", () => {
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

  test("rejects unauthenticated users before reading results", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(request({ fields: ["sampleCode", "value"] }));

    expect(response.status).toBe(403);
    expect(port.listSamples).not.toHaveBeenCalled();
    expect(port.listSampleResultSummaries).not.toHaveBeenCalled();
    expect(insertAuditEvent).not.toHaveBeenCalled();
  });

  test("rejects invalid payloads and client-provided tenant or grant data", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(
      request({
        auditPayload: { raw: true },
        attachments: ["cloudinary://image"],
        dataset: "results-normalized",
        fields: ["sampleCode", "value", "fileUrl"],
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
    expect(insertAuditEvent).not.toHaveBeenCalled();
  });

  test.each([
    ["admin", adminSession],
    ["editor", editorSession],
  ])(
    "returns a CSV download scoped to the %s session tenant",
    async (_, session) => {
      vi.mocked(getCurrentSession).mockResolvedValue(session);
      const port = createPort([createSampleRow()]);
      vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

      const response = await POST(
        request({
          fields: ["sampleCode", "groupName", "metricName", "value", "kqChung"],
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
        "attachment; filename=\"ket-qua-chuan-hoa-2026-06-08.csv\"; filename*=UTF-8''ket-qua-chuan-hoa-2026-06-08.csv"
      );
      expect(await response.text()).toBe(
        [
          "Mã mẫu,Nhóm kết quả,Chỉ tiêu,Giá trị,KQ_CHUNG",
          "T6_00012,Hóa lý,pH,7.8,Đạt",
        ].join("\r\n")
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
      expect(port.listSampleResultSummaries).toHaveBeenCalledWith({
        organizationId: "org-1",
        sampleIds: ["sample-1"],
      });
      expect(insertAuditEvent).toHaveBeenCalledWith({
        action: "export.results_normalized.succeeded",
        actorId: session.profile.id,
        entityId: null,
        entityTable: "sample_results",
        eventPayload: {
          dataset: "results-normalized",
          fieldCount: 5,
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
    }
  );

  test("rejects viewers when no trusted export grant exists", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    const port = createPort([]);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(port);

    const response = await POST(request({ fields: ["sampleCode", "value"] }));

    expect(response.status).toBe(403);
    expect(port.listSamples).not.toHaveBeenCalled();
    expect(insertAuditEvent).not.toHaveBeenCalled();
  });

  test("returns a readable XLSX download", async () => {
    vi.useRealTimers();
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    vi.mocked(createSupabaseSampleGridPort).mockReturnValue(
      createPort([createSampleRow()])
    );

    const response = await POST(
      request({
        fields: ["sampleCode", "metricName", "metricUnit", "value"],
        format: "xlsx",
      })
    );
    const body = Buffer.from(await response.arrayBuffer());

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(response.headers.get("content-disposition")).toMatch(
      /^attachment; filename="ket-qua-chuan-hoa-\d{4}-\d{2}-\d{2}\.xlsx"; filename\*=UTF-8''ket-qua-chuan-hoa-\d{4}-\d{2}-\d{2}\.xlsx$/
    );
    await expect(readWorksheetRows(body, "Kết quả chuẩn hóa")).resolves.toEqual(
      [
        ["Mã mẫu", "Chỉ tiêu", "Đơn vị", "Giá trị"],
        ["T6_00012", "pH", "", "7.8"],
      ]
    );
  });
});

function request(body: Record<string, unknown>) {
  return new NextRequest("http://test.local/api/export/results-normalized", {
    body: JSON.stringify({
      dataset: "results-normalized",
      format: "csv",
      ...body,
    }),
    method: "POST",
  });
}

function createPort(rows: SampleGridRow[]): SampleGridPort {
  return {
    listSamples: vi.fn(async () => ({ rows, totalCount: rows.length })),
    listSampleResultSummaries: vi.fn(async () => ({
      "sample-1": {
        groups: [
          {
            code: "CHEM",
            enteredMetrics: 1,
            id: "group-1",
            kqChung: "Đạt",
            metrics: [
              {
                code: "PH",
                id: "metric-1",
                name: "pH",
                unit: null,
                value: 7.8,
              },
            ],
            name: "Hóa lý",
            totalMetrics: 1,
          },
        ],
      },
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
