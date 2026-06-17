import { describe, expect, test, vi } from "vitest";

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
        canExport: true,
        canEnterResults: true,
        canManageImages: true,
        canUpdateMetadata: true,
      },
      query: expect.objectContaining({
        limit: 10,
        offset: 10,
      }),
      filterOptions: {
        companies: [],
        customers: [],
        resultGroups: [],
        sampleTypes: [],
      },
      resultColumnOptions: [],
      resultGroupOptions: [],
      selectedResultColumnKeys: [],
      rows: [],
    });
    expect(calls).toEqual([
      {
        organizationId: "org-1",
        query: expect.objectContaining({
          filters: expect.objectContaining({ status: "received" }),
          limit: 10,
          offset: 10,
        }),
      },
    ]);
  });

  test("loads sample filter options without status or billing filters", async () => {
    const optionCalls: unknown[] = [];
    const port: SampleGridPort = {
      async listSamples() {
        return {
          rows: [],
          totalCount: 0,
        };
      },
      async listFilterOptions(input) {
        optionCalls.push(input);
        return {
          companies: [{ id: "company-1", label: "Công ty A" }],
          customers: [{ id: "customer-1", label: "Khách hàng A" }],
          resultGroups: [{ id: "group-1", label: "PCR" }],
          sampleTypes: [{ id: "type-1", label: "Mẫu PCR" }],
        };
      },
    };

    const page = await listSampleGridPage({}, actor, port);

    expect(optionCalls).toEqual([{ organizationId: "org-1" }]);
    expect(page.filterOptions).toEqual({
      companies: [{ id: "company-1", label: "Công ty A" }],
      customers: [{ id: "customer-1", label: "Khách hàng A" }],
      resultGroups: [{ id: "group-1", label: "PCR" }],
      sampleTypes: [{ id: "type-1", label: "Mẫu PCR" }],
    });
    expect(page.filterOptions).not.toHaveProperty("status");
    expect(page.filterOptions).not.toHaveProperty("billingStatus");
    expect(page.resultGroupOptions).toEqual([{ id: "group-1", label: "PCR" }]);
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
      canExport: false,
      canEnterResults: false,
      canManageImages: false,
      canUpdateMetadata: false,
    });
  });

  test("loads result summaries only for current page samples and whitelists selected result columns", async () => {
    const calls: unknown[] = [];
    const port: SampleGridPort = {
      async listSamples() {
        return {
          rows: [
            createSampleRow("sample-1", "T6_00012"),
            createSampleRow("sample-2", "T6_00013"),
          ],
          totalCount: 2,
        };
      },
      async listSampleResultSummaries(input) {
        calls.push(input);
        return {
          "sample-1": createResultSummary("group-1", "metric-1", "NHIỄM"),
          "sample-2": createResultSummary("group-1", "metric-1", "SẠCH"),
        };
      },
      async listResultColumnOptions() {
        return [
          { key: "group:group-1", label: "PCR" },
          { key: "metric:metric-1", label: "PCR / WSSV" },
        ];
      },
    };

    const page = await listSampleGridPage(
      {
        resultColumns: "metric:metric-1,group:group-1,metric:missing",
      },
      actor,
      port
    );

    expect(calls).toEqual([
      {
        organizationId: "org-1",
        sampleIds: ["sample-1", "sample-2"],
      },
    ]);
    expect(page.selectedResultColumnKeys).toEqual([
      "metric:metric-1",
      "group:group-1",
    ]);
    expect(page.resultColumnOptions).toEqual([
      { key: "group:group-1", label: "PCR" },
      { key: "metric:metric-1", label: "PCR / WSSV" },
    ]);
    expect(page.rows[0].resultSummary).toEqual(
      createResultSummary("group-1", "metric-1", "NHIỄM")
    );
  });

  test("keeps result column options stable when page result summaries differ", async () => {
    const optionCalls: unknown[] = [];
    const port = {
      async listSamples(input) {
        return {
          rows: [
            createSampleRow(
              input.query.page === 1 ? "sample-1" : "sample-2",
              input.query.page === 1 ? "T6_00012" : "T6_00013"
            ),
          ],
          totalCount: 2,
        };
      },
      async listSampleResultSummaries(input) {
        return {
          [input.sampleIds[0] ?? "sample-1"]:
            input.sampleIds[0] === "sample-1"
              ? createResultSummary("group-1", "metric-1", "NHIỄM")
              : createResultSummary("group-2", "metric-2", "SẠCH"),
        };
      },
      async listResultColumnOptions(input) {
        optionCalls.push(input);
        return [
          { key: "group:group-1", label: "PCR" },
          { key: "metric:metric-1", label: "PCR / WSSV" },
          { key: "group:group-2", label: "Vi sinh" },
          { key: "metric:metric-2", label: "Vi sinh / Vibrio" },
        ];
      },
    } satisfies SampleGridPort & {
      listResultColumnOptions(input: {
        organizationId: string;
        sampleTypeId?: string;
      }): Promise<{ key: string; label: string }[]>;
    };

    const [firstPage, secondPage] = await Promise.all([
      listSampleGridPage(
        { page: "1", resultColumns: "metric:metric-2" },
        actor,
        port
      ),
      listSampleGridPage(
        { page: "2", resultColumns: "metric:metric-1" },
        actor,
        port
      ),
    ]);

    expect(firstPage.resultColumnOptions).toEqual(
      secondPage.resultColumnOptions
    );
    expect(firstPage.resultColumnOptions).toEqual([
      { key: "group:group-1", label: "PCR" },
      { key: "metric:metric-1", label: "PCR / WSSV" },
      { key: "group:group-2", label: "Vi sinh" },
      { key: "metric:metric-2", label: "Vi sinh / Vibrio" },
    ]);
    expect(firstPage.selectedResultColumnKeys).toEqual(["metric:metric-2"]);
    expect(secondPage.selectedResultColumnKeys).toEqual(["metric:metric-1"]);
    expect(optionCalls).toEqual([
      { organizationId: "org-1", sampleTypeId: undefined },
      { organizationId: "org-1", sampleTypeId: undefined },
    ]);
  });

  test("keeps the sample page usable when result summary loading fails", async () => {
    const error = new Error("summary backend unavailable");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const port: SampleGridPort = {
      async listSamples() {
        return {
          rows: [createSampleRow("sample-1", "T6_00012")],
          totalCount: 1,
        };
      },
      async listSampleResultSummaries() {
        throw error;
      },
    };

    try {
      const page = await listSampleGridPage(
        { resultColumns: "metric:metric-1" },
        actor,
        port
      );

      expect(page.rows).toEqual([
        expect.objectContaining({ id: "sample-1", resultSummary: null }),
      ]);
      expect(page.resultColumnOptions).toEqual([]);
      expect(page.selectedResultColumnKeys).toEqual([]);
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to fetch sample result summaries:",
        error
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});

function createSampleRow(id: string, sampleCode: string) {
  return {
    billingStatus: "unpaid",
    companyId: null,
    companyName: null,
    customerId: null,
    customerName: null,
    id,
    kitBatchId: null,
    kitSummary: "Chưa gán KIT",
    receivedAt: "2026-06-06T08:30:00.000Z",
    sampleCode,
    sampleTypeId: "sample-type-1",
    sampleTypeName: "Mẫu PCR",
    status: "received",
    resultSummary: null,
    updatedAt: "2026-06-06T09:00:00.000Z",
  };
}

function createResultSummary(groupId: string, metricId: string, value: string) {
  return {
    groups: [
      {
        id: groupId,
        code: "PCR",
        name: "PCR",
        kqChung: value,
        enteredMetrics: 1,
        totalMetrics: 1,
        metrics: [
          {
            id: metricId,
            code: "WSSV",
            name: "WSSV",
            value,
          },
        ],
      },
    ],
  };
}
