import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import { createSupabaseReportKitAnalyticsPort } from "@/lib/analytics/server-report-kit";
import type { ReportKitAnalyticsReadPort } from "@/lib/analytics/report-kit";

import { POST } from "./route";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/analytics/server-report-kit", () => ({
  createSupabaseReportKitAnalyticsPort: vi.fn(),
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

describe("/api/analytics/report-kit", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("returns one bounded report kit chart dataset for the requested chartId", async () => {
    const port: ReportKitAnalyticsReadPort = {
      async listReportRows(input) {
        expect(input.organizationId).toBe("org-1");
        expect(input.query).toEqual(
          expect.objectContaining({
            charts: ["kitQuantityBySampleType"],
            filters: {
              receivedFrom: "2026-06-05",
              receivedTo: "2026-06-08",
            },
          })
        );

        return [
          {
            companyId: "company-1",
            customerId: "customer-1",
            customerName: "Khách hàng A",
            generalPcrConclusion: "SẠCH",
            kitBatchId: "kit-batch-1",
            kitTypeName: "KIT A",
            sampleId: "sample-1",
            sampleTypeName: "Nước ao",
          },
        ];
      },
    };
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(createSupabaseReportKitAnalyticsPort).mockReturnValue(port);

    const response = await POST(
      createRequest({
        charts: ["kitQuantityBySampleType"],
        filters: {
          receivedFrom: "2026-06-05",
          receivedTo: "2026-06-08",
        },
      })
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        charts: ["kitQuantityBySampleType"],
        datasets: expect.objectContaining({
          kitQuantityBySampleType: expect.objectContaining({
            segments: [
              {
                key: "Nước ao",
                label: "Nước ao",
                metrics: { totalKitQuantity: 1 },
              },
            ],
          }),
        }),
      })
    );
  });
});

function createRequest(body: unknown) {
  return new NextRequest("http://test.local/api/analytics/report-kit", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
