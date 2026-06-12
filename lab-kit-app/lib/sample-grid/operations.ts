import { parseSampleGridQuery, type SampleGridQuery } from "./query";
import type { AppRole } from "@/lib/auth/permissions";

/** Người đọc data grid mẫu đã được xác thực và gắn tổ chức. */
export type SampleGridActor = {
  organizationId: string;
  profileId: string;
  role: AppRole;
};

/** Dòng dữ liệu tối thiểu cho sample grid MVP. */
export type SampleGridRow = {
  billingStatus: string;
  companyId: string | null;
  companyName: string | null;
  customerId: string | null;
  customerName: string | null;
  id: string;
  kitBatchId: string | null;
  kitSummary: string;
  receivedAt: string;
  sampleCode: string;
  sampleTypeId: string;
  sampleTypeName: string;
  status: string;
  resultSummary: SampleGridResultSummary | null;
  updatedAt: string;
};

/** Giá trị một chỉ tiêu kết quả dùng trong summary grid. */
export type SampleGridResultMetricSummary = {
  id: string;
  code: string;
  name: string;
  unit?: string | null;
  value: unknown;
};

/** Summary một nhóm kết quả của một mẫu trong page hiện tại. */
export type SampleGridResultGroupSummary = {
  id: string;
  code: string;
  name: string;
  kqChung: string | null;
  enteredMetrics: number;
  totalMetrics: number;
  metrics: SampleGridResultMetricSummary[];
};

/** Summary kết quả gắn theo từng dòng sample grid. */
export type SampleGridResultSummary = {
  groups: SampleGridResultGroupSummary[];
};

/** Cột kết quả có thể chọn cho desktop column mode. */
export type SampleGridResultColumnOption = {
  key: string;
  label: string;
};

/** Kết quả phân trang thô từ adapter hạ tầng. */
export type SampleGridPortResult = {
  rows: SampleGridRow[];
  totalCount: number;
};

/** Cổng đọc dữ liệu mẫu đã phân trang theo tenant. */
export type SampleGridPort = {
  listSamples(input: {
    organizationId: string;
    query: SampleGridQuery;
  }): Promise<SampleGridPortResult>;
  listResultColumnOptions?(input: {
    organizationId: string;
    sampleTypeId?: string;
  }): Promise<SampleGridResultColumnOption[]>;
  listSampleResultSummaries?(input: {
    organizationId: string;
    sampleIds: string[];
  }): Promise<Record<string, SampleGridResultSummary>>;
};

/** View model phân trang trả cho các slice UI tiếp theo. */
export type SampleGridPage = {
  capabilities: SampleGridCapabilities;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  query: SampleGridQuery;
  resultColumnOptions: SampleGridResultColumnOption[];
  selectedResultColumnKeys: string[];
  rows: SampleGridRow[];
};

/** Quyền hành động của người đọc trên sample grid hiện tại. */
export type SampleGridCapabilities = {
  canExport: boolean;
  canEnterResults: boolean;
  canManageImages: boolean;
  canUpdateMetadata: boolean;
};

/** Parse URL state và đọc đúng một page dữ liệu trong tổ chức của actor. */
export async function listSampleGridPage(
  searchParams: Parameters<typeof parseSampleGridQuery>[0],
  actor: SampleGridActor,
  port: SampleGridPort
): Promise<SampleGridPage> {
  const query = parseSampleGridQuery(searchParams);
  const result = await port.listSamples({
    organizationId: actor.organizationId,
    query,
  });
  const rows = await attachResultSummaries(result.rows, actor, port);
  const resultColumnOptions = await loadResultColumnOptions(query, actor, port);
  const totalPages =
    result.totalCount > 0 ? Math.ceil(result.totalCount / query.pageSize) : 0;

  return {
    capabilities: getSampleGridCapabilities(actor),
    pageInfo: {
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
      page: query.page,
      pageSize: query.pageSize,
      totalCount: result.totalCount,
      totalPages,
    },
    query,
    resultColumnOptions,
    selectedResultColumnKeys: query.resultColumnKeys.filter((key) =>
      resultColumnOptions.some((option) => option.key === key)
    ),
    rows,
  };
}

async function attachResultSummaries(
  rows: SampleGridRow[],
  actor: SampleGridActor,
  port: SampleGridPort
) {
  if (!port.listSampleResultSummaries || rows.length === 0) {
    return rows.map((row) => ({ ...row, resultSummary: null }));
  }

  let summaries: Record<string, SampleGridResultSummary>;

  try {
    summaries = await port.listSampleResultSummaries({
      organizationId: actor.organizationId,
      sampleIds: rows.map((row) => row.id),
    });
  } catch (error) {
    console.error("Failed to fetch sample result summaries:", error);
    summaries = {};
  }

  return rows.map((row) => ({
    ...row,
    resultSummary: summaries[row.id] ?? null,
  }));
}

async function loadResultColumnOptions(
  query: SampleGridQuery,
  actor: SampleGridActor,
  port: SampleGridPort
): Promise<SampleGridResultColumnOption[]> {
  if (!port.listResultColumnOptions) {
    return [];
  }

  try {
    return await port.listResultColumnOptions({
      organizationId: actor.organizationId,
      sampleTypeId: query.filters.sampleTypeId,
    });
  } catch (error) {
    console.error("Failed to fetch sample grid result column options:", error);
    return [];
  }
}

function getSampleGridCapabilities(
  actor: SampleGridActor
): SampleGridCapabilities {
  const canWrite = actor.role === "admin" || actor.role === "editor";

  return {
    canExport: canWrite,
    canEnterResults: canWrite,
    canManageImages: canWrite,
    canUpdateMetadata: canWrite,
  };
}
