import { describe, expect, test, vi } from "vitest";

import type { CurrentSession } from "@/lib/auth/session";

import {
  AnalyticsUnboundedQueryError,
  getAnalyticsActor,
  listAnalyticsDataset,
  type AnalyticsActor,
  type AnalyticsReadPort,
} from "./operations";

const actor: AnalyticsActor = {
  organizationId: "org-1",
  profileId: "profile-1",
  role: "viewer",
};

describe("analytics operations", () => {
  test("uses active admin, editor, or viewer membership as the read actor", () => {
    expect(
      getAnalyticsActor(
        createSession([
          { isActive: false, organizationId: "org-0", role: "admin" },
          { isActive: true, organizationId: "org-1", role: "viewer" },
        ])
      )
    ).toEqual(actor);

    expect(
      getAnalyticsActor(
        createSession([
          { isActive: false, organizationId: "org-1", role: "viewer" },
        ])
      )
    ).toBeNull();
  });

  test("passes a bounded organization-scoped query through the read port", async () => {
    const calls: unknown[] = [];
    const port: AnalyticsReadPort = {
      async listDataset(input) {
        calls.push(input);
        return {
          rows: [
            {
              dimensionValues: { receivedDate: "2026-06-01" },
              measureValues: { sampleCount: 5 },
            },
          ],
          totals: { sampleCount: 5 },
          warnings: [],
        };
      },
    };

    const dataset = await listAnalyticsDataset(
      {
        dimensions: ["receivedDate"],
        filters: { receivedFrom: "2026-06-01", receivedTo: "2026-06-08" },
        measures: ["sampleCount"],
      },
      actor,
      port
    );

    expect(calls).toEqual([
      {
        organizationId: "org-1",
        query: expect.objectContaining({
          dimensions: ["receivedDate"],
          filters: {
            receivedFrom: "2026-06-01",
            receivedTo: "2026-06-08",
          },
          measures: ["sampleCount"],
        }),
      },
    ]);
    expect(dataset).toEqual({
      filterSummary: ["Từ 01/06/2026 đến 08/06/2026"],
      query: expect.objectContaining({
        dimensions: ["receivedDate"],
        measures: ["sampleCount"],
      }),
      rows: [
        {
          dimensionValues: { receivedDate: "2026-06-01" },
          measureValues: { sampleCount: 5 },
        },
      ],
      totals: { sampleCount: 5 },
      warnings: [],
    });
  });

  test("rejects unbounded analytics reads before calling the port", async () => {
    const port: AnalyticsReadPort = {
      listDataset: vi.fn(),
    };

    await expect(listAnalyticsDataset({}, actor, port)).rejects.toBeInstanceOf(
      AnalyticsUnboundedQueryError
    );
    expect(port.listDataset).not.toHaveBeenCalled();
  });
});

function createSession(
  memberships: CurrentSession["memberships"]
): CurrentSession {
  return {
    memberships,
    profile: {
      displayName: "Viewer",
      email: "viewer@example.com",
      id: "profile-1",
      username: "viewer",
    },
  };
}
