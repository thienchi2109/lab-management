import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import type { DashboardOverviewData } from "@/lib/analytics/overview";

import { DashboardPageContent } from "./dashboard-page-content";

const overview: DashboardOverviewData = {
  pcrMetrics: [
    {
      percent: 50,
      result: "1 mẫu (50.0%)",
      title: "DIV1",
      tone: "warning",
    },
  ],
  recentSamples: [
    {
      code: "T06_00999",
      customer: "Công ty Kiểm thử",
      receivedAt: "09/06/2026",
      result: "PCR (NHIỄM - DIV1)",
      resultTone: "danger",
      status: "Đã hoàn tất",
      statusTone: "success",
      type: "Mẫu kiểm thử",
    },
  ],
  stats: {
    activeKits: {
      detail: "KIT sẵn sàng / tổng KIT",
      title: "KIT đang hoạt động",
      value: "2 / 3",
    },
    cleanSamples: {
      detail: "50.0% tổng số mẫu xét nghiệm",
      title: "Mẫu PCR sạch",
      value: "1 mẫu",
    },
    positiveSamples: {
      detail: "50.0% tổng số mẫu xét nghiệm",
      title: "Mẫu dương tính PCR",
      value: "1 mẫu",
    },
    totalSamples: {
      detail: "7 ngày gần nhất",
      title: "Tổng số mẫu nhận",
      value: "2",
    },
  },
  trend: {
    bars: [
      {
        active: true,
        day: "09/06",
        positiveCount: 1,
        positivePercent: 50,
        sampleCount: 2,
        samplePercent: 100,
      },
    ],
    dateRangeLabel: "03/06 - 09/06",
  },
};

describe("DashboardPageContent", () => {
  test("renders dashboard overview cards, trend, metrics, and recent samples from data props", () => {
    const html = renderToStaticMarkup(
      <DashboardPageContent overview={overview} />
    );

    expect(html).toContain("Tổng số mẫu nhận");
    expect(html).toContain(">2<");
    expect(html).toContain("03/06 - 09/06");
    expect(html).toContain("DIV1");
    expect(html).toContain("T06_00999");
    expect(html).toContain("Công ty Kiểm thử");
    expect(html).not.toContain("T06_00124");
  });
});
