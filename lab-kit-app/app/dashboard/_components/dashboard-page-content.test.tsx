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
  test("constrains the overview to the shared dashboard page width", () => {
    const html = renderToStaticMarkup(
      <DashboardPageContent overview={overview} />
    );

    expect(html).toContain("mx-auto");
    expect(html).toContain("w-full");
    expect(html).toContain("max-w-7xl");
  });

  test("renders dashboard overview cards, trend, metrics, and recent samples from data props", () => {
    const html = renderToStaticMarkup(
      <DashboardPageContent overview={overview} />
    );

    expect(html).not.toContain("Nguyễn Văn A");
    expect(html).not.toContain("👋");
    expect(html).not.toContain("Xuất báo cáo ngày");
    expect(html).toContain("Tổng số mẫu nhận");
    expect(html).toContain(">2<");
    expect(html).toContain("03/06 - 09/06");
    expect(html).toContain("DIV1");
    expect(html).toContain("T06_00999");
    expect(html).toContain("Công ty Kiểm thử");
    expect(html).toContain("md:hidden");
    expect(html).toContain('data-sample-column-key="code"');
    expect(html).not.toContain("T06_00124");
  });

  test("renders composed low-data states without fake sample rows", () => {
    const emptyOverview: DashboardOverviewData = {
      ...overview,
      pcrMetrics: [],
      recentSamples: [],
      trend: {
        bars: [],
        dateRangeLabel: "03/06 - 09/06",
      },
    };

    const html = renderToStaticMarkup(
      <DashboardPageContent overview={emptyOverview} />
    );

    expect(html).toContain("Chưa có dữ liệu xu hướng");
    expect(html).toContain("Chưa có dữ liệu PCR");
    expect(html).toContain("Chưa có mẫu gần đây");
    expect(html).not.toContain("LAB-2023");
    expect(html).not.toContain("AQ-2023");
  });

  test("limits recent sample mobile cards without trimming desktop rows", () => {
    const overviewWithManySamples: DashboardOverviewData = {
      ...overview,
      recentSamples: [
        ...overview.recentSamples,
        {
          ...overview.recentSamples[0],
          code: "T06_00002",
        },
        {
          ...overview.recentSamples[0],
          code: "T06_00003",
        },
      ],
    };

    const html = renderToStaticMarkup(
      <DashboardPageContent
        overview={overviewWithManySamples}
        recentSampleMobileLimit={2}
      />
    );

    expect(html.match(/data-mobile-card-column-key="code"/g)).toHaveLength(2);
    expect(html.match(/data-sample-column-key="code"/g)).toHaveLength(4);
  });
});
