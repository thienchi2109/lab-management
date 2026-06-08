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
  updatedAt: string;
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
  rows: SampleGridRow[];
};

/** Quyền hành động của người đọc trên sample grid hiện tại. */
export type SampleGridCapabilities = {
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
    rows: result.rows,
  };
}

function getSampleGridCapabilities(
  actor: SampleGridActor
): SampleGridCapabilities {
  const canWrite = actor.role === "admin" || actor.role === "editor";

  return {
    canEnterResults: canWrite,
    canManageImages: canWrite,
    canUpdateMetadata: canWrite,
  };
}
