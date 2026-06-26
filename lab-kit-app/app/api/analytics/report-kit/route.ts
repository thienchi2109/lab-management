import { type NextRequest, NextResponse } from "next/server";

import { getCurrentSession } from "@/lib/auth/session";
import {
  AnalyticsUnboundedQueryError,
  getAnalyticsActor,
} from "@/lib/analytics/operations";
import { AnalyticsQueryValidationError } from "@/lib/analytics/query";
import { listReportKitAnalyticsContract } from "@/lib/analytics/report-kit";
import { createSupabaseReportKitAnalyticsPort } from "@/lib/analytics/server-report-kit";

/** Return bounded report kit chart datasets for the authenticated organization. */
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

    const input = await readReportKitPayload(request);
    const contract = await listReportKitAnalyticsContract(
      input,
      actor,
      createSupabaseReportKitAnalyticsPort()
    );

    return NextResponse.json(contract);
  } catch (error) {
    return jsonError(error);
  }
}

async function readReportKitPayload(request: NextRequest) {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ResponseError(400, "Payload biểu đồ báo cáo kit không hợp lệ.");
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

  if (error instanceof AnalyticsQueryValidationError) {
    return NextResponse.json(
      { status: "error", message: "Payload biểu đồ báo cáo kit không hợp lệ." },
      { status: 400 }
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
      message: "Không thể tải dữ liệu biểu đồ báo cáo kit.",
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
