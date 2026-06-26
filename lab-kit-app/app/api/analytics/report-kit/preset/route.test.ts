import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import {
  createSupabaseReportKitPresetPort,
  type ReportKitFilterPresetPort,
} from "@/lib/analytics/server-report-kit-presets";

import { GET, PUT } from "./route";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/analytics/server-report-kit-presets", () => ({
  createSupabaseReportKitPresetPort: vi.fn(),
}));

const adminSession = createSession("admin");
const viewerSession = createSession("viewer");

describe("/api/analytics/report-kit/preset", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("lets Admin save and read the organization preset", async () => {
    const port = createPort();
    vi.mocked(getCurrentSession).mockResolvedValue(adminSession);
    vi.mocked(createSupabaseReportKitPresetPort).mockReturnValue(port);

    const saveResponse = await PUT(
      createRequest({
        charts: {
          kitQuantityBySampleType: {
            filters: { receivedFrom: "2026-06-01", sampleTypeId: "pl" },
          },
        },
      })
    );
    const readResponse = await GET();

    expect(saveResponse.status).toBe(200);
    expect(port.savePreset).toHaveBeenCalledWith({
      actor: {
        organizationId: "org-1",
        profileId: "profile-admin",
        role: "admin",
      },
      config: {
        charts: {
          kitQuantityBySampleType: {
            filters: { receivedFrom: "2026-06-01", sampleTypeId: "pl" },
          },
        },
      },
    });
    expect(readResponse.status).toBe(200);
    await expect(readResponse.json()).resolves.toEqual({
      config: {
        charts: {
          kitQuantityBySampleType: {
            filters: { receivedFrom: "2026-06-01", sampleTypeId: "pl" },
          },
        },
      },
      updatedAt: "2026-06-20T00:00:00.000Z",
      updatedBy: "profile-admin",
    });
  });

  test("lets Viewer read the preset without write permission", async () => {
    const port = createPort();
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(createSupabaseReportKitPresetPort).mockReturnValue(port);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(port.readPreset).toHaveBeenCalledWith("org-1");
    expect(port.savePreset).not.toHaveBeenCalled();
  });

  test("denies Viewer preset writes before touching storage", async () => {
    const port = createPort();
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(createSupabaseReportKitPresetPort).mockReturnValue(port);

    const response = await PUT(
      createRequest({
        charts: {
          kitQuantityBySampleType: {
            filters: { receivedFrom: "2026-06-01" },
          },
        },
      })
    );

    expect(response.status).toBe(403);
    expect(port.savePreset).not.toHaveBeenCalled();
  });

  test("rejects invalid chart or filter payloads before touching storage", async () => {
    const port = createPort();
    vi.mocked(getCurrentSession).mockResolvedValue(adminSession);
    vi.mocked(createSupabaseReportKitPresetPort).mockReturnValue(port);

    const response = await PUT(
      createRequest({
        charts: {
          rawSql: { filters: { customerName: "Không được lưu" } },
        },
      })
    );

    expect(response.status).toBe(400);
    expect(port.savePreset).not.toHaveBeenCalled();
  });
});

function createPort(): ReportKitFilterPresetPort {
  return {
    readPreset: vi.fn(async () => ({
      config: {
        charts: {
          kitQuantityBySampleType: {
            filters: { receivedFrom: "2026-06-01", sampleTypeId: "pl" },
          },
        },
      },
      updatedAt: "2026-06-20T00:00:00.000Z",
      updatedBy: "profile-admin",
    })),
    savePreset: vi.fn(async () => ({
      config: {
        charts: {
          kitQuantityBySampleType: {
            filters: { receivedFrom: "2026-06-01", sampleTypeId: "pl" },
          },
        },
      },
      updatedAt: "2026-06-20T00:00:00.000Z",
      updatedBy: "profile-admin",
    })),
  };
}

function createRequest(body: unknown) {
  return new NextRequest("http://test.local/api/analytics/report-kit/preset", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

function createSession(role: "admin" | "viewer"): CurrentSession {
  return {
    profile: {
      id: `profile-${role}`,
      displayName: role,
      email: `${role}@example.com`,
      username: role,
    },
    memberships: [{ organizationId: "org-1", role, isActive: true }],
  };
}
