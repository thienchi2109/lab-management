import { describe, expect, test } from "vitest";

import type { AnalyticsActor } from "./operations";
import {
  getDashboardOverviewData,
  type DashboardOverviewReadPort,
} from "./overview";

const actor: AnalyticsActor = {
  organizationId: "org-1",
  profileId: "profile-1",
  role: "viewer",
};

describe("dashboard overview analytics data", () => {
  test("builds dashboard overview data from bounded analytics and recent sample reads", async () => {
    const calls: unknown[] = [];
    const port: DashboardOverviewReadPort = {
      async countKits(input) {
        calls.push({ kind: "kits", input });
        return { available: 5, total: 8 };
      },
      async listDataset(input) {
        calls.push({ kind: "analytics", input });

        if (input.query.dimensions.includes("pcrMetric")) {
          return {
            rows: [
              {
                dimensionValues: { pcrMetric: "WSSV" },
                measureValues: { positiveCount: 2, sampleCount: 10 },
              },
            ],
            totals: { positiveCount: 2, sampleCount: 10 },
            warnings: [],
          };
        }

        return {
          rows: [
            {
              dimensionValues: { receivedDate: "2026-06-08" },
              measureValues: { positiveCount: 1, sampleCount: 4 },
            },
            {
              dimensionValues: { receivedDate: "2026-06-09" },
              measureValues: { positiveCount: 2, sampleCount: 8 },
            },
          ],
          totals: {
            cleanCount: 9,
            infectedCount: 3,
            positiveCount: 3,
            sampleCount: 12,
          },
          warnings: [],
        };
      },
      async listRecentSamples(input) {
        calls.push({ kind: "recent", input });
        return [
          {
            customerName: "Công ty Thủy sản Hùng Vương",
            receivedAt: "2026-06-09T08:00:00.000Z",
            resultLabel: "PCR (NHIỄM - WSSV)",
            sampleCode: "T06_00124",
            sampleTypeName: "Tôm thẻ chân trắng",
            status: "completed",
          },
        ];
      },
    };

    const overview = await getDashboardOverviewData(actor, port, {
      now: new Date("2026-06-09T12:00:00.000Z"),
    });

    expect(calls).toEqual([
      {
        kind: "analytics",
        input: expect.objectContaining({
          organizationId: "org-1",
          query: expect.objectContaining({
            dimensions: ["receivedDate"],
            filters: {
              receivedFrom: "2026-06-03",
              receivedTo: "2026-06-09",
            },
            measures: [
              "sampleCount",
              "positiveCount",
              "cleanCount",
              "infectedCount",
            ],
          }),
        }),
      },
      {
        kind: "analytics",
        input: expect.objectContaining({
          organizationId: "org-1",
          query: expect.objectContaining({
            dimensions: ["pcrMetric"],
            filters: {
              receivedFrom: "2026-06-03",
              receivedTo: "2026-06-09",
            },
            measures: ["sampleCount", "positiveCount"],
          }),
        }),
      },
      { kind: "kits", input: { organizationId: "org-1" } },
      {
        kind: "recent",
        input: {
          limit: 5,
          organizationId: "org-1",
          receivedFrom: "2026-06-03",
          receivedTo: "2026-06-09",
        },
      },
    ]);
    expect(overview.stats).toEqual({
      activeKits: {
        detail: "KIT sẵn sàng / tổng KIT",
        title: "KIT đang hoạt động",
        value: "5 / 8",
      },
      cleanSamples: {
        detail: "75.0% tổng số mẫu xét nghiệm",
        title: "Mẫu PCR sạch",
        value: "9 mẫu",
      },
      positiveSamples: {
        detail: "25.0% tổng số mẫu xét nghiệm",
        title: "Mẫu dương tính PCR",
        value: "3 mẫu",
      },
      totalSamples: {
        detail: "7 ngày gần nhất",
        title: "Tổng số mẫu nhận",
        value: "12",
      },
    });
    expect(overview.trend).toEqual({
      dateRangeLabel: "03/06 - 09/06",
      bars: [
        {
          active: false,
          day: "08/06",
          positiveCount: 1,
          positivePercent: 12.5,
          sampleCount: 4,
          samplePercent: 50,
        },
        {
          active: true,
          day: "09/06",
          positiveCount: 2,
          positivePercent: 25,
          sampleCount: 8,
          samplePercent: 100,
        },
      ],
    });
    expect(overview.pcrMetrics).toEqual([
      {
        percent: 20,
        result: "2 mẫu (20.0%)",
        title: "WSSV",
        tone: "danger",
      },
    ]);
    expect(overview.recentSamples).toEqual([
      {
        code: "T06_00124",
        customer: "Công ty Thủy sản Hùng Vương",
        receivedAt: "09/06/2026",
        result: "PCR (NHIỄM - WSSV)",
        resultTone: "danger",
        status: "Đã hoàn tất",
        statusTone: "success",
        type: "Tôm thẻ chân trắng",
      },
    ]);
  });
});
