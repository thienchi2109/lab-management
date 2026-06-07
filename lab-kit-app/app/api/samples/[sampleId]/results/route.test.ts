import { NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { hasAnyRole } from "@/lib/auth/permissions";
import { getCurrentSession, type CurrentSession } from "@/lib/auth/session";
import {
  getSampleResultEntry,
  saveSampleResults,
} from "@/lib/sample-results/operations";
import { createSupabaseSampleResultsPort } from "@/lib/sample-results/server";

import { GET, PUT } from "./route";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  getCurrentSession: vi.fn(),
}));

vi.mock("@/lib/auth/permissions", () => ({
  hasAnyRole: vi.fn(),
}));

vi.mock("@/lib/sample-results/operations", () => ({
  getSampleResultEntry: vi.fn(),
  saveSampleResults: vi.fn(),
}));

vi.mock("@/lib/sample-results/server", () => ({
  createSupabaseSampleResultsPort: vi.fn(),
}));

const editorSession: CurrentSession = {
  profile: {
    id: "user-editor",
    displayName: "Editor",
    email: "editor@example.com",
    username: "editor",
  },
  memberships: [{ organizationId: "org-1", role: "editor", isActive: true }],
};

const viewerSession: CurrentSession = {
  ...editorSession,
  memberships: [{ organizationId: "org-1", role: "viewer", isActive: true }],
};

const params = Promise.resolve({ sampleId: "sample-1" });

describe("/api/samples/[sampleId]/results", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createSupabaseSampleResultsPort).mockReturnValue(
      {} as ReturnType<typeof createSupabaseSampleResultsPort>
    );
  });

  test("GET returns sample result entry for active viewers", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(hasAnyRole).mockReturnValue(true);
    vi.mocked(getSampleResultEntry).mockResolvedValue({
      sample: {
        id: "sample-1",
        sampleCode: "T6_00012",
        sampleTypeId: "type-1",
        organizationId: "org-1",
      },
      template: { id: "template-1", name: "PCR cơ bản" },
      groups: [],
      results: [],
      conclusions: [],
    });

    const response = await GET(new NextRequest("http://test.local"), {
      params,
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      sample: { id: "sample-1" },
      canWrite: false,
    });
    expect(getSampleResultEntry).toHaveBeenCalledWith(
      "sample-1",
      {
        profileId: "user-editor",
        organizationId: "org-1",
        canWrite: false,
      },
      expect.anything()
    );
  });

  test("PUT rejects viewers before saving", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(viewerSession);
    vi.mocked(hasAnyRole).mockImplementation((_memberships, roles) =>
      roles.includes("viewer")
    );

    const response = await PUT(
      new NextRequest("http://test.local", {
        method: "PUT",
        body: JSON.stringify({ results: [], groupConclusions: [] }),
      }),
      { params }
    );

    expect(response.status).toBe(403);
    expect(saveSampleResults).not.toHaveBeenCalled();
  });

  test("PUT lets editors save results and revalidates sample surfaces", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(editorSession);
    vi.mocked(hasAnyRole).mockReturnValue(true);
    vi.mocked(saveSampleResults).mockResolvedValue(undefined);

    const response = await PUT(
      new NextRequest("http://test.local", {
        method: "PUT",
        body: JSON.stringify({
          results: [{ metricId: "metric-1", value: 7.8 }],
          groupConclusions: [
            { groupId: "group-1", conclusionText: "Đạt yêu cầu" },
          ],
        }),
      }),
      { params }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      status: "success",
      message: "Đã lưu kết quả xét nghiệm.",
    });
    expect(saveSampleResults).toHaveBeenCalledWith(
      "sample-1",
      {
        results: [{ metricId: "metric-1", value: 7.8 }],
        groupConclusions: [
          { groupId: "group-1", conclusionText: "Đạt yêu cầu" },
        ],
      },
      {
        profileId: "user-editor",
        organizationId: "org-1",
        canWrite: true,
      },
      expect.anything()
    );
  });
});
