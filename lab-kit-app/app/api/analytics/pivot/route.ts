import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import {
  AnalyticsQueryValidationError,
  parseAnalyticsQuery,
} from "@/lib/analytics/query";
import {
  AnalyticsUnboundedQueryError,
  getAnalyticsActor,
  listAnalyticsDataset,
} from "@/lib/analytics/operations";
import { createSupabaseDashboardOverviewPort } from "@/lib/analytics/server";

/** Return normalized pivot analytics rows for the authenticated organization. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getCurrentSession();

    if (!session) {
      throw new ResponseError(401, "Bạn cần đăng nhập để xem analytics.");
    }

    const actor = getAnalyticsActor(session);

    if (!actor) {
      throw new ResponseError(403, "Bạn không có quyền xem analytics.");
    }

    const input = await readPivotPayload(request);
    const dataset = await listAnalyticsDataset(
      input,
      actor,
      createSupabaseDashboardOverviewPort()
    );

    return NextResponse.json({
      rows: dataset.rows,
      totals: dataset.totals,
      filterSummary: dataset.filterSummary,
      warnings: dataset.warnings,
    });
  } catch (error) {
    return jsonError(error);
  }
}

async function readPivotPayload(request: NextRequest) {
  try {
    const input = await request.json();
    parseAnalyticsQuery(input);

    return input;
  } catch (error) {
    if (
      error instanceof SyntaxError ||
      error instanceof AnalyticsQueryValidationError
    ) {
      throw new ResponseError(400, "Payload pivot analytics không hợp lệ.");
    }

    throw error;
  }
}

function jsonError(error: unknown) {
  if (error instanceof ResponseError) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: error.status }
    );
  }

  if (error instanceof AnalyticsUnboundedQueryError) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 422 }
    );
  }

  return NextResponse.json(
    {
      status: "error",
      message: "Không thể tải dữ liệu pivot analytics.",
    },
    { status: 500 }
  );
}

class ResponseError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ResponseError";
  }
}
