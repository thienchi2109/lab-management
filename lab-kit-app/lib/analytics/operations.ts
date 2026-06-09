import type { AppRole } from "@/lib/auth/permissions";
import type { CurrentSession } from "@/lib/auth/session";

import {
  parseAnalyticsQuery,
  type AnalyticsDimension,
  type AnalyticsMeasure,
  type AnalyticsQuery,
} from "./query";

const ANALYTICS_READ_ROLES = ["admin", "editor", "viewer"] as const;

/** Người đọc analytics đã được xác thực và gắn tổ chức. */
export type AnalyticsActor = {
  organizationId: string;
  profileId: string;
  role: AppRole;
};

/** Một dòng aggregate analytics đã normalize. */
export type AnalyticsAggregateRow = {
  dimensionValues: Partial<Record<AnalyticsDimension, string | null>>;
  measureValues: Partial<Record<AnalyticsMeasure, number>>;
};

/** Kết quả đọc analytics từ adapter hạ tầng. */
export type AnalyticsReadResult = {
  rows: AnalyticsAggregateRow[];
  totals: Partial<Record<AnalyticsMeasure, number>>;
  warnings: string[];
};

/** Cổng đọc analytics đã scope theo tổ chức. */
export type AnalyticsReadPort = {
  listDataset(input: {
    organizationId: string;
    query: AnalyticsQuery;
  }): Promise<AnalyticsReadResult>;
};

/** View model analytics dùng bởi dashboard, API và UI báo cáo. */
export type AnalyticsDataset = AnalyticsReadResult & {
  filterSummary: string[];
  query: AnalyticsQuery;
};

/** Lỗi khi analytics query không có filter/limit đủ an toàn. */
export class AnalyticsUnboundedQueryError extends Error {
  constructor() {
    super("Truy vấn analytics cần ít nhất một bộ lọc.");
    this.name = "AnalyticsUnboundedQueryError";
  }
}

/** Chọn active membership đầu tiên được phép đọc analytics. */
export function getAnalyticsActor(
  session: CurrentSession
): AnalyticsActor | null {
  const membership = session.memberships.find((item) => {
    return item.isActive && ANALYTICS_READ_ROLES.includes(item.role);
  });

  if (!membership) {
    return null;
  }

  return {
    organizationId: membership.organizationId,
    profileId: session.profile.id,
    role: membership.role,
  };
}

/** Parse analytics input, enforce bounded reads, then call the read port. */
export async function listAnalyticsDataset(
  input: unknown,
  actor: AnalyticsActor,
  port: AnalyticsReadPort
): Promise<AnalyticsDataset> {
  const query = parseAnalyticsQuery(input);

  if (!hasBoundedFilter(query)) {
    throw new AnalyticsUnboundedQueryError();
  }

  const result = await port.listDataset({
    organizationId: actor.organizationId,
    query,
  });

  return {
    filterSummary: query.filterSummary,
    query,
    rows: result.rows,
    totals: result.totals,
    warnings: result.warnings,
  };
}

function hasBoundedFilter(query: AnalyticsQuery) {
  return Object.keys(query.filters).length > 0;
}
