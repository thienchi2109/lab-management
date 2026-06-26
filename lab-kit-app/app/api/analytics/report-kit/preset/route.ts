import { type NextRequest, NextResponse } from "next/server";

import { getAnalyticsActor } from "@/lib/analytics/operations";
import {
  canSaveReportKitFilterPreset,
  parseReportKitFilterPresetConfig,
} from "@/lib/analytics/report-kit-presets";
import { createSupabaseReportKitPresetPort } from "@/lib/analytics/server-report-kit-presets";
import { getCurrentSession } from "@/lib/auth/session";

/** Return the organization default report filter preset for analytics charts. */
export async function GET(): Promise<NextResponse> {
  try {
    const actor = await requireReportKitPresetActor();
    const preset = await createSupabaseReportKitPresetPort().readPreset(
      actor.organizationId
    );

    return NextResponse.json(preset ?? { config: null });
  } catch (error) {
    return jsonError(error);
  }
}

/** Persist the organization default report filter preset for Admin users. */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const actor = await requireReportKitPresetActor();

    if (!canSaveReportKitFilterPreset(actor)) {
      throw new ResponseError(403, "Bạn không có quyền lưu preset báo cáo.");
    }

    const config = parseReportKitFilterPresetConfig(await readJson(request));
    const preset = await createSupabaseReportKitPresetPort().savePreset({
      actor,
      config,
    });

    return NextResponse.json(preset);
  } catch (error) {
    return jsonError(error);
  }
}

async function requireReportKitPresetActor() {
  const session = await getCurrentSession();

  if (!session) {
    throw new ResponseError(401, "Bạn cần đăng nhập để xem preset báo cáo.");
  }

  const actor = getAnalyticsActor(session);

  if (!actor) {
    throw new ResponseError(403, "Bạn không có quyền xem preset báo cáo.");
  }

  return actor;
}

async function readJson(request: NextRequest) {
  try {
    return await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ResponseError(400, "Payload preset báo cáo không hợp lệ.");
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

  if (
    error instanceof Error &&
    error.message === "Preset bộ lọc báo cáo không hợp lệ."
  ) {
    return NextResponse.json(
      { status: "error", message: "Payload preset báo cáo không hợp lệ." },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { status: "error", message: "Không thể xử lý preset báo cáo." },
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
