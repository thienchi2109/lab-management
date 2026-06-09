import {
  listAnalyticsDataset,
  type AnalyticsActor,
  type AnalyticsAggregateRow,
  type AnalyticsReadPort,
  type AnalyticsReadResult,
} from "./operations";

const CLEAN_RESULT_PATTERN = /SẠCH/i;
const POSITIVE_RESULT_PATTERN = /NHIỄM/i;

/** Dòng mẫu gần đây do dashboard overview read port trả về. */
export type DashboardOverviewRecentSampleRow = {
  customerName: string | null;
  receivedAt: string;
  resultLabel: string | null;
  sampleCode: string;
  sampleTypeName: string;
  status: string;
};

/** Cổng đọc dữ liệu dashboard overview đã scope theo tổ chức. */
export type DashboardOverviewReadPort = AnalyticsReadPort & {
  countKits(input: {
    organizationId: string;
  }): Promise<{ available: number; total: number }>;
  listRecentSamples(input: {
    limit: number;
    organizationId: string;
    receivedFrom: string;
    receivedTo: string;
  }): Promise<DashboardOverviewRecentSampleRow[]>;
};

/** View model card tổng quan của dashboard. */
export type DashboardOverviewStat = {
  detail: string;
  title: string;
  value: string;
};

/** Thanh xu hướng nhận mẫu trong dashboard. */
export type DashboardOverviewTrendBar = {
  active: boolean;
  day: string;
  positiveCount: number;
  positivePercent: number;
  sampleCount: number;
  samplePercent: number;
};

/** Metric PCR hiển thị trong dashboard overview. */
export type DashboardOverviewPcrMetric = {
  percent: number;
  result: string;
  title: string;
  tone: "danger" | "muted" | "warning";
};

/** Dòng mẫu gần đây đã format cho dashboard overview. */
export type DashboardOverviewRecentSample = {
  code: string;
  customer: string;
  receivedAt: string;
  result: string;
  resultTone: "danger" | "muted" | "success";
  status: string;
  statusTone: "muted" | "success" | "warning";
  type: string;
};

/** View model tổng quan dashboard từ dữ liệu thật đã bounded. */
export type DashboardOverviewData = {
  pcrMetrics: DashboardOverviewPcrMetric[];
  recentSamples: DashboardOverviewRecentSample[];
  stats: {
    activeKits: DashboardOverviewStat;
    cleanSamples: DashboardOverviewStat;
    positiveSamples: DashboardOverviewStat;
    totalSamples: DashboardOverviewStat;
  };
  trend: {
    bars: DashboardOverviewTrendBar[];
    dateRangeLabel: string;
  };
};

type DashboardOverviewOptions = {
  now?: Date;
};

/** Đọc dữ liệu thật bounded và build dashboard overview view model. */
export async function getDashboardOverviewData(
  actor: AnalyticsActor,
  port: DashboardOverviewReadPort,
  options: DashboardOverviewOptions = {}
): Promise<DashboardOverviewData> {
  const range = getLastSevenDayRange(options.now ?? new Date());
  const filters = {
    receivedFrom: range.receivedFrom,
    receivedTo: range.receivedTo,
  };
  const [summaryDataset, pcrDataset, kitCounts, recentSamples] =
    await Promise.all([
      listAnalyticsDataset(
        {
          dimensions: ["receivedDate"],
          filters,
          measures: [
            "sampleCount",
            "positiveCount",
            "cleanCount",
            "infectedCount",
          ],
          pageSize: 200,
        },
        actor,
        port
      ),
      listAnalyticsDataset(
        {
          dimensions: ["pcrMetric"],
          filters,
          measures: ["sampleCount", "positiveCount"],
          pageSize: 50,
        },
        actor,
        port
      ),
      port.countKits({ organizationId: actor.organizationId }),
      port.listRecentSamples({
        limit: 5,
        organizationId: actor.organizationId,
        receivedFrom: range.receivedFrom,
        receivedTo: range.receivedTo,
      }),
    ]);

  return {
    pcrMetrics: buildPcrMetrics(pcrDataset.rows),
    recentSamples: recentSamples.map(mapRecentSample),
    stats: buildOverviewStats(summaryDataset.totals, kitCounts),
    trend: {
      bars: buildTrendBars(summaryDataset.rows, range.receivedTo),
      dateRangeLabel: `${formatShortDate(range.receivedFrom)} - ${formatShortDate(
        range.receivedTo
      )}`,
    },
  };
}

function buildOverviewStats(
  totals: AnalyticsReadResult["totals"],
  kitCounts: { available: number; total: number }
): DashboardOverviewData["stats"] {
  const totalSamples = totals.sampleCount ?? 0;
  const positiveSamples = totals.positiveCount ?? 0;
  const cleanSamples = totals.cleanCount ?? 0;

  return {
    activeKits: {
      detail: "KIT sẵn sàng / tổng KIT",
      title: "KIT đang hoạt động",
      value: `${kitCounts.available} / ${kitCounts.total}`,
    },
    cleanSamples: {
      detail: `${formatPercent(ratio(cleanSamples, totalSamples))} tổng số mẫu xét nghiệm`,
      title: "Mẫu PCR sạch",
      value: `${cleanSamples} mẫu`,
    },
    positiveSamples: {
      detail: `${formatPercent(ratio(positiveSamples, totalSamples))} tổng số mẫu xét nghiệm`,
      title: "Mẫu dương tính PCR",
      value: `${positiveSamples} mẫu`,
    },
    totalSamples: {
      detail: "7 ngày gần nhất",
      title: "Tổng số mẫu nhận",
      value: String(totalSamples),
    },
  };
}

function buildTrendBars(
  rows: AnalyticsAggregateRow[],
  activeDate: string
): DashboardOverviewTrendBar[] {
  const maxSampleCount = Math.max(
    ...rows.map((row) => row.measureValues.sampleCount ?? 0),
    0
  );

  return rows.map((row) => {
    const receivedDate = row.dimensionValues.receivedDate ?? "";
    const sampleCount = row.measureValues.sampleCount ?? 0;
    const positiveCount = row.measureValues.positiveCount ?? 0;

    return {
      active: receivedDate === activeDate,
      day: receivedDate ? formatShortDate(receivedDate) : "Không rõ",
      positiveCount,
      positivePercent: ratio(positiveCount, maxSampleCount),
      sampleCount,
      samplePercent: ratio(sampleCount, maxSampleCount),
    };
  });
}

function buildPcrMetrics(
  rows: AnalyticsAggregateRow[]
): DashboardOverviewPcrMetric[] {
  return rows.map((row) => {
    const sampleCount = row.measureValues.sampleCount ?? 0;
    const positiveCount = row.measureValues.positiveCount ?? 0;
    const percent = ratio(positiveCount, sampleCount);

    return {
      percent,
      result: `${positiveCount} mẫu (${formatPercent(percent)})`,
      title: row.dimensionValues.pcrMetric ?? "Không rõ chỉ tiêu",
      tone: positiveCount > 0 ? "danger" : "muted",
    };
  });
}

function mapRecentSample(
  row: DashboardOverviewRecentSampleRow
): DashboardOverviewRecentSample {
  const result = row.resultLabel ?? "Chưa có kết quả";

  return {
    code: row.sampleCode,
    customer: row.customerName ?? "Không rõ khách hàng",
    receivedAt: formatFullDate(row.receivedAt),
    result,
    resultTone: getResultTone(result),
    status: getStatusLabel(row.status),
    statusTone: getStatusTone(row.status),
    type: row.sampleTypeName,
  };
}

function getLastSevenDayRange(now: Date) {
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 6);

  return {
    receivedFrom: toIsoDate(start),
    receivedTo: toIsoDate(end),
  };
}

function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return 0;
  }

  return Math.round((numerator / denominator) * 1000) / 10;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatShortDate(value: string) {
  const [, month, day] = value.slice(0, 10).split("-");

  return `${day}/${month}`;
}

function formatFullDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");

  return `${day}/${month}/${year}`;
}

function toIsoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getResultTone(
  result: string
): DashboardOverviewRecentSample["resultTone"] {
  if (POSITIVE_RESULT_PATTERN.test(result)) {
    return "danger";
  }
  if (CLEAN_RESULT_PATTERN.test(result)) {
    return "success";
  }

  return "muted";
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: "Đã duyệt",
    completed: "Đã hoàn tất",
    draft: "Bản nháp",
    in_progress: "Đang xử lý",
    received: "Đã nhận",
  };

  return labels[status] ?? status;
}

function getStatusTone(
  status: string
): DashboardOverviewRecentSample["statusTone"] {
  if (status === "approved" || status === "completed") {
    return "success";
  }
  if (status === "in_progress" || status === "received") {
    return "warning";
  }

  return "muted";
}
