import { describe, expect, test } from "vitest";

import {
  listSampleGridPage,
  type SampleGridActor,
  type SampleGridPort,
} from "./operations";

const actor: SampleGridActor = {
  organizationId: "org-1",
  profileId: "profile-1",
  role: "editor",
};

describe("sample grid operations", () => {
  test("queries only one tenant-scoped page through the port", async () => {
    const calls: unknown[] = [];
    const port: SampleGridPort = {
      async listSamples(input) {
        calls.push(input);
        return {
          rows: [],
          totalCount: 42,
        };
      },
    };

    const page = await listSampleGridPage(
      { page: "2", pageSize: "10", status: "received" },
      actor,
      port
    );

    expect(page).toEqual({
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: true,
        page: 2,
        pageSize: 10,
        totalCount: 42,
        totalPages: 5,
      },
      capabilities: {
        canEnterResults: true,
        canManageImages: true,
        canUpdateMetadata: true,
      },
      query: expect.objectContaining({
        limit: 10,
        offset: 10,
      }),
      rows: [],
    });
    expect(calls).toEqual([
      {
        organizationId: "org-1",
        query: expect.objectContaining({
          filters: { status: "received" },
          limit: 10,
          offset: 10,
        }),
      },
    ]);
  });

  test("marks viewer grid capabilities as read-only", async () => {
    const port: SampleGridPort = {
      async listSamples() {
        return {
          rows: [],
          totalCount: 0,
        };
      },
    };

    const page = await listSampleGridPage(
      {},
      { ...actor, role: "viewer" },
      port
    );

    expect(page.capabilities).toEqual({
      canEnterResults: false,
      canManageImages: false,
      canUpdateMetadata: false,
    });
  });
});
