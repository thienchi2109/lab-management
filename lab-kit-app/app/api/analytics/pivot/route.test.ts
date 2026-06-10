import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { createSupabaseDashboardOverviewPort } from "@/lib/analytics/server";
import type { AnalyticsReadPort } from "@/lib/analytics/operations";

import { POST } from "./route";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/analytics/server", () => ({
  createSupabaseDashboardOverviewPort: vi.fn(),
}));

const viewerSession: CurrentSession = {
  profile: {
    id: "profile-viewer",
    displayName: "Viewer",
    email: "viewer@example.com",
    username: "viewer",
  },
  memberships: [{ organizationId: "org-1", role: "viewer", isActive: true }],
};

const inactiveSession: CurrentSession = {
  ...viewerSession,
  memberships: [{ organizationId: "org-1", role: "viewer", isActive: false }],
};

describe("/api/analytics/pivot", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("rejects unauthenticated users", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null);

    const response = await POST(createRequest({}));

    expect(response.status).toBe(401);
    expect(createSupabaseDashboardOverviewPort).not.toHaveBeenCalled();
  });

  test("rejects users without an active analytics role", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(inactiveSession);

    const response = await POST(createRequest({}));

    expect(response.status).toBe(403);
    expect(createSupabaseDashboardOverviewPort).not.toHaveBeenCalled();
  });

  test("rejects structurally invalid pivot payloads", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);

    const response = await POST(
      createRequest({
        dimensions: ["rawSql"],
        filters: { receivedFrom: "2026-06-01" },
        measures: ["sampleCount"],
      })
    );

    expect(response.status).toBe(400);
    expect(createSupabaseDashboardOverviewPort).not.toHaveBeenCalled();
  });

  test("rejects unbounded pivot queries before reading data", async () => {
    const listDataset = vi.fn();
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(createSupabaseDashboardOverviewPort).mockReturnValue({
      listDataset,
    } as unknown as ReturnType<typeof createSupabaseDashboardOverviewPort>);

    const response = await POST(createRequest({}));

    expect(response.status).toBe(422);
    expect(listDataset).not.toHaveBeenCalled();
  });

  test("returns normalized pivot rows for bounded viewer queries", async () => {
    const port: AnalyticsReadPort = {
      async listDataset(input) {
        expect(input.organizationId).toBe("org-1");
        expect(input.query).toEqual(
          expect.objectContaining({
            dimensions: ["receivedDate"],
            filters: {
              receivedFrom: "2026-06-01",
              receivedTo: "2026-06-08",
            },
            measures: ["sampleCount"],
          })
        );

        return {
          rows: [
            {
              dimensionValues: { receivedDate: "2026-06-01" },
              measureValues: { sampleCount: 3 },
            },
          ],
          totals: { sampleCount: 3 },
          warnings: [],
        };
      },
    };
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(createSupabaseDashboardOverviewPort).mockReturnValue(
      port as ReturnType<typeof createSupabaseDashboardOverviewPort>
    );

    const response = await POST(
      createRequest({
        dimensions: ["receivedDate"],
        filters: {
          receivedFrom: "2026-06-01",
          receivedTo: "2026-06-08",
        },
        measures: ["sampleCount"],
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      rows: [
        {
          dimensionValues: { receivedDate: "2026-06-01" },
          measureValues: { sampleCount: 3 },
        },
      ],
      totals: { sampleCount: 3 },
      filterSummary: ["Từ 01/06/2026 đến 08/06/2026"],
      warnings: [],
    });
  });
});

function createRequest(body: unknown) {
  return new NextRequest("http://test.local/api/analytics/pivot", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
